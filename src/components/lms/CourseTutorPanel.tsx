import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { Sparkles, X, ArrowUp, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useScaTutor } from '@/hooks/useScaTutor';

export interface CourseTutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  currentLesson?: string;
}

const SUGGESTION_CHIPS = [
  'Explain this simply',
  'Define a key term',
  'Summarise this lesson',
  'Real-world application',
  'Give me a quiz question',
  'Tell me more',
];

export function CourseTutorPanel({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  currentLesson,
}: CourseTutorPanelProps) {
  const { messages, isLoading, sendMessage, clearHistory } = useScaTutor(
    courseId,
    courseTitle,
    currentLesson,
  );

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to newest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (chip: string) => {
    if (isLoading) return;
    sendMessage(chip);
  };

  // Show suggestion chips when there are no messages, or after the last
  // message is from the assistant (not while loading)
  const showChips =
    !isLoading &&
    (messages.length === 0 ||
      messages[messages.length - 1]?.role === 'assistant');

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — desktop: right-side drawer; mobile: bottom sheet */}
      <div
        role="dialog"
        aria-label="SCA Course Assistant"
        aria-modal="true"
        className={[
          'fixed z-50 flex flex-col bg-white shadow-2xl',
          // Desktop: right drawer, full height
          'md:top-0 md:right-0 md:h-full md:w-full md:max-w-sm md:rounded-none md:border-l md:border-[#E8DDB0]',
          // Mobile: bottom sheet
          'bottom-0 inset-x-0 rounded-t-2xl max-h-[90vh] md:max-h-full md:bottom-auto md:inset-x-auto',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 flex items-center gap-2.5 px-4 py-3 border-b border-[#E8DDB0] bg-[#FFFDF5]">
          <Sparkles className="h-5 w-5 text-[#D4AF37] flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#1A1A1A] text-sm leading-tight">SCA</p>
            <p className="text-xs text-[#1A1A1A]/50 truncate">Your Course Assistant</p>
          </div>
          {/* Clear history */}
          <button
            onClick={clearHistory}
            className="p-1.5 rounded text-[#1A1A1A]/40 hover:text-[#1A1A1A] hover:bg-[#FBF7E9] transition-colors"
            aria-label="Clear chat history"
            title="Clear history"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#1A1A1A]/40 hover:text-[#1A1A1A] hover:bg-[#FBF7E9] transition-colors"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Message thread ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[#D4AF37] flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden="true" />
              </div>
              <div className="bg-white border border-[#E8DDB0] rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%] text-sm text-[#1A1A1A] leading-relaxed">
                Hi! I'm SCA — your Student Companion Assistant for{' '}
                <strong>{courseTitle}</strong>. Ask me anything 💡
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) =>
            msg.role === 'user' ? (
              <div key={idx} className="flex justify-end">
                <div className="bg-[#D4AF37] text-white rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed break-words">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={idx} className="flex items-start gap-2">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </div>
                <div className="bg-white border border-[#E8DDB0] rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%] text-sm text-[#1A1A1A] leading-relaxed break-words prose prose-sm prose-headings:text-[#1A1A1A] prose-strong:text-[#1A1A1A] prose-a:text-[#B8941F] max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ),
          )}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[#D4AF37] flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden="true" />
              </div>
              <div className="bg-white border border-[#E8DDB0] rounded-2xl rounded-bl-sm px-3.5 py-3 flex items-center gap-1">
                <span
                  className="h-2 w-2 rounded-full bg-[#D4AF37] animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-[#D4AF37] animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-[#D4AF37] animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggestion chips ── */}
        {showChips && (
          <div className="flex-shrink-0 px-4 pb-2 overflow-x-auto">
            <div className="flex gap-2 w-max">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChip(chip)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors font-medium whitespace-nowrap"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input bar ── */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-[#E8DDB0] bg-white">
          <div className="flex items-center gap-2 rounded-xl border border-[#E8DDB0] focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/30 px-3 py-2 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask SCA anything…"
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 outline-none disabled:opacity-50"
              aria-label="Message SCA"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 h-8 w-8 rounded-lg bg-[#D4AF37] text-white flex items-center justify-center hover:bg-[#B8941F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
