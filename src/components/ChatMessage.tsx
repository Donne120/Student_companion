import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, ThumbsUp, ThumbsDown, Edit2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { ChatCard } from "./ui/chat-card";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
        "w-full py-8 px-4 group hover:bg-brand-blue-dark/30 transition-colors",
        isAi ? "bg-transparent" : "bg-brand-blue-dark/20"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-6 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8">
          {isAi ? (
            <div className="w-8 h-8 rounded-sm bg-brand-gradient-gold flex items-center justify-center p-1.5">
              <img 
                src="/logo.png" 
                alt="AI" 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-sm bg-brand-gradient-blue-gold flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
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
            <div className="text-gray-100">
              {cardData ? (
                <ChatCard {...cardData} />
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
                      <div className="my-4 rounded-lg overflow-hidden border border-brand-gold/20">
                        <div className="bg-brand-blue px-4 py-2 flex justify-between items-center text-xs text-gray-400">
                          <span>{match[1]}</span>
                          <button 
                            onClick={handleCopy} 
                            className="hover:text-brand-gold transition-colors"
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <SyntaxHighlighter 
                          style={atomDark} 
                          language={match[1]} 
                          PreTag="div" 
                          customStyle={{
                            margin: 0,
                            background: '#0A2463',
                            padding: '1rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code {...props} className="bg-brand-blue/50 px-1.5 py-0.5 rounded text-sm font-mono text-brand-gold-light">
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="mb-4 leading-7 text-left">{children}</p>,
                  ul: ({ children }) => <ul className="mb-4 pl-6 list-disc space-y-2 marker:text-brand-gold">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-4 pl-6 list-decimal space-y-2 marker:text-brand-gold">{children}</ol>,
                  li: ({ children }) => <li className="leading-7">{children}</li>,
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-white">{children}</h3>,
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
                {message}
              </ReactMarkdown>
              )}
            </div>
          )}

          {/* Attachments */}
          {!isEditing && attachments && attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
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
                    className="flex items-center gap-2 p-2 rounded-lg bg-brand-blue/50 hover:bg-brand-blue border border-brand-gold/10 text-sm"
                  >
                    📎 {attachment.name}
                  </a>
                ) : null
              )}
            </div>
          )}

          {/* Action Buttons - Show on hover */}
          {!isEditing && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Edit button for user messages */}
              {!isAi && (
                <button 
                  onClick={handleEdit}
                  className="p-1.5 rounded hover:bg-brand-blue/50 text-gray-400 hover:text-white transition-colors"
                  title="Edit message"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              
              {/* Copy button for all messages */}
              <button 
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-brand-blue/50 text-gray-400 hover:text-white transition-colors"
                title="Copy"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              
              {/* Feedback buttons only for AI messages */}
              {isAi && !feedbackGiven && (
                <>
                  <button 
                    onClick={() => submitFeedback('positive')}
                    className="p-1.5 rounded hover:bg-brand-blue/50 text-gray-400 hover:text-green-400 transition-colors"
                    title="Good response"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => submitFeedback('negative')}
                    className="p-1.5 rounded hover:bg-brand-blue/50 text-gray-400 hover:text-red-400 transition-colors"
                    title="Bad response"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </>
              )}
              
              {isAi && feedbackGiven && (
                <span className="text-xs text-gray-500">Thanks for your feedback</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
