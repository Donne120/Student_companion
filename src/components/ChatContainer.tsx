
import { useConversations } from "@/hooks/useConversations";
import { useChatMessageHandler } from "./chat/ChatMessageHandler";
import { ChatInput } from "./ChatInput";
import { ConversationSidebar } from "./chat/ConversationSidebar";
import { ChatMessages } from "./chat/ChatMessages";
import { NewsUpdate } from "./news/NewsUpdate";
import { Conversation } from "@/types/chat";
import { BackendStatus } from "./chat/BackendStatus";
import { GlobalSearch } from "./features/GlobalSearch";
import { KeyboardShortcutsDialog } from "./features/KeyboardShortcutsDialog";
import { MobileActionButton } from "./mobile/MobileActionButton";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const ChatContainer = () => {
  const [activeModel, setActiveModel] = useState("gemini");
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [features, setFeatures] = useState<any[]>([]);
  
  useEffect(() => {
    // Load settings from localStorage
    const savedModel = localStorage.getItem("ACTIVE_MODEL") || "gemini";
    const savedAccessibilityMode = localStorage.getItem("ACCESSIBILITY_MODE") === "true";
    const savedFeatures = JSON.parse(localStorage.getItem("FEATURES") || "[]");
    
    setActiveModel(savedModel);
    setAccessibilityMode(savedAccessibilityMode);
    setFeatures(savedFeatures);
    
    console.log('✅ Loaded features from settings:', savedFeatures);
  }, []);

  // ✅ Helper function to check if a feature is enabled
  const isFeatureEnabled = (featureId: string): boolean => {
    const feature = features.find((f: any) => f.id === featureId);
    // Default to true if feature not found (backwards compatibility)
    return feature?.enabled !== false;
  };

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
    // This function is now handled by the useConversations hook
    // No need to update here as the hook manages conversation state
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

  // Handle search result selection
  const handleSearchSelect = (result: any) => {
    if (result.type === 'conversation') {
      setCurrentConversationId(result.id);
      toast.success('Conversation opened');
    } else if (result.type === 'message' && result.conversationId) {
      setCurrentConversationId(result.conversationId);
      toast.success('Jumped to message');
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      action: () => setSearchOpen(true),
      description: 'Open search',
    },
    {
      key: 'n',
      ctrl: true,
      action: () => {
        createNewConversation();
        toast.success('New conversation created');
      },
      description: 'New conversation',
    },
    {
      key: '/',
      ctrl: true,
      action: () => setShortcutsOpen(true),
      description: 'Show keyboard shortcuts',
    },
    {
      key: 'b',
      ctrl: true,
      action: () => {
        setSidebarCollapsed(!sidebarCollapsed);
        toast.success(sidebarCollapsed ? 'Sidebar expanded' : 'Sidebar collapsed');
      },
      description: 'Toggle sidebar',
    },
    {
      key: 'Escape',
      action: () => {
        setSearchOpen(false);
        setShortcutsOpen(false);
      },
      description: 'Close dialogs',
    },
  ]);

  // Mobile swipe gestures
  useSwipeGesture({
    onSwipeRight: () => {
      // Open sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarCollapsed(false);
        toast.success('Sidebar opened');
      }
    },
    onSwipeLeft: () => {
      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
        toast.success('Sidebar closed');
      }
    },
    threshold: 100,
    enabled: true,
  });

  // Apply accessibility classes if enabled
  const containerClasses = `min-h-screen bg-brand-gradient font-inter text-white flex 
    ${accessibilityMode ? 'text-lg leading-relaxed' : ''}`;

  return (
    <>
      <div className={containerClasses}>
        {/* ✅ Conditionally render Conversation History based on feature toggle */}
        {isFeatureEnabled('chat_history') && (
          <ConversationSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onNewChat={createNewConversation}
            onSelectConversation={setCurrentConversationId}
            onDeleteConversation={handleDeleteConversation}
          />
        )}
        <div className={`flex-1 transition-all duration-300 flex ${
          isFeatureEnabled('chat_history') ? 'pl-16 md:pl-64' : 'pl-0'
        }`}>
          <div className="flex-1 relative">
            <div className="absolute top-4 right-4 z-10">
              <BackendStatus />
            </div>
            <div className="pb-32">
              <ChatMessages
                messages={currentConversation?.messages || []}
                isLoading={isLoading}
                onEditMessage={handleEditMessageWrapper}
                activeModel={activeModel}
              />
            </div>
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>
          {/* ✅ Conditionally render Responsive UI (News Panel) */}
          {isFeatureEnabled('responsive_ui') && (
            <div className="hidden lg:block w-80 h-screen sticky top-0">
              <NewsUpdate />
            </div>
          )}
        </div>
      </div>

      {/* ✅ Conditionally render Contextual Search based on feature toggle */}
      {isFeatureEnabled('contextual_search') && (
        <GlobalSearch
          conversations={conversations}
          onSelect={handleSearchSelect}
          open={searchOpen}
          onOpenChange={setSearchOpen}
        />
      )}

      {/* Keyboard Shortcuts Dialog - always show */}
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />

      {/* ✅ Conditionally render Mobile UI based on feature toggle */}
      {isFeatureEnabled('responsive_ui') && (
        <MobileActionButton
          onNewChat={() => {
            createNewConversation();
            toast.success('New conversation created');
          }}
          onSearch={() => setSearchOpen(true)}
          onShortcuts={() => setShortcutsOpen(true)}
          onMenu={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}
    </>
  );
};
