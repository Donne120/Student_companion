import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiniChatbotContent } from "./MiniChatbotContent";

export const MiniChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const chatbotRef = useRef<HTMLDivElement>(null);

  // Improved drag start - allows dragging from any part of the component
  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging from any part of the component
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault(); // Prevent text selection during drag
  };

  // Handle dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const maxX = window.innerWidth - (chatbotRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (chatbotRef.current?.offsetHeight || 0);
      
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, maxX));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, maxY));
      
      setPosition({ x: newX, y: newY });
    }
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={chatbotRef}
      className="fixed z-50 transition-all duration-300"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {isOpen ? (
      <Card className="w-80 shadow-lg animate-fade-in bg-brand-blue-dark border border-brand-gold/20 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-brand-gradient-gold text-brand-blue-dark">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Student Companion" 
              className="h-6 w-auto object-contain"
            />
            <h3 className="font-semibold">Student Companion</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-brand-blue-dark hover:bg-brand-blue-dark/10" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <MiniChatbotContent />
      </Card>
      ) : (
        <div className="relative group">
          {/* Flag pole with greater height */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-14 w-1.5 h-14 bg-brand-gradient-gold rounded-t-sm"></div>
          
          {/* Flag directly on the pole */}
          <div className="absolute -top-14 left-1/2 -translate-x-[10%]">
            {/* Flag body with wave effect */}
            <div className="bg-brand-gradient-gold text-brand-blue-dark px-3 py-1 rounded-r-md shadow-md w-32 h-8 flex items-center justify-center">
              <span className="font-semibold text-xs whitespace-nowrap">Companion AI</span>
              
              {/* Wave effect at the end of the flag */}
              <div className="absolute -right-1 top-0 h-full w-3 overflow-hidden">
                <div className="h-full w-6 rounded-l-full bg-brand-gold transform translate-x-1"></div>
              </div>
            </div>
          </div>
          
          {/* Chat button */}
          <Button 
            className="rounded-full h-14 w-14 shadow-lg animate-glow bg-brand-gradient-gold hover:opacity-90"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            <MessageCircle size={24} className="text-brand-blue-dark" />
          </Button>
        </div>
      )}
    </div>
  );
};
