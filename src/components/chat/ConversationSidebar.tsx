import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/chat";
import {
  ChevronLeft,
  ExternalLink,
  MessageSquarePlus,
  Settings,
  User,
  X,
} from "lucide-react";
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
  onDeleteConversation,
}: ConversationSidebarProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.messages.length <= 1) return "New chat";
    const firstUserMessage = conversation.messages.find((m) => !m.isAi);
    if (!firstUserMessage) return "New chat";
    const t = firstUserMessage.text.trim();
    return t.length > 32 ? t.slice(0, 32) + "…" : t;
  };

  const handleDeleteConversation = (convId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteConversation(convId);
  };

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  const initials =
    (currentUser?.displayName || currentUser?.email || "A")
      .split(/[\s@]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "A";

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${sidebarWidth} bg-[#FBF7E9]/40 border-r border-[#E8DDB0] flex flex-col z-40 transition-all duration-300`}
    >
      {/* Brand */}
      <div className="h-14 flex items-center px-3 border-b border-[#E8DDB0]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded bg-[#D4AF37] flex items-center justify-center text-[#1A1A1A] font-bold text-xs flex-shrink-0">
            A
          </div>
          {!isCollapsed && (
            <span className="font-semibold tracking-tight text-[#1A1A1A] text-sm">
              Companion
            </span>
          )}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto h-7 w-7 text-[#1A1A1A]/50 hover:bg-[#FBF7E9] hover:text-[#1A1A1A]"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {/* New chat */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] font-medium text-sm transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <MessageSquarePlus className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>New chat</span>}
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {!isCollapsed && conversations.length > 0 && (
          <div className="px-2 py-2 text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
            Recent
          </div>
        )}
        <div className="space-y-0.5">
          {conversations.map((conv) => {
            const isActive = conv.id === currentConversationId;
            return (
              <div key={conv.id} className="group relative">
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full px-3 py-2 rounded-lg text-left text-sm truncate transition-colors ${
                    isActive
                      ? "bg-[#FBF7E9] text-[#1A1A1A] font-medium"
                      : "text-[#1A1A1A]/75 hover:bg-[#FBF7E9]/60 hover:text-[#1A1A1A]"
                  } ${isCollapsed ? "text-center" : ""}`}
                >
                  {isCollapsed ? "•" : getConversationTitle(conv)}
                </button>
                {!isCollapsed && (
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#E8DDB0] text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-opacity"
                    aria-label="Delete conversation"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: user + settings */}
      <div className="border-t border-[#E8DDB0] p-2">
        <a
          href="https://www.support.alueducation.com/home"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[#1A1A1A]/70 hover:bg-[#FBF7E9] hover:text-[#1A1A1A] text-sm transition-colors mb-1 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>ALU Support</span>}
        </a>
        <button
          onClick={() => navigate("/settings")}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#1A1A1A]/70 hover:bg-[#FBF7E9] hover:text-[#1A1A1A] text-sm transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button
          onClick={() => navigate("/profile")}
          className={`w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-[#1A1A1A] hover:bg-[#FBF7E9] text-sm transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <div className="truncate font-medium">
                {currentUser?.displayName || "Profile"}
              </div>
              {currentUser?.email && (
                <div className="truncate text-xs text-[#1A1A1A]/50">
                  {currentUser.email}
                </div>
              )}
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
