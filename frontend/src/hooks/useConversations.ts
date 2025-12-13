import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Conversation, Message } from "@/types/chat";

const STORAGE_KEY = 'alu_chat_conversations';
const MAX_CONVERSATIONS = 50; // Prevent localStorage from getting too full

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Memoize with useCallback for better performance
  const initializeDefaultConversation = useCallback(() => {
    const now = new Date();
    const defaultConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      timestamp: Date.now(),
      createdAt: now,
      updatedAt: now,
      messages: [{
        id: "welcome",
        text: `# Welcome to ALU Student Companion\n\nI'm here to help! I'll remember our conversation and provide relevant context-aware responses. Feel free to ask any questions!`,
        isAi: true,
        timestamp: Date.now()
      }]
    };
    setConversations([defaultConversation]);
    setCurrentConversationId(defaultConversation.id);
    return defaultConversation;
  }, []);

  useEffect(() => {
    const savedConversations = localStorage.getItem(STORAGE_KEY);
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        if (parsed.length > 0) {
          setConversations(parsed);
          setCurrentConversationId(parsed[0].id);
        } else {
          initializeDefaultConversation();
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error("Failed to load previous conversations");
        initializeDefaultConversation();
      }
    } else {
      initializeDefaultConversation();
    }
    setIsLoading(false);
  }, [initializeDefaultConversation]);

  // More efficient localStorage saving with debounce
  useEffect(() => {
    if (conversations.length > 0 && !isLoading) {
      // Only save the most recent conversations to prevent localStorage overflow
      const conversationsToSave = conversations.slice(0, MAX_CONVERSATIONS);
      const saveTimeout = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(conversationsToSave));
        } catch (error) {
          console.error('Error saving conversations:', error);
          toast.error("Failed to save conversations");
        }
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(saveTimeout);
    }
  }, [conversations, isLoading]);

  const getCurrentConversation = (): Conversation => {
    const current = conversations.find(conv => conv.id === currentConversationId);
    if (!current && conversations.length > 0) {
      return conversations[0];
    }
    if (!current) {
      return initializeDefaultConversation();
    }
    return current;
  };

  const createNewConversation = () => {
    const now = new Date();
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      timestamp: Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const handleDeleteConversation = (convId: string) => {
    const remainingConversations = conversations.filter(conv => conv.id !== convId);
    setConversations(remainingConversations);
    
    if (convId === currentConversationId) {
      if (remainingConversations.length > 0) {
        setCurrentConversationId(remainingConversations[0].id);
      } else {
        createNewConversation();
      }
    }
    
    toast.success("Conversation deleted");
  };

  const updateConversation = (updatedConversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => conv.id === updatedConversation.id ? updatedConversation : conv)
    );
  };

  // Auto-generate conversation titles based on first user message
  const updateConversationTitle = useCallback((convId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId && conv.title === "New Chat" && conv.messages.length >= 2) {
        // Find first user message
        const firstUserMsg = conv.messages.find(m => !m.isAi);
        if (firstUserMsg) {
          // Create title from first ~25 chars of user's first message
          const title = firstUserMsg.text.substring(0, 25) + (firstUserMsg.text.length > 25 ? '...' : '');
          return { ...conv, title };
        }
      }
      return conv;
    }));
  }, []);

  // Call this when adding a message
  const addMessageToConversation = useCallback((convId: string, message: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        const updated = {
          ...conv,
          messages: [...conv.messages, message],
          timestamp: Date.now(),
          updatedAt: new Date()
        };
        return updated;
      }
      return conv;
    }));
    
    // After adding message, try to update title if it's still default
    setTimeout(() => updateConversationTitle(convId), 100);
  }, [updateConversationTitle]);

  const updateMessageInConversation = (convId: string, messageId: string, newText: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        return {
          ...conv,
          messages: conv.messages.map(msg =>
            msg.id === messageId
              ? { ...msg, text: newText, timestamp: Date.now() }
              : msg
          ),
          updatedAt: new Date()
        };
      }
      return conv;
    }));
    toast.success("Message updated successfully");
  };

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    getCurrentConversation,
    createNewConversation,
    handleDeleteConversation,
    updateConversation,
    addMessageToConversation,
    updateMessageInConversation,
    isLoading
  };
};
