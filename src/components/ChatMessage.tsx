import { useState } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, Edit, Camera, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { ChatCard } from "./ui/chat-card";
import { cn } from "@/lib/utils";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const timestamp = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  const cardData = tryParseCard(message);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy message");
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
  const handleScreenshot = async () => {
    try {
      const messageElement = document.getElementById(`message-${message.slice(0, 10)}`);
      if (messageElement) {
        const canvas = await html2canvas(messageElement);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'chat-screenshot.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Screenshot saved");
      }
    } catch (err) {
      toast.error("Failed to take screenshot");
    }
  };

  const canShowFeedback = isAi && !feedbackGiven && localStorage.getItem('COLLECT_FEEDBACK') !== 'false';

  const submitFeedback = (type: 'positive' | 'negative') => {
    if (type === 'negative' && localStorage.getItem('DETAILED_NEGATIVE_FEEDBACK') !== 'false') {
      setShowFeedbackForm(true);
      return;
    }

    const feedback = JSON.parse(localStorage.getItem('FEEDBACK') || '[]');
    feedback.push({
      type,
      message,
      details: feedbackDetails,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('FEEDBACK', JSON.stringify(feedback));

    if (onFeedback) {
      onFeedback(type, feedbackDetails);
    }

    setFeedbackGiven(true);
    setShowFeedbackForm(false);
  };

  const renderFeedbackUI = () => {
    if (!canShowFeedback) return null;

    if (showFeedbackForm) {
      return (
        <div className="mt-3 p-3 rounded-lg bg-brand-blue/50 border border-brand-gold/20 backdrop-blur-sm">
          <p className="text-sm text-gray-300 mb-2">What could be improved?</p>
          <textarea
            className="w-full p-2 rounded bg-brand-blue-dark border border-brand-gold/30 text-gray-200 text-sm mb-2 focus:border-brand-gold/50"
            placeholder="Please tell us what was incorrect or unhelpful..."
            value={feedbackDetails}
            onChange={(e) => setFeedbackDetails(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button 
              className="px-3 py-1 text-sm rounded bg-brand-blue hover:bg-brand-blue-light text-gray-300"
              onClick={() => setShowFeedbackForm(false)}
            >
              Cancel
            </button>
            <button 
              className="px-3 py-1 text-sm rounded bg-brand-gradient-gold text-brand-blue-dark hover:opacity-90"
              onClick={() => submitFeedback('negative')}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      );
    }

    if (showFeedback) {
      return (
        <div className="mt-2 flex space-x-2 items-center justify-end">
          <span className="text-xs text-gray-400">Was this helpful?</span>
          <button 
            className="p-1 rounded hover:bg-green-500/20 text-green-400"
            onClick={() => submitFeedback('positive')}
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button 
            className="p-1 rounded hover:bg-red-500/20 text-red-400"
            onClick={() => submitFeedback('negative')}
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex justify-end mt-1">
        <button 
          className="text-xs text-gray-400 flex items-center hover:text-gray-300"
          onClick={() => setShowFeedback(true)}
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          Feedback
        </button>
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "py-6 px-6 md:px-12 lg:px-16 w-full animate-message-fade-in relative",
        isAi ? "bg-transparent" : "bg-transparent"
      )} 
      id={`message-${message.slice(0, 10)}`}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        {isAi ? (
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 rounded-full bg-brand-gradient-gold flex items-center justify-center p-1.5 shadow-lg">
              <img 
                src="/logo.png" 
                alt="Student Companion AI" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div 
            className="w-2 h-2 mt-2 rounded-full flex-shrink-0 bg-brand-gradient-blue-gold"
          />
        )}

        <div className="flex-1 space-y-2">
          <div 
            className={cn(
              "text-white transition-all duration-300",
              "animate-scale-in"
            )}
          >
            {isEditing ? (
              <textarea
                value={editedMessage}
                onChange={e => setEditedMessage(e.target.value)}
                className="w-full bg-brand-blue-dark text-white rounded-lg p-3 min-h-[100px] border border-brand-gold/20"
              />
            ) : cardData ? (
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
                    return !inline && match ? <div className="relative group my-6">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-gold to-brand-gold-light rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                              <div className="relative rounded-lg overflow-hidden">
                                <div className="bg-brand-blue text-xs text-gray-400 px-4 py-1 flex justify-between items-center">
                                  <span>{match[1].toUpperCase()}</span>
                                  <button onClick={handleCopy} className="p-1 hover:bg-brand-blue-dark rounded">
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                  </button>
                                </div>
                                <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" customStyle={{
                          margin: 0,
                          background: '#0A2463',
                          padding: '1rem',
                          fontSize: '0.9rem',
                          borderRadius: '0 0 0.5rem 0.5rem'
                        }}>
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            </div> : <code {...props} className={cn(className, "bg-brand-blue px-1.5 py-0.5 rounded-md font-mono text-sm")}>
                              {children}
                            </code>;
                  },
                  p: ({
                    children
                  }) => <p className="mb-4 leading-7 text-justify">{children}</p>,
                  ul: ({
                    children
                  }) => <ul className="mb-4 pl-6 list-disc space-y-2">{children}</ul>,
                  ol: ({
                    children
                  }) => <ol className="mb-4 pl-6 list-decimal space-y-2">{children}</ol>,
                  li: ({
                    children
                  }) => <li className="leading-7 text-justify">{children}</li>,
                  h1: ({
                    children
                  }) => <h1 className="text-2xl font-bold mb-4 mt-6 bg-brand-gradient-gold bg-clip-text text-transparent">{children}</h1>,
                  h2: ({
                    children
                  }) => <h2 className="text-xl font-bold mb-3 mt-5 bg-brand-gradient-gold bg-clip-text text-transparent">{children}</h2>,
                  h3: ({
                    children
                  }) => <h3 className="text-lg font-bold mb-3 mt-5 bg-brand-gradient-gold bg-clip-text text-transparent">{children}</h3>,
                  h4: ({
                    children
                  }) => <h4 className="text-base font-bold mb-2 mt-4 bg-brand-gradient-gold bg-clip-text text-transparent">{children}</h4>,
                  blockquote: ({
                    children
                  }) => <blockquote className="border-l-4 border-brand-gold pl-4 italic my-4 text-gray-300 bg-brand-blue/50 py-2 rounded-r-md">
                            {children}
                          </blockquote>,
                  a: ({
                    href,
                    children
                  }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline font-medium">
                            {children}
                          </a>,
                  table: ({
                    children
                  }) => <div className="overflow-x-auto my-6 rounded-lg border border-brand-gold/20">
                            <table className="min-w-full rounded-lg overflow-hidden">
                              {children}
                            </table>
                          </div>,
                  thead: ({
                    children
                  }) => <thead className="bg-brand-blue">{children}</thead>,
                  tbody: ({
                    children
                  }) => <tbody className="divide-y divide-brand-blue">{children}</tbody>,
                  tr: ({
                    children
                  }) => <tr className="hover:bg-brand-blue/50 transition-colors">{children}</tr>,
                  th: ({
                    children
                  }) => <th className="px-4 py-3 text-left font-semibold text-brand-gold">{children}</th>,
                  td: ({
                    children
                  }) => <td className="px-4 py-3">{children}</td>,
                  img: ({
                    src,
                    alt
                  }) => <div className="my-4">
                            <img src={src} alt={alt} className="rounded-lg max-w-full h-auto border border-brand-gold/20 shadow-lg" />
                            {alt && <p className="text-center text-sm text-gray-400 mt-2">{alt}</p>}
                          </div>
                }}
                className="prose prose-invert max-w-none"
              >
                {message}
              </ReactMarkdown>
            )}
          </div>
          
          {renderFeedbackUI()}
          
          <div className="text-xs text-gray-400 ml-1 flex items-center gap-2">
            <span>{timestamp}</span>
            <div className="h-1 w-1 rounded-full bg-gray-500"></div>
            <span>{isAi ? 'AI Assistant' : 'You'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!isAi && (
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg hover:bg-brand-blue text-gray-400 hover:text-brand-gold transition-colors"
            >
              {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-brand-blue text-gray-400 hover:text-brand-gold transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {attachments && attachments.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {attachments.map((attachment, index) => 
            attachment && attachment.type === 'image' ? (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-brand-gradient-gold rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <img 
                  src={attachment.url} 
                  alt={attachment.name} 
                  className="relative rounded-lg max-h-64 object-cover w-full border border-brand-gold/10" 
                />
              </div>
            ) : attachment ? (
              <a 
                key={index} 
                href={attachment.url} 
                download={attachment.name} 
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-brand-gradient-gold rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative flex items-center gap-2 p-3 rounded-lg bg-brand-blue hover:bg-brand-blue-light transition-colors border border-brand-gold/10">
                  📎 {attachment.name}
                </div>
              </a>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};
