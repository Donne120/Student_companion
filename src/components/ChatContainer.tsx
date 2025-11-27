
import { useConversations } from "@/hooks/useConversations";
import { useChatMessageHandler } from "./chat/ChatMessageHandler";
import { ChatInput } from "./ChatInput";
import { ConversationSidebar } from "./chat/ConversationSidebar";
import { ChatMessages } from "./chat/ChatMessages";
import { NewsUpdate } from "./news/NewsUpdate";
import { Conversation } from "@/types/chat";
import { BackendStatus } from "./chat/BackendStatus";
import { useEffect, useState } from "react";

export const ChatContainer = () => {
  const [activeModel, setActiveModel] = useState("gemini");
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  
  useEffect(() => {
    // Load settings from localStorage
    const savedModel = localStorage.getItem("ACTIVE_MODEL") || "gemini";
    const savedAccessibilityMode = localStorage.getItem("ACCESSIBILITY_MODE") === "true";
    
    setActiveModel(savedModel);
    setAccessibilityMode(savedAccessibilityMode);
  }, []);

  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    getCurrentConversation,
    createNewConversation,
    handleDeleteConversation,
    addMessageToConversation,
    updateMessageInConversation
  } = useConversations();

  // Get the current conversation safely
  const currentConversation = getCurrentConversation();

  const updateConversationTitle = (convId: string, title: string) => {
    if (!conversations) return;
    
    const conversation = conversations.find(c => c.id === convId);
    if (conversation) {
      const updatedConversation: Conversation = {
        ...conversation,
        title
      };
      conversations.map(c => c.id === convId ? updatedConversation : c);
    }
  };

  const {
    isLoading,
    handleSendMessage,
    handleEditMessage
  } = useChatMessageHandler({
    currentConversationId,
    messages: currentConversation?.messages || [],
    onAddMessage: addMessageToConversation,
    onUpdateTitle: updateConversationTitle
  });

  const handleEditMessageWrapper = (messageId: string, newText: string) => {
    handleEditMessage(messageId, newText);
    updateMessageInConversation(currentConversationId, messageId, newText);
  };

  // Apply accessibility classes if enabled
  const containerClasses = `min-h-screen bg-brand-gradient font-inter text-white flex 
    ${accessibilityMode ? 'text-lg leading-relaxed' : ''}`;

  return (
    <div className={containerClasses}>
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={createNewConversation}
        onSelectConversation={setCurrentConversationId}
        onDeleteConversation={handleDeleteConversation}
      />
      <div className="flex-1 pl-0 md:pl-16 lg:pl-64 transition-all duration-300 flex">
        <div className="flex-1 relative">
          <div className="absolute top-4 right-2 sm:right-4 z-10">
            <BackendStatus />
          </div>
          <div className="pb-24 sm:pb-28 md:pb-32 pt-16 md:pt-0">
            <ChatMessages
              messages={currentConversation?.messages || []}
              isLoading={isLoading}
              onEditMessage={handleEditMessageWrapper}
              activeModel={activeModel}
            />
          </div>
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
        <div className="hidden lg:block w-80 h-screen sticky top-0">
          <NewsUpdate />
        </div>
      </div>
    </div>
  );
};
