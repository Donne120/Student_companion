
import { useState, useCallback } from "react";
import { Message } from "@/types/chat";
import { toast } from "sonner";
import { aiService } from "@/services/aiService";

interface ChatMessageHandlerProps {
  currentConversationId: string;
  messages: Message[];
  onAddMessage: (convId: string, message: Message) => void;
  onUpdateTitle?: (convId: string, title: string) => void;
}

export const useChatMessageHandler = ({
  currentConversationId,
  messages,
  onAddMessage,
  onUpdateTitle
}: ChatMessageHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Optimize the handleSendMessage function with useCallback
  const handleSendMessage = useCallback(async (message: string, files: File[] = []) => {
    if (!message.trim() && files.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    // Process attachments efficiently
    const attachments = files.length > 0 ? await Promise.all(
      files.map(async (file) => ({
        type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
        url: URL.createObjectURL(file),
        name: file.name
      }))
    ) : [];

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isAi: false,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    // Add user message immediately for better UX
    onAddMessage(currentConversationId, newMessage);
    setIsLoading(true);

    try {
      // Use a more efficient toast
      const toastId = toast.loading("Processing your query...");
      
      // Get recent messages for context (limited to MAX_CONTEXT_MESSAGES)
      const MAX_CONTEXT_MESSAGES = 10;
      const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
      
      // Generate AI response
      const aiResponse = await aiService.generateResponse(message, recentMessages);
      
      // Dismiss the loading toast
      toast.dismiss(toastId);
      
      // Add AI message to conversation
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        isAi: true,
        timestamp: Date.now(),
      };
      
      onAddMessage(currentConversationId, aiMessage);
      
      // Update conversation title if this is the first user message (optimized)
      if (messages.length <= 1 && onUpdateTitle) {
        const newTitle = message.length > 30 ? `${message.slice(0, 30)}...` : message;
        onUpdateTitle(currentConversationId, newTitle);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, messages, onAddMessage, onUpdateTitle]);

  const handleEditMessage = useCallback((messageId: string, newText: string) => {
    if (!newText.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    
    const aiMessage = messages.find(msg => msg.isAi && messages.indexOf(msg) > messages.findIndex(m => m.id === messageId));
    if (aiMessage) {
      toast.warning("Editing this message may cause inconsistencies with the AI's response");
    }
  }, [messages]);

  return {
    isLoading,
    handleSendMessage,
    handleEditMessage
  };
};
