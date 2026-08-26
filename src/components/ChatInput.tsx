import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SendHorizontal,
  Paperclip,
  X,
  Mic,
  MicOff,
  FileText,
  Image as ImageIcon,
  File,
} from "lucide-react";
import {
  useState,
  KeyboardEvent,
  useRef,
  useEffect,
  ChangeEvent,
} from "react";
import { toast } from "sonner";

interface ChatInputProps {
  onSend: (message: string, attachments: File[]) => void;
  disabled?: boolean;
}

/** Returns a suitable icon for a file based on its MIME type. */
const FileIcon = ({ file }: { file: File }) => {
  if (file.type.startsWith("image/")) return <ImageIcon className="h-3.5 w-3.5 text-[#B8941F]" />;
  if (file.type === "application/pdf") return <FileText className="h-3.5 w-3.5 text-red-500" />;
  if (file.type.includes("word") || file.name.endsWith(".docx")) return <FileText className="h-3.5 w-3.5 text-blue-500" />;
  return <File className="h-3.5 w-3.5 text-[#1A1A1A]/50" />;
};

/** Format bytes to a human-readable string. */
const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const autoSendRef = useRef(false);

  // Set up speech recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;      // single utterance — stops automatically
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (final) {
        setMessage((prev) => (prev ? prev + " " + final : final).trim());
        setInterimTranscript("");
        autoSendRef.current = true;      // auto-send when recognition ends
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      // If we got a final transcript, send after a tiny delay so state settles
      if (autoSendRef.current) {
        autoSendRef.current = false;
        // Read latest message via callback form
        setMessage((prev) => {
          if (prev.trim()) {
            setTimeout(() => {
              const inputEl = document.querySelector<HTMLTextAreaElement>("[data-voice-send]");
              inputEl?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
            }, 80);
          }
          return prev;
        });
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        toast.error("Microphone error: " + event.error);
      }
      setIsListening(false);
      setInterimTranscript("");
      autoSendRef.current = false;
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, []);

  // companion:suggest event — fill input from suggestion chips
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
      toast.error("Speech recognition is not supported in your browser");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        toast.error("Could not access microphone");
      }
    }
  };

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSend(message.trim(), attachments);
      setMessage("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
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
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > 25 * 1024 * 1024) {
      toast.error("Total file size exceeds 25 MB");
      return;
    }
    setAttachments((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Show a friendly hint the first time a doc is attached
    if (files.some((f) => f.type !== "image/png" && f.type !== "image/jpeg")) {
      toast.info("Document attached — ask me anything about it!", { duration: 3000 });
    }
  };

  const removeAttachment = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const displayText = interimTranscript
    ? (message ? message + " " : "") + interimTranscript
    : message;

  return (
    <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-0 left-0 md:left-64 right-0 lg:right-80 pointer-events-none transition-all duration-300">
      <div className="h-8 bg-gradient-to-b from-transparent to-white" />
      <div className="bg-white pointer-events-auto">
        <div className="max-w-3xl mx-auto px-3 md:px-4 pb-3 md:pb-5 pt-2">

          {/* Attachment pills */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-[#FBF7E9] border border-[#E8DDB0] rounded-lg px-3 py-1.5 max-w-[240px]"
                >
                  <FileIcon file={file} />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-[#1A1A1A] truncate block">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-[#1A1A1A]/50">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] flex-shrink-0"
                    aria-label="Remove attachment"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Voice listening indicator */}
          {isListening && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-xs text-red-500 font-medium">
                Listening… speak now
              </span>
              {interimTranscript && (
                <span className="text-xs text-[#1A1A1A]/50 italic truncate max-w-[200px]">
                  "{interimTranscript}"
                </span>
              )}
            </div>
          )}

          {/* Input row */}
          <div
            className={`relative flex items-end gap-2 rounded-2xl border bg-white shadow-sm transition-all p-2 ${
              isListening
                ? "border-red-300 ring-2 ring-red-200"
                : "border-[#E8DDB0] focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/30"
            }`}
          >
            {/* File attach */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls,.pptx"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9 text-[#1A1A1A]/60 hover:bg-[#FBF7E9] hover:text-[#1A1A1A]"
              disabled={disabled}
              aria-label="Attach file or document"
              title="Attach a file or document for analysis"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Voice input */}
            <Button
              onClick={toggleListening}
              variant="ghost"
              size="icon"
              className={`shrink-0 h-9 w-9 transition-colors ${
                isListening
                  ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse"
                  : "text-[#1A1A1A]/60 hover:bg-[#FBF7E9] hover:text-[#1A1A1A]"
              }`}
              disabled={disabled}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title={isListening ? "Stop recording" : "Speak your message"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            {/* Text input */}
            <Textarea
              ref={textareaRef}
              data-voice-send
              value={displayText}
              onChange={(e) => {
                if (!isListening) setMessage(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? "Listening…"
                  : attachments.length > 0
                  ? "Ask anything about the attached file…"
                  : "Ask the Companion anything…"
              }
              className={`resize-none bg-transparent border-0 min-h-[40px] max-h-[200px] overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 p-2 ${
                isListening
                  ? "text-red-500 placeholder:text-red-300"
                  : "text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
              }`}
              disabled={disabled}
              readOnly={isListening}
              rows={1}
            />

            {/* Send */}
            <Button
              onClick={handleSend}
              disabled={
                (!message.trim() && attachments.length === 0) ||
                disabled ||
                isListening
              }
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
