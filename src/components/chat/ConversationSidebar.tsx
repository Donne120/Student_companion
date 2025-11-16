import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/chat";
import { ChevronLeft, Settings, Trash2, User, X, Database, HelpCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export const ConversationSidebar = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation
}: ConversationSidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentConversation = conversations.find(conv => conv.id === currentConversationId);
  const handleClearChat = () => {
    const conversation = conversations.find(conv => conv.id === currentConversationId);
    if (conversation) {
      conversation.messages = [{
        id: "welcome",
        text: `# Welcome to ALU Student Companion\n\nI'm here to help! I'll remember our conversation and provide relevant context-aware responses. Feel free to ask any questions!`,
        isAi: true,
        timestamp: Date.now()
      }];
      toast.success("Chat cleared successfully");
    }
  };
  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.messages.length <= 1) return "New Chat";
    const firstUserMessage = conversation.messages.find(msg => !msg.isAi);
    if (!firstUserMessage) return "New Chat";
    return firstUserMessage.text.slice(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '');
  };
  const handleDeleteConversation = (convId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteConversation(convId);
  };
  const sidebarWidth = isCollapsed ? "w-16" : "w-64";

  return <div className={`fixed left-0 top-0 h-full ${sidebarWidth} bg-brand-blue-dark p-2 border-r border-brand-gold/20 flex flex-col z-50 transition-all duration-300`}>
      
      <div className="absolute -right-4 top-2">
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="rounded-full bg-brand-blue-dark hover:bg-brand-blue border border-brand-gold/20 w-8 h-8">
          <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-2">
        {!isCollapsed}
        
        <button onClick={onNewChat} className={`w-full p-3 mb-2 bg-brand-blue hover:bg-brand-blue-light border border-brand-gold/20 rounded-lg text-left flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
          {isCollapsed ? '+' : <span>+ New Chat</span>}
        </button>
        
        {/* Enhanced ALU Support Link with Logo */}
        <a 
          href="https://www.support.alueducation.com/home" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`w-full p-3 mb-4 text-left hover:bg-brand-blue bg-brand-blue/50 transition-colors duration-200 border border-brand-gold/30 rounded-lg flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
        >
          {/* ALU Logo SVG */}
          <div className="flex-shrink-0 w-5 h-5 relative">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path 
                d="M12 2L3 6.5V11.5L12 16L21 11.5V6.5L12 2Z" 
                fill="#FF0033" 
                fillOpacity="0.9"
              />
              <path 
                d="M3 13.5V17.5L12 22L21 17.5V13.5L12 18L3 13.5Z" 
                fill="#5E2D79" 
                fillOpacity="0.9"
              />
            </svg>
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <span className="font-medium text-white">ALU</span>
                <span className="ml-1 text-gray-300">Support</span>
              </div>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </div>
          )}
        </a>

        <div className="space-y-2">
          {conversations.map(conv => <div key={conv.id} className="group relative">
              <button onClick={() => onSelectConversation(conv.id)} className={`w-full p-3 rounded-lg text-left truncate hover:bg-brand-blue border border-transparent hover:border-brand-gold/20 ${conv.id === currentConversationId ? 'bg-brand-blue border-brand-gold/30' : ''} ${isCollapsed ? 'justify-center' : ''}`}>
                {isCollapsed ? '💬' : getConversationTitle(conv)}
              </button>
              {!isCollapsed && <Button variant="ghost" size="icon" onClick={e => handleDeleteConversation(conv.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-brand-blue-light">
                  <X className="h-4 w-4" />
                </Button>}
            </div>)}
        </div>
      </div>
      
      <div className="mt-auto border-t border-brand-gold/20 pt-2 sticky bottom-0 bg-brand-blue-dark">
        
        <button onClick={() => navigate('/profile')} className={`w-full p-3 text-left hover:bg-brand-blue rounded-lg flex items-center gap-2 text-gray-300 ${isCollapsed ? 'justify-center' : ''}`}>
          <User className="h-4 w-4" />
          {!isCollapsed && <span>{user?.name || 'Profile'}</span>}
        </button>
        <button onClick={() => navigate('/settings')} className={`w-full p-3 text-left hover:bg-brand-blue rounded-lg flex items-center gap-2 text-gray-300 ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>
    </div>;
};