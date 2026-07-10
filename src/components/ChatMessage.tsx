import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Check, Copy, Edit, ExternalLink, Mail, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import type { MessageSource } from "@/types/chat";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isAi?: boolean;
  attachments?: Array<{ type: "image" | "file"; url: string; name: string }>;
  sources?: MessageSource[];
  onEdit?: (newMessage: string) => void;
  onFeedback?: (type: "positive" | "negative", details?: string) => void;
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
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
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
    <div className={cn("w-full py-6 px-4 md:px-8 group overflow-x-hidden", isAi ? "bg-[#FBF7E9]/30" : "bg-white")}>
      <div className={cn("max-w-3xl mx-auto min-w-0", !isAi && "flex justify-end")}>
        <div
          className={cn(
            "space-y-2 min-w-0 max-w-full",
            !isAi && "max-w-[85%] md:max-w-[75%] bg-[#F4F4F4] text-[#1A1A1A] rounded-3xl px-4 py-2.5 break-words"
          )}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="w-full bg-white text-[#1A1A1A] rounded-lg p-3 min-h-[100px] border border-[#E8DDB0] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-y"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditedMessage(message);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-md text-[#1A1A1A]/70 hover:bg-[#FBF7E9]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 text-sm rounded-md bg-[#1A1A1A] hover:bg-black text-white font-medium"
                >
                  Save & resend
                </button>
              </div>
            </div>
          ) : (
            <div className="text-left text-[15px] leading-[1.75] text-[#1A1A1A] [overflow-wrap:anywhere] min-w-0 max-w-full">
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => (
                    <p className="my-4 first:mt-0 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-4 pl-6 list-disc list-outside space-y-2 marker:text-[#D4AF37]">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-4 pl-6 list-decimal list-outside space-y-2 marker:text-[#B8941F] marker:font-semibold">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="pl-1.5 leading-[1.75]">{children}</li>,
                  h1: ({ children }) => (
                    <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mt-8 mb-4 first:mt-0 leading-tight tracking-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] mt-7 mb-3 first:mt-0 leading-tight tracking-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-semibold text-lg text-[#1A1A1A] mt-6 mb-2 first:mt-0 tracking-tight">
                      {children}
                    </h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[#1A1A1A]">{children}</strong>
                  ),
                  hr: () => <hr className="my-8 border-t border-[#E8DDB0]" />,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-[#D4AF37] pl-4 italic my-4 text-[#1A1A1A]/75">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#B8941F] hover:underline font-medium"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 rounded-lg border border-[#E8DDB0]">
                      <table className="min-w-full">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-[#FBF7E9]">{children}</thead>,
                  th: ({ children }) => (
                    <th className="px-4 py-2 text-left font-semibold text-[#1A1A1A] text-sm border-b border-[#E8DDB0]">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 text-sm border-b border-[#E8DDB0] last:border-b-0">
                      {children}
                    </td>
                  ),
                  code: ({ inline, className, children, ...props }: CodeProps) => {
                    const match = /language-(\w+)/.exec(className || "");
                    if (!inline && match) {
                      return (
                        <div className="my-4 rounded-lg overflow-hidden border border-[#E8DDB0]">
                          <div className="flex items-center justify-between bg-[#FBF7E9] border-b border-[#E8DDB0] px-3 py-1.5">
                            <span className="text-xs font-medium text-[#1A1A1A]/70">{match[1]}</span>
                            <button
                              onClick={handleCopy}
                              className="text-xs text-[#1A1A1A]/60 hover:text-[#1A1A1A] flex items-center gap-1"
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
                        className="bg-[#FBF7E9] text-[#1A1A1A] px-1.5 py-0.5 rounded font-mono text-[0.85em]"
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message}
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
                    className="rounded-lg max-h-48 border border-[#E8DDB0]"
                  />
                ) : (
                  <a
                    key={i}
                    href={att.url}
                    download={att.name}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FBF7E9] border border-[#E8DDB0] text-sm text-[#1A1A1A] hover:bg-[#F4ECCC]"
                  >
                    📎 {att.name}
                  </a>
                )
              )}
            </div>
          )}

          {/* Sources: knowledge-base citations or "open in Gmail" links */}
          {isAi && sources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {sources.map((src, i) => {
                const isGmail = (src.url || "").startsWith("https://mail.google.com/");
                const Icon = isGmail ? Mail : ExternalLink;
                const label = src.title || src.source || "Source";
                return src.url ? (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 max-w-full px-3 py-1.5 rounded-md bg-[#FBF7E9] border border-[#E8DDB0] text-xs text-[#1A1A1A] hover:bg-[#F4ECCC] transition-colors"
                    title={src.source ? `${src.source} — ${label}` : label}
                  >
                    <Icon className="h-3.5 w-3.5 text-[#B8941F] flex-shrink-0" />
                    <span className="truncate">{isGmail ? `Open in Gmail: ${label}` : label}</span>
                  </a>
                ) : (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 max-w-full px-3 py-1.5 rounded-md bg-[#FBF7E9] border border-[#E8DDB0] text-xs text-[#1A1A1A]/70"
                  >
                    <span className="truncate">{label}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Action bar */}
          {!isEditing && (
            <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded text-[#1A1A1A]/50 hover:bg-[#FBF7E9] hover:text-[#1A1A1A]"
                aria-label="Copy message"
                title="Copy"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              {!isAi && (
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded text-[#1A1A1A]/50 hover:bg-[#FBF7E9] hover:text-[#1A1A1A]"
                  aria-label="Edit message"
                  title="Edit"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              )}
              {isAi && (
                <>
                  <button
                    onClick={() => handleFeedback("positive")}
                    className={cn(
                      "p-1.5 rounded hover:bg-[#FBF7E9]",
                      feedbackGiven === "positive"
                        ? "text-emerald-600"
                        : "text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
                    )}
                    aria-label="Good response"
                    title="Good response"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback("negative")}
                    className={cn(
                      "p-1.5 rounded hover:bg-[#FBF7E9]",
                      feedbackGiven === "negative"
                        ? "text-red-600"
                        : "text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
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
