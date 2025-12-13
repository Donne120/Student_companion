import { useState, useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, ThumbsUp, ThumbsDown, Edit2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { ChatCard } from "./ui/chat-card";
import { StructuredResponse } from "./chat/StructuredResponse";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { enhanceResponse, formatEnhancedResponse } from "@/utils/enhanceResponse";

interface ChatMessageProps {
  message: string;
  isAi?: boolean;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
  onEdit?: (newMessage: string) => void;
  onFeedback?: (type: 'positive' | 'negative', details?: string) => void;
}

import type { ReactNode } from "react";

interface CodeProps {
  inline?: boolean;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}

const tryParseCard = (text: string) => {
  if (!text.includes('Title:')) return null;
  try {
    const title = text.match(/Title:\s*([^\n]+)/)?.[1] || '';
    const subtitle = text.match(/Subtitle:\s*([^\n]+)/)?.[1];
    const description = text.match(/Description:\s*([^\n]+)/)?.[1] || '';
    const buttonsMatch = text.match(/Buttons:\n((?:- [^\n]+\n?)*)/);
    const buttons = buttonsMatch?.[1].split('\n').filter(line => line.startsWith('- ')).map(button => {
      const [icon, label, link] = button.replace('- ', '').match(/([^\s]+)\s+([^(]+)\s*\(link:\s*([^)]+)\)/)?.slice(1) || [];
      return {
        icon,
        label: label.trim(),
        link
      };
    }) || [];
    return {
      title,
      subtitle,
      description,
      buttons
    };
  } catch (error) {
    console.error('Error parsing card:', error);
    return null;
  }
};

/**
 * Check if message is a structured response (has Quick Actions or Resources sections)
 */
const isStructuredResponse = (text: string): boolean => {
  return (
    text.includes('🔗 Quick Actions') ||
    text.includes('**Quick Actions:**') ||
    text.includes('📚 Resources') ||
    text.includes('📞 Need Help') ||
    text.includes('**📚 Resources & Links:**') ||
    text.includes('**📞 Need Help? Contact Us:**')
  );
};

export const ChatMessage = ({
  message,
  isAi = false,
  attachments = [],
  onEdit,
  onFeedback
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);

  const cardData = tryParseCard(message);
  
  // Enhance AI responses to add structure
  const enhancedMessage = useMemo(() => {
    if (!isAi) return message;
    
    // Check if already structured
    if (isStructuredResponse(message)) return message;
    
    // Enhance plain responses
    const enhanced = enhanceResponse(message);
    if (enhanced.hasStructure) {
      return formatEnhancedResponse(enhanced);
    }
    
    return message;
  }, [message, isAi]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedMessage(message);
  };

  const handleSaveEdit = () => {
    if (editedMessage.trim() && editedMessage !== message) {
      onEdit?.(editedMessage);
      toast.success("Message updated");
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedMessage(message);
  };

  const submitFeedback = (type: 'positive' | 'negative') => {
    onFeedback?.(type);
    setFeedbackGiven(true);
    toast.success("Thank you for your feedback!");
  };

  return (
    <div 
      className={cn(
        "w-full py-2 sm:py-4 px-2 sm:px-4 group hover:bg-brand-blue-dark/30 transition-colors",
        isAi ? "bg-transparent" : "bg-brand-blue-dark/20"
      )}
    >
      <div className={cn(
        "max-w-3xl mx-auto flex gap-2 sm:gap-4 md:gap-6 items-start",
        isAi ? "flex-row" : "flex-row-reverse" // User messages on right
      )}>
        {/* Avatar - Only show for AI messages */}
        {isAi && (
          <div className="flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="ALU AI" 
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain"
            />
          </div>
        )}

        {/* Content */}
        <div className={cn(
          "flex-1 min-w-0 space-y-2 sm:space-y-3",
          !isAi && "text-right" // Align user text to right
        )}>
          {/* Message Content */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="min-h-[100px] bg-brand-blue border-brand-gold/30 text-white resize-none focus:border-brand-gold/50"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  className="bg-brand-gold hover:bg-brand-gold-light text-brand-blue-dark"
                >
                  Save & Submit
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="outline"
                  className="border-brand-gold/30 hover:bg-brand-blue"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "text-gray-100",
              isAi ? "text-left" : "text-right" // AI left, User right
            )}>
              {cardData ? (
                <ChatCard {...cardData} />
              ) : isAi && isStructuredResponse(enhancedMessage) ? (
                <StructuredResponse content={enhancedMessage} />
              ) : (
                <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code: ({
                    inline,
                    className,
                    children,
                    ...props
                  }: CodeProps) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="my-2 sm:my-4 rounded-lg overflow-hidden border border-brand-gold/20">
                        <div className="bg-brand-blue px-2 sm:px-4 py-1.5 sm:py-2 flex justify-between items-center text-[10px] sm:text-xs text-gray-400">
                          <span>{match[1]}</span>
                          <button 
                            onClick={handleCopy} 
                            className="hover:text-brand-gold transition-colors"
                          >
                            {copied ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </button>
                        </div>
                        <SyntaxHighlighter 
                          style={atomDark} 
                          language={match[1]} 
                          PreTag="div" 
                          customStyle={{
                            margin: 0,
                            background: '#0A2463',
                            padding: '0.75rem',
                            fontSize: '0.75rem'
                          }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code {...props} className="bg-brand-blue/50 px-1 sm:px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono text-brand-gold-light">
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className={cn("mb-2 sm:mb-4 leading-6 sm:leading-7 text-sm sm:text-base", isAi ? "text-left" : "text-right")}>{children}</p>,
                  ul: ({ children }) => <ul className={cn("mb-2 sm:mb-4 pl-4 sm:pl-6 list-disc space-y-1 sm:space-y-2 marker:text-brand-gold text-sm sm:text-base", !isAi && "list-inside")}>{children}</ul>,
                  ol: ({ children }) => <ol className={cn("mb-2 sm:mb-4 pl-4 sm:pl-6 list-decimal space-y-1 sm:space-y-2 marker:text-brand-gold text-sm sm:text-base", !isAi && "list-inside")}>{children}</ol>,
                  li: ({ children }) => <li className={cn("leading-6 sm:leading-7", !isAi && "text-right")}>{children}</li>,
                  h1: ({ children }) => <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 mt-4 sm:mt-6 text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 mt-3 sm:mt-5 text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1.5 sm:mb-2 mt-2 sm:mt-4 text-white">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-brand-gold pl-4 py-2 my-4 text-gray-300 italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-brand-gold hover:text-brand-gold-light underline"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto">
                      <table className="min-w-full border border-brand-gold/20">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-brand-blue">{children}</thead>,
                  tbody: ({ children }) => <tbody className="divide-y divide-brand-gold/10">{children}</tbody>,
                  tr: ({ children }) => <tr>{children}</tr>,
                  th: ({ children }) => <th className="px-4 py-2 text-left font-semibold text-brand-gold">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-2">{children}</td>,
                  img: ({ src, alt }) => (
                    <div className="my-4">
                      <img 
                        src={src} 
                        alt={alt} 
                        className="rounded-lg max-w-full h-auto border border-brand-gold/20" 
                      />
                      {alt && <p className="text-center text-sm text-gray-400 mt-2">{alt}</p>}
                    </div>
                  )
                }}
                className="prose prose-invert max-w-none"
              >
                {enhancedMessage}
              </ReactMarkdown>
              )}
            </div>
          )}

          {/* Attachments */}
          {!isEditing && attachments && attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              {attachments.map((attachment, index) =>
                attachment && attachment.type === 'image' ? (
                  <img 
                    key={index}
                    src={attachment.url} 
                    alt={attachment.name} 
                    className="rounded-lg w-full object-cover border border-brand-gold/10" 
                  />
                ) : attachment ? (
                  <a 
                    key={index} 
                    href={attachment.url} 
                    download={attachment.name}
                    className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-brand-blue/50 hover:bg-brand-blue border border-brand-gold/10 text-xs sm:text-sm"
                  >
                    📎 {attachment.name}
                  </a>
                ) : null
              )}
            </div>
          )}

          {/* Action Buttons - Show on hover (desktop) or always (mobile) */}
          {!isEditing && (
            <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {/* Edit button for user messages */}
              {!isAi && (
                <button 
                  onClick={handleEdit}
                  className="p-1 sm:p-1.5 rounded hover:bg-brand-blue/50 text-gray-400 hover:text-white transition-colors"
                  title="Edit message"
                >
                  <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
              
              {/* Copy button for all messages */}
              <button 
                onClick={handleCopy}
                className="p-1 sm:p-1.5 rounded hover:bg-brand-blue/50 text-gray-400 hover:text-white transition-colors"
                title="Copy"
              >
                {copied ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </button>
              
              {/* Feedback buttons only for AI messages */}
              {isAi && !feedbackGiven && (
                <>
                  <button 
                    onClick={() => submitFeedback('positive')}
                    className="p-1 sm:p-1.5 rounded hover:bg-brand-blue/50 text-gray-400 hover:text-green-400 transition-colors"
                    title="Good response"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <button 
                    onClick={() => submitFeedback('negative')}
                    className="p-1 sm:p-1.5 rounded hover:bg-brand-blue/50 text-gray-400 hover:text-red-400 transition-colors"
                    title="Bad response"
                  >
                    <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </>
              )}
              
              {isAi && feedbackGiven && (
                <span className="text-[10px] sm:text-xs text-gray-500">Thanks for your feedback</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
