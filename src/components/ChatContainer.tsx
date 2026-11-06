import { useEffect, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChatMessageHandler } from "./chat/ChatMessageHandler";
import { ChatInput } from "./ChatInput";
import { ConversationSidebar } from "./chat/ConversationSidebar";
import { ChatMessages } from "./chat/ChatMessages";
import { BackendStatus } from "./chat/BackendStatus";
import { EmailBriefingGreeting } from "./chat/EmailBriefingGreeting";
import { OpportunityWidget } from "./opportunities/OpportunityWidget";
import { Menu, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export const ChatContainer = () => {
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setAccessibilityMode(localStorage.getItem("ACCESSIBILITY_MODE") === "true");
  }, []);

  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    getCurrentConversation,
    createNewConversation,
    handleDeleteConversation,
    addMessageToConversation,
    updateMessageInConversation,
  } = useConversations();

  const currentConversation = getCurrentConversation();

  const { isLoading, handleSendMessage, handleEditMessage } = useChatMessageHandler({
    currentConversationId,
    messages: currentConversation?.messages || [],
    onAddMessage: addMessageToConversation,
    onUpdateMessage: updateMessageInConversation,
  });

  return (
    <div
      className={`min-h-[100dvh] bg-white font-sans text-[#1C1B19] flex ${
        accessibilityMode ? "text-lg leading-relaxed" : ""
      }`}
    >
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onNewChat={createNewConversation}
          onSelectConversation={setCurrentConversationId}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      <main className="flex-1 min-w-0 md:pl-64 lg:pr-80 transition-all duration-300 relative overflow-x-clip">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#E5E3DE] safe-top">
          <div className="h-14 px-3 flex items-center gap-2">
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <button
                  className="h-9 w-9 -ml-1 flex items-center justify-center rounded-full hover:bg-[#F4F3F0] text-[#1C1B19]"
                  aria-label="Open conversations"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-[#F4F3F0]/40">
                <ConversationSidebar
                  conversations={conversations}
                  currentConversationId={currentConversationId}
                  onNewChat={() => {
                    createNewConversation();
                    setMobileSidebarOpen(false);
                  }}
                  onSelectConversation={(id) => {
                    setCurrentConversationId(id);
                    setMobileSidebarOpen(false);
                  }}
                  onDeleteConversation={handleDeleteConversation}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <img src="/logo-icon.png" alt="Student Companion AI" className="w-8 h-8 object-contain flex-shrink-0" />
              <span className="text-[15px] font-semibold tracking-tight text-[#1C1B19] truncate">
                {currentConversation?.title || "Companion"}
              </span>
            </div>
            <BackendStatus quiet />
            <button
              onClick={createNewConversation}
              className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-[#F4F3F0] text-[#1C1B19]"
              aria-label="New chat"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop top bar */}
        <div className="hidden md:block sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-[#EDEBE6]">
          <div className="h-14 px-6 flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#1C1B19] truncate">
              {currentConversation?.messages?.length ? currentConversation.title : "New conversation"}
            </span>
            <BackendStatus quiet />
          </div>
        </div>

        {/* Spoken email briefing — appears once per session when connected */}
        <EmailBriefingGreeting />

        {/* Messages */}
        <div className="pb-[180px] md:pb-44">
          <ChatMessages
            messages={currentConversation?.messages || []}
            isLoading={isLoading}
            onEditMessage={handleEditMessage}
          />
        </div>

        {/* Input pinned to bottom */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </main>

      {/* Right rail: Opportunities — desktop only */}
      <aside className="hidden lg:flex fixed right-0 top-0 h-full w-80 bg-[#FAFAF8] border-l border-[#EDEBE6] flex-col z-30">
        <div className="h-14 px-5 flex items-center border-b border-[#EDEBE6]">
          <span className="text-[14px] font-semibold text-[#1C1B19]">Opportunities</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <OpportunityWidget />
        </div>
      </aside>
    </div>
  );
};
