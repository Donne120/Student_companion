import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Check, Copy, Edit, ExternalLink, Mail, ThumbsDown, ThumbsUp, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import type { MessageSource } from "@/types/chat";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { speak, stopSpeaking, isSpeaking } from "@/utils/speech";
import { stripSourceMarkers } from "@/lib/citations";
import { sendQuickReply, splitQuickReplies } from "@/lib/quickReplies";

interface ChatMessageProps {
  message: string;
  isAi?: boolean;
  attachments?: Array<{ type: "image" | "file"; url: string; name: string }>;
  sources?: MessageSource[];
  onEdit?: (newMessage: string) => void;
  onFeedback?: (type: "positive" | "negative", details?: string) => void;
  /** The newest answer: only its quick replies are shown as buttons. */
  isLatest?: boolean;
}

interface CodeProps {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}

export const ChatMessage = ({
  message,
  isAi = false,
  attachments = [],
  sources = [],
  onEdit,
  onFeedback,
  isLatest = false,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);
  const [speaking, setSpeaking] = useState(false);
  // What the student sees, hears and copies: without "【Source 8】" markers.
  // and without the "Quick replies:" line, which becomes buttons instead.
  const { body: text, replies: quickReplies } = isAi
    ? splitQuickReplies(stripSourceMarkers(message))
    : { body: message, replies: [] as string[] };
  // Sources worth showing: the ones with a link, each once.
  const linkedSources = sources.filter(
    (src, i) => src.url && sources.findIndex((o) => o.url === src.url) === i
  );

  const handleSpeak = () => {
    if (speaking || isSpeaking()) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      // Strip markdown symbols for cleaner speech
      const plainText = text
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/>\s/g, "")
        .trim();
      setSpeaking(true);
      speak(plainText, {
        onEnd: () => setSpeaking(false),
        onBlocked: () => {
          setSpeaking(false);
          toast.error("Could not play audio — try clicking elsewhere first");
        },
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(editedMessage);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedbackGiven(type);
    onFeedback?.(type);
  };

  return (
    <div className={cn("w-full px-4 md:px-8 group overflow-x-hidden", isAi ? "pt-5 pb-3" : "pt-6 pb-8")}>
      <div className={cn("max-w-[44rem] mx-auto min-w-0", !isAi && "flex justify-end")}>
        <div
          className={cn(
            "min-w-0 max-w-full",
            isAi ? "space-y-2" : "relative max-w-[85%] md:max-w-[75%] bg-[#F1F0EC] text-[#1C1B19] rounded-2xl rounded-br-md px-4 py-2.5 break-words"
          )}
        >
          {isAi && !isEditing && (
            <div className="flex items-center gap-2 mb-1 select-none">
              <img src="/logo-icon.png" alt="" className="h-5 w-5 object-contain" />
              <span className="text-[13px] font-semibold text-[#1C1B19]">Student Companion</span>
            </div>
          )}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="w-full bg-white text-[#1C1B19] rounded-lg p-3 min-h-[100px] border border-[#E5E3DE] focus:outline-none focus:border-[#9C978C] focus:ring-1 focus:ring-[#9C978C] resize-y"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditedMessage(message);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-md text-[#1C1B19]/70 hover:bg-[#F4F3F0]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 text-sm rounded-md bg-[#1C1B19] hover:bg-black text-white font-medium"
                >
                  Save & resend
                </button>
              </div>
            </div>
          ) : (
            <div className={cn("text-left text-[15px] text-[#262521] [overflow-wrap:anywhere] min-w-0 max-w-full", isAi ? "leading-[1.7]" : "leading-[1.6]")}>
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => (
                    <p className="my-4 first:mt-0 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-4 pl-6 list-disc list-outside space-y-2 marker:text-[#8C887F]">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-4 pl-6 list-decimal list-outside space-y-2 marker:text-[#6B6862]">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="pl-1.5 leading-[1.75]">{children}</li>,
                  h1: ({ children }) => (
                    <h1 className="text-[1.75rem] font-semibold text-[#1C1B19] mt-8 mb-4 first:mt-0 leading-tight tracking-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-[#1C1B19] mt-7 mb-3 first:mt-0 leading-tight tracking-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-semibold text-lg text-[#1C1B19] mt-6 mb-2 first:mt-0 tracking-tight">
                      {children}
                    </h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[#1C1B19]">{children}</strong>
                  ),
                  hr: () => <hr className="my-8 border-t border-[#E5E3DE]" />,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-[#B8952B] pl-4 italic my-4 text-[#1C1B19]/75">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7A5C12] underline decoration-[#7A5C12]/35 underline-offset-[3px] hover:decoration-[#7A5C12]"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 rounded-lg border border-[#E5E3DE]">
                      <table className="min-w-full">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-[#F4F3F0]">{children}</thead>,
                  th: ({ children }) => (
                    <th className="px-4 py-2 text-left font-semibold text-[#1C1B19] text-sm border-b border-[#E5E3DE]">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 text-sm border-b border-[#E5E3DE] last:border-b-0">
                      {children}
                    </td>
                  ),
                  code: ({ inline, className, children, ...props }: CodeProps) => {
                    const match = /language-(\w+)/.exec(className || "");
                    if (!inline && match) {
                      return (
                        <div className="my-4 rounded-lg overflow-hidden border border-[#E5E3DE]">
                          <div className="flex items-center justify-between bg-[#F4F3F0] border-b border-[#E5E3DE] px-3 py-1.5">
                            <span className="text-xs font-medium text-[#1C1B19]/70">{match[1]}</span>
                            <button
                              onClick={handleCopy}
                              className="text-xs text-[#1C1B19]/60 hover:text-[#1C1B19] flex items-center gap-1"
                            >
                              {copied ? (
                                <>
                                  <Check className="h-3 w-3" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" /> Copy
                                </>
                              )}
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={oneLight}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              background: "#FAF9F6",
                              padding: "1rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code
                        {...props}
                        className="bg-[#F4F3F0] text-[#1C1B19] px-1.5 py-0.5 rounded font-mono text-[0.85em]"
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {attachments.map((att, i) =>
                att.type === "image" ? (
                  <img
                    key={i}
                    src={att.url}
                    alt={att.name}
                    className="rounded-lg max-h-48 border border-[#E5E3DE]"
                  />
                ) : (
                  <a
                    key={i}
                    href={att.url}
                    download={att.name}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#F4F3F0] border border-[#E5E3DE] text-sm text-[#1C1B19] hover:bg-[#EAE8E3]"
                  >
                    📎 {att.name}
                  </a>
                )
              )}
            </div>
          )}

          {/* Sources: knowledge-base citations or "open in Gmail" links */}
          {/* Quick replies: tap to answer the Companion's question */}
          {isAi && isLatest && quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2" role="group" aria-label="Quick replies">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => sendQuickReply(reply)}
                  className="px-3.5 py-1.5 rounded-full border border-[#1C1B19]/15 bg-white text-[13px] font-medium text-[#1C1B19] hover:bg-[#1C1B19] hover:text-white hover:border-[#1C1B19] transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {isAi && linkedSources.length > 0 && (
            <div className="mt-5 pt-3 border-t border-[#EDEBE6]">
              <p className="text-xs font-medium text-[#6B6862] mb-1.5">Sources</p>
              <ol className="space-y-1">
              {linkedSources.map((src, i) => {
                const isGmail = (src.url || "").startsWith("https://mail.google.com/");
                const Icon = isGmail ? Mail : ExternalLink;
                // Some titles are the first line of a document ("# Overview - ..."):
                // drop markdown symbols and keep it short.
                const raw = (src.title || src.source || "Source").replace(/[#*_`>]+/g, " ").replace(/\s+/g, " ").trim();
                const label = raw.length > 60 ? `${raw.slice(0, 57).trimEnd()}…` : raw;
                return src.url ? (
                  <li key={i} className="min-w-0">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/src inline-flex items-baseline gap-2 max-w-full text-[13px] text-[#4A4843] hover:text-[#1C1B19]"
                      title={src.source ? `${src.source} — ${label}` : label}
                    >
                      <span className="text-[#9C978C] tabular-nums">{i + 1}.</span>
                      <span className="truncate underline decoration-transparent underline-offset-2 group-hover/src:decoration-current">
                        {isGmail ? `Open in Gmail: ${label}` : label}
                      </span>
                      <Icon className="h-3 w-3 text-[#9C978C] flex-shrink-0 self-center" />
                    </a>
                  </li>
                ) : (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 max-w-full px-3 py-1.5 rounded-md bg-[#F4F3F0] border border-[#E5E3DE] text-xs text-[#1C1B19]/70"
                  >
                    <span className="truncate">{label}</span>
                  </span>
                );
              })}
              </ol>
            </div>
          )}

          {/* Action bar (under a question it sits outside the bubble) */}
          {!isEditing && (
            <div className={cn(
              "flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity",
              isAi ? "pt-1 -ml-1.5" : "absolute -bottom-8 right-0"
            )}>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded text-[#1C1B19]/50 hover:bg-[#F4F3F0] hover:text-[#1C1B19]"
                aria-label="Copy message"
                title="Copy"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              {!isAi && (
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded text-[#1C1B19]/50 hover:bg-[#F4F3F0] hover:text-[#1C1B19]"
                  aria-label="Edit message"
                  title="Edit"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              )}
              {isAi && (
                <>
                  <button
                    onClick={handleSpeak}
                    className={cn(
                      "p-1.5 rounded hover:bg-[#F4F3F0] transition-colors",
                      speaking
                        ? "text-[#8A6A16] bg-[#F4F3F0]"
                        : "text-[#1C1B19]/50 hover:text-[#1C1B19]"
                    )}
                    aria-label={speaking ? "Stop reading" : "Read aloud"}
                    title={speaking ? "Stop reading" : "Read aloud"}
                  >
                    {speaking ? (
                      <VolumeX className="h-3.5 w-3.5" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleFeedback("positive")}
                    className={cn(
                      "p-1.5 rounded hover:bg-[#F4F3F0]",
                      feedbackGiven === "positive"
                        ? "text-emerald-600"
                        : "text-[#1C1B19]/50 hover:text-[#1C1B19]"
                    )}
                    aria-label="Good response"
                    title="Good response"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback("negative")}
                    className={cn(
                      "p-1.5 rounded hover:bg-[#F4F3F0]",
                      feedbackGiven === "negative"
                        ? "text-red-600"
                        : "text-[#1C1B19]/50 hover:text-[#1C1B19]"
                    )}
                    aria-label="Bad response"
                    title="Bad response"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
