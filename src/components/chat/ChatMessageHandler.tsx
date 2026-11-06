import { useState, useCallback } from "react";
import { Message } from "@/types/chat";
import { toast } from "sonner";
import { aiService, type AttachmentPayload } from "@/services/aiService";
import { toAttachmentPayload } from "@/lib/attachments";
import { speak } from "@/utils/speech";
import { stripSourceMarkers } from "@/lib/citations";
import { splitQuickReplies } from "@/lib/quickReplies";

/** An answer as it should be heard: no markdown symbols, links read as their text. */
const toSpeech = (markdown: string): string =>
  splitQuickReplies(stripSourceMarkers(markdown)).body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>]+/g, "")
    .replace(/\n{2,}/g, ". ")
    .trim();
import { trendingService } from "@/services/trendingService";
import { API_URL, authHeader, fetchWithTimeout } from "@/config/api";

interface ChatMessageHandlerProps {
  currentConversationId: string;
  messages: Message[];
  onAddMessage: (convId: string, message: Message) => void;
  onUpdateMessage: (
    convId: string,
    messageId: string,
    newText: string,
    options?: { silent?: boolean; sources?: Message["sources"]; relatedTopics?: string[] }
  ) => void;
}

const MAX_CONTEXT_MESSAGES = 10;

// The files last attached in each chat, kept in memory (never saved) so a
// follow-up like "and what does page 2 say?" can still read them.
const recentFiles = new Map<string, AttachmentPayload[]>();

const DEFAULT_FILE_QUESTION =
  "Please look at what I've attached: tell me what it is and summarise what matters for me.";

/** Detect whether the AI response signals that it doesn't know the answer. */
export const isUnknownResponse = (text: string): boolean => {
  const lower = text.toLowerCase();
  return (
    lower.includes("i don't have information") ||
    lower.includes("i don't know") ||
    lower.includes("i'm not sure") ||
    lower.includes("i couldn't find") ||
    lower.includes("i cannot find") ||
    lower.includes("no information available") ||
    lower.includes("not in my knowledge")
  );
};

/** Client-side fallback: extract key noun phrases from the question + response. */
const deriveTopicsLocally = (question: string, response: string): string[] => {
  // Topic seeds paired with trigger keywords — generic across any institution
  const seedMap: [RegExp, string][] = [
    [/grading|grade|gpa|score|mark/i, "Grading policy"],
    [/scholarship|funding|financial aid|bursary/i, "Scholarship opportunities"],
    [/internship|placement|work experience/i, "Internship programs"],
    [/deadline|due date|registration|enroll/i, "Upcoming deadlines"],
    [/housing|accommodation|dormitory|hostel/i, "Student housing"],
    [/graduation|degree|transcript|certificate/i, "Graduation requirements"],
    [/course|module|class|credit/i, "Course registration"],
    [/fee|tuition|payment|invoice/i, "Tuition and fees"],
    [/library|resource|research|journal/i, "Library and research resources"],
    [/career|job|employ|cv|resume/i, "Career services"],
    [/health|wellness|counseling|mental/i, "Student wellness resources"],
    [/club|society|event|activity/i, "Student clubs and activities"],
    [/visa|travel|international|passport/i, "International student support"],
    [/exam|test|assessment|quiz/i, "Exam schedules and policies"],
    [/wifi|internet|campus|facility/i, "Campus facilities"],
  ];

  const combined = `${question} ${response}`;
  const matched: string[] = [];
  for (const [pattern, label] of seedMap) {
    if (pattern.test(combined) && !matched.includes(label)) {
      matched.push(label);
      if (matched.length === 4) break;
    }
  }

  // If fewer than 3 matched, pad with generic follow-ups
  const fallbacks = [
    "Academic calendar",
    "Student support services",
    "Campus life",
    "Opportunities for students",
  ];
  for (const f of fallbacks) {
    if (matched.length >= 3) break;
    if (!matched.includes(f)) matched.push(f);
  }

  return matched.slice(0, 4);
};

