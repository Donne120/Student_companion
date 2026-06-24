import { useEffect, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChatMessageHandler } from "./chat/ChatMessageHandler";
import { ChatInput } from "./ChatInput";
import { ConversationSidebar } from "./chat/ConversationSidebar";
import { ChatMessages } from "./chat/ChatMessages";
import { BackendStatus } from "./chat/BackendStatus";
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
      className={`min-h-[100dvh] bg-white font-sans text-[#1A1A1A] flex ${
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

      <main className="flex-1 min-w-0 md:pl-64 lg:pr-80 transition-all duration-300 relative overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#E8DDB0] safe-top">
          <div className="h-14 px-3 flex items-center gap-2">
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <button
                  className="h-9 w-9 -ml-1 flex items-center justify-center rounded-full hover:bg-[#FBF7E9] text-[#1A1A1A]"
                  aria-label="Open conversations"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-[#FBF7E9]/40">
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
              <img src="/logo.png" alt="ALU Companion" className="w-7 h-7 rounded-md object-contain" />
              <span className="text-[15px] font-semibold tracking-tight text-[#1A1A1A] truncate">
                {currentConversation?.title || "Companion"}
              </span>
            </div>
            <BackendStatus />
            <button
              onClick={createNewConversation}
              className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-[#FBF7E9] text-[#1A1A1A]"
              aria-label="New chat"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop top bar */}
        <div className="hidden md:block sticky top-0 z-10 bg-white/85 backdrop-blur border-b border-[#E8DDB0]">
          <div className="h-14 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="ALU Companion" className="w-6 h-6 rounded object-contain" />
              <span className="text-sm font-medium text-[#1A1A1A]">
                {currentConversation?.title || "New chat"}
              </span>
            </div>
            <BackendStatus />
          </div>
        </div>

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
      <aside className="hidden lg:flex fixed right-0 top-0 h-full w-80 bg-[#FBF7E9]/30 border-l border-[#E8DDB0] flex-col z-30">
        <div className="h-14 px-5 flex items-center border-b border-[#E8DDB0]">
          <span className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">
            For students
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <OpportunityWidget />
        </div>
        <div className="px-5 py-3 border-t border-[#E8DDB0] text-[10px] text-[#1A1A1A]/40 leading-relaxed">
          Opportunities rotate every few seconds. Hover the card to pause.
        </div>
      </aside>
    </div>
  );
};
