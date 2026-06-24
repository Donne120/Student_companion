
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Paperclip, X, Mic, MicOff } from "lucide-react";
import { useState, KeyboardEvent, useRef, useEffect, ChangeEvent } from "react";
import { toast } from "sonner";

interface ChatInputProps {
  onSend: (message: string, attachments: File[]) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setMessage(transcript);
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast.error('Error with speech recognition');
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Empty-state suggestion clicks populate the input and focus it.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string") {
        setMessage(detail);
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("companion:suggest", handler);
    return () => window.removeEventListener("companion:suggest", handler);
  }, []);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening...');
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Error accessing microphone');
      setIsListening(false);
    }
  };

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSend(message.trim(), attachments);
      setMessage("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files || []);
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      
      if (totalSize > 25 * 1024 * 1024) {
        toast.error("Total file size exceeds 25MB limit");
        return;
      }

      setAttachments(prev => [...prev, ...files]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-0 left-0 md:left-64 right-0 lg:right-80 pointer-events-none transition-all duration-300">
      {/* Soft fade so messages don't bump abruptly into the input */}
      <div className="h-8 bg-gradient-to-b from-transparent to-white" />
      <div className="bg-white pointer-events-auto">
        <div className="max-w-3xl mx-auto px-3 md:px-4 pb-3 md:pb-5 pt-2">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-[#FBF7E9] border border-[#E8DDB0] rounded-md px-3 py-1.5"
                >
                  <span className="text-sm text-[#1A1A1A] truncate max-w-[180px]">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
                    aria-label="Remove attachment"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 rounded-2xl border border-[#E8DDB0] bg-white shadow-sm focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/30 transition-all p-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9 text-[#1A1A1A]/60 hover:bg-[#FBF7E9] hover:text-[#1A1A1A]"
              disabled={disabled}
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              onClick={toggleListening}
              variant="ghost"
              size="icon"
              className={`shrink-0 h-9 w-9 ${
                isListening
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "text-[#1A1A1A]/60 hover:bg-[#FBF7E9] hover:text-[#1A1A1A]"
              }`}
              disabled={disabled}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the Companion anything…"
              className="resize-none bg-transparent border-0 text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 min-h-[40px] max-h-[200px] overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 p-2"
              disabled={disabled}
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={(!message.trim() && attachments.length === 0) || disabled}
              className="shrink-0 h-9 w-9 bg-[#1A1A1A] hover:bg-black text-white disabled:bg-[#E8DDB0] disabled:text-[#1A1A1A]/40 rounded-lg"
              aria-label="Send message"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-xs text-[#1A1A1A]/40 mt-2">
            The Companion can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};