/** Fetch 3–4 related topic suggestions. Tries backend first, falls back to local derivation. */
const fetchRelatedTopics = async (
  question: string,
  response: string
): Promise<string[]> => {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/chat/related-topics`,
      {
        method: "POST",
        // The backend answers from the caller's own university's knowledge
        // base, so it needs to know who is asking.
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({ question, response }),
      },
      5000
    );
    if (!res.ok) return deriveTopicsLocally(question, response);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data.slice(0, 4);
    if (Array.isArray(data.topics) && data.topics.length > 0) return data.topics.slice(0, 4);
    return deriveTopicsLocally(question, response);
  } catch {
    return deriveTopicsLocally(question, response);
  }
};

export const useChatMessageHandler = ({
  currentConversationId,
  messages,
  onAddMessage,
  onUpdateMessage,
}: ChatMessageHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const runAi = useCallback(
    async (userText: string, history: Message[], attachments: AttachmentPayload[] = [], readAloud = false) => {
      const aiMessageId = `${Date.now()}-ai`;
      const aiMessage: Message = {
        id: aiMessageId,
        text: "",
        isAi: true,
        timestamp: Date.now(),
      };
      onAddMessage(currentConversationId, aiMessage);

      let accumulated = "";
      try {
        await aiService.streamResponse(
          userText,
          history.slice(-MAX_CONTEXT_MESSAGES),
          {
            onChunk: (text) => {
              accumulated += text;
              onUpdateMessage(currentConversationId, aiMessageId, accumulated, { silent: true });
            },
            onSources: (sources) => {
              onUpdateMessage(currentConversationId, aiMessageId, accumulated, {
                silent: true,
                sources,
              });
            },
            onError: (message) => {
              toast.error(message);
              if (!accumulated) {
                onUpdateMessage(
                  currentConversationId,
                  aiMessageId,
                  "I'm sorry — I couldn't generate a response just now. Please try again.",
                  { silent: true }
                );
              }
            },
          },
          attachments
        );

        // Voice mode: a spoken question gets a spoken answer, in the
        // Companion's voice (backend /api/tts, browser voice as fallback).
        if (readAloud && accumulated.trim()) {
          speak(toSpeech(accumulated));
        }

        // After streaming finishes: fetch related topics (non-blocking)
        if (accumulated.trim()) {
          fetchRelatedTopics(userText, accumulated).then((topics) => {
            if (topics.length > 0) {
              onUpdateMessage(currentConversationId, aiMessageId, accumulated, {
                silent: true,
                relatedTopics: topics,
              });
            }
          });
        }
      } catch (error) {
        console.error("Streaming error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to get response");
        if (!accumulated) {
          onUpdateMessage(
            currentConversationId,
            aiMessageId,
            "I'm sorry — I couldn't generate a response just now. Please try again."
          );
        }
      }
    },
    [currentConversationId, onAddMessage, onUpdateMessage]
  );

  const handleSendMessage = useCallback(
    async (message: string, files: File[] = [], viaVoice = false) => {
      if (!message.trim() && files.length === 0) {
        toast.error("Please enter a message or attach a file");
        return;
      }

      // Track anonymously for trending
      if (message.trim()) {
        trendingService.trackQuestion(message.trim());
      }

      const attachments =
        files.length > 0
          ? await Promise.all(
              files.map(async (file) => ({
                type: file.type.startsWith("image/") ? ("image" as const) : ("file" as const),
                url: URL.createObjectURL(file),
                name: file.name,
              }))
            )
          : undefined;

      // Read the files for the backend. A new attachment replaces the chat's
      // earlier ones; a follow-up without files reuses them.
      let payload: AttachmentPayload[] = [];
      if (files.length > 0) {
        try {
          payload = await Promise.all(files.map(toAttachmentPayload));
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not read that file.");
          return;
        }
        recentFiles.set(currentConversationId, payload);
      } else {
        payload = recentFiles.get(currentConversationId) ?? [];
      }
      const question = message.trim() || DEFAULT_FILE_QUESTION;

      const newMessage: Message = {
        id: `${Date.now()}-user`,
        text: message.trim() ? message : files.map((f) => f.name).join(", "),
        isAi: false,
        timestamp: Date.now(),
        attachments,
      };

      onAddMessage(currentConversationId, newMessage);
      setIsLoading(true);
      try {
        await runAi(question, [...messages, newMessage], payload, viaVoice);
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId, messages, onAddMessage, runAi]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newText: string) => {
      if (!newText.trim()) {
        toast.error("Message cannot be empty");
        return;
      }

      const target = messages.find((m) => m.id === messageId);
      if (!target) return;

      onUpdateMessage(currentConversationId, messageId, newText);

      if (target.isAi) return;

      const editedHistory = messages
        .slice(0, messages.findIndex((m) => m.id === messageId) + 1)
        .map((m) => (m.id === messageId ? { ...m, text: newText } : m));

      setIsLoading(true);
      try {
        await runAi(newText, editedHistory, recentFiles.get(currentConversationId) ?? []);
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId, messages, onUpdateMessage, runAi]
  );

  return { isLoading, handleSendMessage, handleEditMessage };
};
