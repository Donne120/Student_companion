import { useState, useCallback } from "react";
import { Message } from "@/types/chat";
import { toast } from "sonner";
import { aiService } from "@/services/aiService";
import { trendingService } from "@/services/trendingService";
import { API_URL, fetchWithTimeout } from "@/config/api";

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

/** Fetch 3-4 related topic suggestions from the backend. Silent on failure. */
const fetchRelatedTopics = async (
  question: string,
  response: string
): Promise<string[]> => {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/chat/related-topics`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, response }),
      },
      5000
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data.slice(0, 4);
    if (Array.isArray(data.topics)) return data.topics.slice(0, 4);
    return [];
  } catch {
    return [];
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
    async (userText: string, history: Message[]) => {
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
          }
        );

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
    async (message: string, files: File[] = []) => {
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

      const newMessage: Message = {
        id: `${Date.now()}-user`,
        text: message,
        isAi: false,
        timestamp: Date.now(),
        attachments,
      };

      onAddMessage(currentConversationId, newMessage);
      setIsLoading(true);
      try {
        await runAi(message, [...messages, newMessage]);
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
        await runAi(newText, editedHistory);
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId, messages, onUpdateMessage, runAi]
  );

  return { isLoading, handleSendMessage, handleEditMessage };
};

interface ChatMessageHandlerProps {
  currentConversationId: string;
  messages: Message[];
  onAddMessage: (convId: string, message: Message) => void;
  onUpdateMessage: (
    convId: string,
    messageId: string,
    newText: string,
    options?: { silent?: boolean }
  ) => void;
}

const MAX_CONTEXT_MESSAGES = 10;

export const useChatMessageHandler = ({
  currentConversationId,
  messages,
  onAddMessage,
  onUpdateMessage,
}: ChatMessageHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const runAi = useCallback(
    async (userText: string, history: Message[]) => {
      // Create the AI message UP FRONT with empty text. The streaming
      // callbacks then accumulate chunks into this same message id, so the
      // UI renders character-by-character as Claude generates them.
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
              // Attach citations (KB links or Gmail deep links) to the message.
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
          }
        );
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
    async (message: string, files: File[] = []) => {
      if (!message.trim() && files.length === 0) {
        toast.error("Please enter a message or attach a file");
        return;
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

      const newMessage: Message = {
        id: `${Date.now()}-user`,
        text: message,
        isAi: false,
        timestamp: Date.now(),
        attachments,
      };

      onAddMessage(currentConversationId, newMessage);
      setIsLoading(true);
      try {
        await runAi(message, [...messages, newMessage]);
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
        await runAi(newText, editedHistory);
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId, messages, onUpdateMessage, runAi]
  );

  return { isLoading, handleSendMessage, handleEditMessage };
};
