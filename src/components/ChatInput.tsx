
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
    <div className="fixed bottom-0 left-16 right-0 md:left-64 lg:right-80 bg-brand-blue-dark/95 backdrop-blur-sm border-t border-brand-gold/20 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-brand-blue rounded px-3 py-1 border border-brand-gold/20"
              >
                <span className="text-sm text-gray-300 truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-brand-gold"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3 items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <div className="flex-1 flex items-center gap-2 bg-brand-blue rounded-2xl border border-brand-gold/30 px-4 py-2 focus-within:border-brand-gold/50 transition-colors">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 hover:bg-brand-blue-light text-gray-400 hover:text-brand-gold"
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Student Companion..."
              className="resize-none bg-transparent border-0 text-white placeholder:text-gray-500 min-h-[24px] max-h-[200px] overflow-y-auto focus:outline-none focus:ring-0 flex-1"
              disabled={disabled}
              rows={1}
            />
            
            {message.trim() || attachments.length > 0 ? (
              <Button
                onClick={handleSend}
                disabled={disabled}
                size="icon"
                className="shrink-0 h-8 w-8 bg-brand-gold hover:bg-brand-gold-light text-brand-blue-dark rounded-lg"
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={toggleListening}
                variant="ghost"
                size="icon"
                className={`shrink-0 h-8 w-8 ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'hover:bg-brand-blue-light text-gray-400 hover:text-brand-gold'}`}
                disabled={disabled}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">
          Student Companion AI can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
};
