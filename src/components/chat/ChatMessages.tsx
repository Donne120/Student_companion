import { Message } from "@/types/chat";
import { ChatMessage } from "../ChatMessage";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isUnknownResponse } from "./ChatMessageHandler";
import { AnswerSuggestionForm } from "./AnswerSuggestionForm";
import { trendingService } from "@/services/trendingService";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage: (messageId: string, newText: string) => void;
  onSuggestPrompt?: (prompt: string) => void;
  activeModel?: string;
}

const STATIC_SUGGESTIONS = [
  {
    title: "Academics",
    prompt: "What is the grading policy?",
  },
  {
    title: "Dates",
    prompt: "When does the next term start?",
  },
  {
    title: "Opportunities",
    prompt: "Which opportunities can I apply to right now?",
  },
  {
    title: "Campus life",
    prompt: "How do I join a club or student society?",
  },
];

/** Fire the companion:suggest event (populates ChatInput). */
const firePrompt = (prompt: string) => {
  window.dispatchEvent(new CustomEvent("companion:suggest", { detail: prompt }));
};

export const ChatMessages = ({
  messages,
  isLoading,
  onEditMessage,
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const firstName = (currentUser?.displayName || "").trim().split(/\s+/)[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load trending topics once when in empty state
  useEffect(() => {
    if (messages.length === 0) {
      trendingService.getTrendingTopics(6).then(setTrendingTopics);
    }
  }, [messages.length]);

  const handleFeedback = (
    messageId: string,
    type: "positive" | "negative",
    details?: string
  ) => {
    const feedback = JSON.parse(localStorage.getItem("FEEDBACK") || "[]");
    const messageData = messages.find((m) => m.id === messageId);
    feedback.push({
      id: crypto.randomUUID(),
      type,
      userQuery:
        messages.find(
          (m) =>
            !m.isAi &&
            messages.indexOf(m) < messages.indexOf(messageData as Message)
        )?.text || "",
      message: messageData?.text || "",
      details,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("FEEDBACK", JSON.stringify(feedback));
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (messages.length === 0) {
    const showTrending = trendingTopics.length >= 3;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
      <div className="min-h-[calc(100dvh-260px)] md:min-h-[calc(100vh-200px)] flex flex-col justify-center px-4 md:px-8 py-10 bg-white">
        <div className="max-w-[44rem] w-full mx-auto">
          <h1 className="text-[26px] md:text-[32px] font-semibold text-[#1C1B19] tracking-[-0.02em] leading-tight">
            {greeting}{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mt-2 text-[15px] text-[#6B6862] leading-relaxed">
            Ask about courses, deadlines, campus services or opportunities at your university.
          </p>

          {/* Suggested questions */}
          <div className="mt-8 rounded-xl border border-[#E5E3DE] divide-y divide-[#EDEBE6] overflow-hidden">
            {STATIC_SUGGESTIONS.map(({ title, prompt }) => (
              <button
                key={title}
                onClick={() => firePrompt(prompt)}
                className="group w-full flex items-center gap-4 px-4 py-3.5 text-left bg-white hover:bg-[#F7F6F3] transition-colors"
              >
                <span className="hidden sm:block w-32 flex-shrink-0 text-[13px] text-[#8C887F]">{title}</span>
                <span className="flex-1 min-w-0 text-[14px] text-[#262521]">{prompt}</span>
                <ArrowRight className="h-4 w-4 text-[#B5B0A5] group-hover:text-[#1C1B19] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* What other students are asking */}
          {showTrending && (
            <div className="mt-8">
              <p className="text-[13px] text-[#8C887F] mb-2.5">Popular with students this week</p>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => firePrompt(topic)}
                    className="px-3 py-1.5 rounded-lg border border-[#E5E3DE] bg-white text-[13px] text-[#4A4843] hover:border-[#C8C4BA] hover:text-[#1C1B19] transition-colors"
                  >
                    {topic.length > 50 ? topic.slice(0, 50) + "…" : topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Message list ──────────────────────────────────────────────────────────
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {messages.map((message, idx) => {
        // Find the user question that preceded this AI message
        const precedingUserMsg =
          message.isAi && idx > 0 && !messages[idx - 1].isAi
            ? messages[idx - 1].text
            : null;

        return (
          <div key={message.id}>
            <ChatMessage
              message={message.text}
              isAi={message.isAi}
              attachments={message.attachments}
              sources={message.sources}
              onEdit={(newText) => onEditMessage(message.id, newText)}
              onFeedback={(type, details) => handleFeedback(message.id, type, details)}
              isLatest={idx === messages.length - 1 && !isLoading}
            />

            {/* Related topic chips — shown below finished AI messages */}
            {message.isAi &&
              message.relatedTopics &&
              message.relatedTopics.length > 0 && (
                <div className="px-4 md:px-8 pb-4">
                <div className="max-w-[44rem] mx-auto">
                  <p className="text-xs font-medium text-[#6B6862] mb-2">Related</p>
                  <div className="flex flex-wrap gap-2">
                    {message.relatedTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => firePrompt(topic)}
                        className="px-3 py-1.5 rounded-lg border border-[#E5E3DE] bg-white text-[13px] text-[#4A4843] hover:border-[#C8C4BA] hover:text-[#1C1B19] transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
                </div>
              )}

            {/* Suggest-an-answer form — shown when bot doesn't know */}
            {message.isAi &&
              isUnknownResponse(message.text) &&
              precedingUserMsg && (
                <div className="px-4 md:px-8 pb-4 max-w-[44rem] mx-auto">
                  <AnswerSuggestionForm questionText={precedingUserMsg} />
                </div>
              )}
          </div>
        );
      })}

      {isLoading && (
        <div className="pt-5 pb-3 px-4 md:px-8 bg-white">
          <div className="max-w-[44rem] mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo-icon.png" alt="" className="h-5 w-5 object-contain" />
              <span className="text-[13px] font-semibold text-[#1C1B19]">Student Companion</span>
            </div>
            <div className="flex items-center gap-1.5 h-6" aria-label="Writing an answer">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9C978C] animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#9C978C] animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#9C978C] animate-bounce" />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
