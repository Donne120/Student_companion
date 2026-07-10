import { Message } from "@/types/chat";
import { ChatMessage } from "../ChatMessage";
import { BookOpen, Calendar, Compass, Loader, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage: (messageId: string, newText: string) => void;
  activeModel?: string;
}

const SUGGESTIONS = [
  {
    icon: BookOpen,
    title: "Academic policies",
    prompt: "What is ALU's grading policy?",
  },
  {
    icon: Calendar,
    title: "Important dates",
    prompt: "When does the next term start?",
  },
  {
    icon: Compass,
    title: "Campus services",
    prompt: "How do I contact student housing?",
  },
  {
    icon: Sparkles,
    title: "Get started",
    prompt: "What can you help me with?",
  },
];

export const ChatMessages = ({
  messages,
  isLoading,
  onEditMessage,
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

  if (messages.length === 0) {
    return (
      <div className="min-h-[calc(100dvh-260px)] md:min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4 py-8 md:py-12 bg-white">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#FBF7E9] border border-[#E8DDB0] mb-4 md:mb-6">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-[#D4AF37]" />
          </div>
          <h1 className="font-serif text-[28px] md:text-5xl text-[#1A1A1A] tracking-tight mb-2 md:mb-3 leading-tight">
            How can I help you today?
          </h1>
          <p className="text-sm md:text-base text-[#1A1A1A]/60 mb-6 md:mb-10 px-2">
            Ask anything about ALU — academics, campus life, policies, or events.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            {SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
              <button
                key={title}
                onClick={() => {
                  const event = new CustomEvent("companion:suggest", {
                    detail: prompt,
                  });
                  window.dispatchEvent(event);
                }}
                className="group text-left p-4 rounded-xl border border-[#E8DDB0] bg-white hover:border-[#D4AF37] hover:bg-[#FBF7E9]/40 transition-all"
              >
                <Icon className="h-4 w-4 text-[#B8941F] mb-2" />
                <div className="text-sm font-medium text-[#1A1A1A] mb-1">{title}</div>
                <div className="text-xs text-[#1A1A1A]/60 leading-relaxed">{prompt}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message.text}
          isAi={message.isAi}
          attachments={message.attachments}
          sources={message.sources}
          onEdit={(newText) => onEditMessage(message.id, newText)}
          onFeedback={(type, details) => handleFeedback(message.id, type, details)}
        />
      ))}
      {isLoading && (
        <div className="py-6 px-4 md:px-8 bg-white">
          <div className="max-w-5xl mx-auto flex gap-4 items-start">
            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse mt-2" />
            <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/60">
              <Loader className="h-4 w-4 animate-spin text-[#D4AF37]" />
              <span>Thinking…</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
