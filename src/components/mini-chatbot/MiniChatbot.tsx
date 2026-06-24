import { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiniChatbotContent } from "./MiniChatbotContent";

export const MiniChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="fixed z-50 bottom-[calc(72px+env(safe-area-inset-bottom))] md:bottom-6 right-4 md:right-6">
      {isOpen ? (
        <Card className="w-[min(22rem,calc(100vw-2rem))] shadow-xl animate-fade-in bg-white border border-[#E8DDB0] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-white border-b border-[#E8DDB0]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#D4AF37] flex items-center justify-center text-[#1A1A1A] font-bold text-xs">
                A
              </div>
              <span className="text-sm font-medium text-[#1A1A1A]">Quick help</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#1A1A1A]/60 hover:bg-[#FBF7E9] hover:text-[#1A1A1A]"
              onClick={() => setIsOpen(false)}
              aria-label="Close quick help"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <MiniChatbotContent />
        </Card>
      ) : (
        <Button
          className="rounded-full h-14 w-14 shadow-lg bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] transition-transform hover:scale-105"
          onClick={() => setIsOpen(true)}
          aria-label="Open quick help"
        >
          <MessageCircle size={22} />
        </Button>
      )}
    </div>
  );
};
