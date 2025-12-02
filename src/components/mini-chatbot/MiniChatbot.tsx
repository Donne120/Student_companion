import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiniChatbotContent } from "./MiniChatbotContent";

export const MiniChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 left-4 z-50 transition-all duration-300">
      {isOpen ? (
        <Card className="w-80 shadow-lg animate-fade-in bg-[#003366] border border-[#FF0033]/20 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FF0033] to-[#5E2D79] text-white">
            <h3 className="font-medium">University Admin</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10" 
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
          <div className="absolute left-1/2 -translate-x-1/2 -top-14 w-1.5 h-14 bg-gradient-to-b from-[#5E2D79] to-[#FF0033] rounded-t-sm"></div>
          
          {/* Flag directly on the pole */}
          <div className="absolute -top-14 left-1/2 -translate-x-[10%]">
            {/* Flag body with wave effect */}
            <div className="bg-gradient-to-r from-[#FF0033] to-[#5E2D79] text-white px-3 py-1 rounded-r-md shadow-md w-32 h-8 flex items-center justify-center">
              <span className="font-medium text-xs whitespace-nowrap">University Admin</span>
              
              {/* Wave effect at the end of the flag */}
              <div className="absolute -right-1 top-0 h-full w-3 overflow-hidden">
                <div className="h-full w-6 rounded-l-full bg-[#5E2D79] transform translate-x-1"></div>
              </div>
            </div>
          </div>
          
          {/* Chat button */}
          <Button 
            className="rounded-full h-14 w-14 shadow-lg animate-pulse bg-gradient-to-r from-[#FF0033] to-[#5E2D79] hover:from-[#D00029] hover:to-[#4A2361]"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            <MessageCircle size={24} />
          </Button>
        </div>
      )}
    </div>
  );
};
