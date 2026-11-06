import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Conversation, Message } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";

// Chats are kept in this browser, one list per signed-in account. They used to
// share one key, so every account signed in on the same browser (a student
// and a staff address, or two students on a shared computer) saw the same
// history.
const LEGACY_STORAGE_KEY = 'sc_chat_conversations';
export const storageKeyFor = (uid: string) => `${LEGACY_STORAGE_KEY}:${uid}`;

/** The saved chats for `uid`. The old shared list is handed, once, to the
 *  first account that signs in on this browser after the update (on a
 *  personal device, its owner) and then removed, so it can never reach a
 *  second account. */
export function loadSavedConversations(storage: Storage, uid: string): string | null {
  const key = storageKeyFor(uid);
  const own = storage.getItem(key);
  if (own !== null) return own;
  const legacy = storage.getItem(LEGACY_STORAGE_KEY);
  if (legacy !== null) {
    storage.removeItem(LEGACY_STORAGE_KEY);
    storage.setItem(key, legacy);
  }
  return legacy;
}
const MAX_CONVERSATIONS = 50; // Prevent localStorage from getting too full

/** Saved chats as the welcome screen expects them: without the old built-in
 *  welcome message, and with at most one empty chat. */
export function tidySavedConversations(saved: Conversation[]): Conversation[] {
  if (!Array.isArray(saved)) return [];
  let keptEmpty = false;
  return saved
    .map(conv => ({ ...conv, messages: (conv.messages || []).filter(m => m.id !== "welcome") }))
    .filter(conv => {
      if (conv.messages.length > 0) return true;
      if (keptEmpty) return false;
      keptEmpty = true;
      return true;
    });
}

export const useConversations = () => {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? "";
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  // The account whose chats are in state; saving waits until it matches, so
  // one account's chats are never written under another's key on a switch.
  const [loadedFor, setLoadedFor] = useState("");

  // Memoize with useCallback for better performance
  const initializeDefaultConversation = useCallback(() => {
    const now = new Date();
    const defaultConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      timestamp: Date.now(),
      createdAt: now,
      updatedAt: now,
      // Empty on purpose: an empty chat shows the welcome screen with its
      // suggestions (ChatMessages). A welcome *message* hid that screen.
      messages: []
    };
    setConversations([defaultConversation]);
    setCurrentConversationId(defaultConversation.id);
    return defaultConversation;
  }, []);

  useEffect(() => {
    if (!uid) return; // The chat page is only shown signed in; wait for the account.
    setIsLoading(true);
    let savedConversations: string | null = null;
    try {
      savedConversations = loadSavedConversations(localStorage, uid);
    } catch (error) {
      console.error('Error reading saved conversations:', error);
    }
    if (savedConversations) {
      try {
        const parsed = tidySavedConversations(JSON.parse(savedConversations));
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
    setLoadedFor(uid);
    setIsLoading(false);
  }, [uid, initializeDefaultConversation]);

  // More efficient localStorage saving with debounce
  useEffect(() => {
    if (uid && loadedFor === uid && conversations.length > 0 && !isLoading) {
      // Only save the most recent conversations to prevent localStorage overflow
      const conversationsToSave = conversations.slice(0, MAX_CONVERSATIONS);
      const saveTimeout = setTimeout(() => {
        try {
          localStorage.setItem(storageKeyFor(uid), JSON.stringify(conversationsToSave));
        } catch (error) {
          console.error('Error saving conversations:', error);
          toast.error("Failed to save conversations");
        }
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(saveTimeout);
    }
  }, [uid, loadedFor, conversations, isLoading]);

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
    // Reuse an untouched chat rather than stacking "New chat" entries.
    const empty = conversations.find(conv => conv.messages.length === 0);
    if (empty) {
      setConversations(prev => [empty, ...prev.filter(conv => conv.id !== empty.id)]);
      setCurrentConversationId(empty.id);
      return;
    }
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

  const updateMessageInConversation = (
    convId: string,
    messageId: string,
    newText: string,
    options: { silent?: boolean; sources?: Message["sources"]; relatedTopics?: string[] } = {}
  ) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        return {
          ...conv,
          messages: conv.messages.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  text: newText,
                  timestamp: Date.now(),
                  ...(options.sources !== undefined ? { sources: options.sources } : {}),
                  ...(options.relatedTopics !== undefined ? { relatedTopics: options.relatedTopics } : {}),
                }
              : msg
          ),
          updatedAt: new Date()
        };
      }
      return conv;
    }));
    if (!options.silent) {
      toast.success("Message updated successfully");
    }
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
