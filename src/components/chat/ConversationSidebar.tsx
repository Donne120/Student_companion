import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/chat";
import {
  ChevronLeft,
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
      className={`fixed left-0 top-0 h-full ${sidebarWidth} bg-[#FAFAF8] border-r border-[#EDEBE6] flex flex-col z-40 transition-all duration-300`}
    >
      {/* Brand */}
      <div className="h-14 flex items-center px-3 border-b border-[#EDEBE6]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src="/logo-icon.png"
            alt="Student Companion AI"
            className="w-7 h-7 object-contain flex-shrink-0"
          />
          {!isCollapsed && (
            <span className="font-semibold tracking-tight text-[#1C1B19] text-[14px]">
              Student Companion
            </span>
          )}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto h-7 w-7 text-[#1C1B19]/50 hover:bg-[#F4F3F0] hover:text-[#1C1B19]"
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
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E3DE] bg-white hover:border-[#C8C4BA] text-[#1C1B19] font-medium text-[13px] shadow-[0_1px_0_rgba(28,27,25,0.04)] transition-colors ${
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
          <div className="px-3 pt-3 pb-1.5 text-xs text-[#8C887F]">
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
                  className={`w-full px-3 py-1.5 rounded-md text-left text-[13px] truncate transition-colors ${
                    isActive
                      ? "bg-[#EDEBE6] text-[#1C1B19] font-medium"
                      : "text-[#4A4843] hover:bg-[#F1F0EC] hover:text-[#1C1B19]"
                  } ${isCollapsed ? "text-center" : ""}`}
                >
                  {isCollapsed ? "•" : getConversationTitle(conv)}
                </button>
                {!isCollapsed && (
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#E5E3DE] text-[#1C1B19]/60 hover:text-[#1C1B19] transition-opacity"
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
      <div className="border-t border-[#EDEBE6] p-2">
        <button
          onClick={() => navigate("/settings")}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#1C1B19]/70 hover:bg-[#F4F3F0] hover:text-[#1C1B19] text-sm transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button
          onClick={() => navigate("/profile")}
          className={`w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-[#1C1B19] hover:bg-[#F4F3F0] text-sm transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-[#1C1B19] text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <div className="truncate font-medium">
                {currentUser?.displayName || "Profile"}
              </div>
              {currentUser?.email && (
                <div className="truncate text-xs text-[#1C1B19]/50">
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
