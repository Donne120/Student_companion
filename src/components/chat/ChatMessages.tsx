import { Message } from "@/types/chat";
import { ChatMessage } from "../ChatMessage";
import { Loader, Bot, Stars } from "lucide-react";
import { useEffect, useRef } from "react";
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage: (messageId: string, newText: string) => void;
  activeModel?: string;
}

export const ChatMessages = ({ messages, isLoading, onEditMessage, activeModel = "gemini" }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFeedback = (messageId: string, type: 'positive' | 'negative', details?: string) => {
    // Store in localStorage
    const feedback = JSON.parse(localStorage.getItem('FEEDBACK') || '[]');
    const messageData = messages.find(m => m.id === messageId);
    
    feedback.push({
      id: crypto.randomUUID(),
      type,
      userQuery: messages.find(m => !m.isAi && messages.indexOf(m) < messages.indexOf(messageData))?.text || "",
      message: messageData?.text || "",
      details,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('FEEDBACK', JSON.stringify(feedback));
    
    // You could also update the message to show feedback was given
    // onEditMessage(messageId, messageData.text, { feedbackGiven: true });
  };

  if (messages.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-300 px-4 bg-brand-blue-dark">
        <div className="flex items-center justify-center mb-8">
          <img 
            src="/logo.png" 
            alt="Student Companion AI" 
            className="h-24 w-auto object-contain animate-pulse"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-brand-gradient-gold text-transparent bg-clip-text">
          Student Companion AI
        </h1>
        <div className="max-w-xl text-center space-y-6">
          <p className="text-lg text-gray-300">Welcome! How can I help you today?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md mx-auto">
            <div className="p-4 rounded-lg bg-brand-blue/50 border border-brand-gold/20 backdrop-blur-sm hover:bg-brand-blue transition-all">
              <h3 className="font-medium text-brand-gold mb-1">Academic Support</h3>
              <p className="text-sm">Get help with assignments, courses, and learning resources</p>
            </div>
            <div className="p-4 rounded-lg bg-brand-blue/50 border border-brand-gold/20 backdrop-blur-sm hover:bg-brand-blue transition-all">
              <h3 className="font-medium text-brand-gold mb-1">Campus Services</h3>
              <p className="text-sm">Connect with departments, schedule appointments</p>
            </div>
            <div className="p-4 rounded-lg bg-brand-blue/50 border border-brand-gold/20 backdrop-blur-sm hover:bg-brand-blue transition-all">
              <h3 className="font-medium text-brand-gold mb-1">Personal Growth</h3>
              <p className="text-sm">Career advice, skill development, and mentorship</p>
            </div>
            <div className="p-4 rounded-lg bg-brand-blue/50 border border-brand-gold/20 backdrop-blur-sm hover:bg-brand-blue transition-all">
              <h3 className="font-medium text-brand-gold mb-1">Event Planning</h3>
              <p className="text-sm">Stay updated on campus events and activities</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            I remember our conversations and provide context-aware responses to better assist you through your ALU journey.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-blue-dark min-h-screen">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message.text}
          isAi={message.isAi}
          attachments={message.attachments}
          onEdit={(newText) => onEditMessage(message.id, newText)}
          onFeedback={(type, details) => handleFeedback(message.id, type, details)}
        />
      ))}
      {isLoading && (
        <div className="py-6 px-6 md:px-12 lg:px-16 text-gray-400">
          <div className="max-w-4xl mx-auto flex gap-4 items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-brand-gradient-gold flex items-center justify-center p-1.5 shadow-lg animate-pulse">
                <img 
                  src="/logo.png" 
                  alt="Student Companion AI" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex space-x-2 items-center">
                <div className="w-8 h-8">
                  {activeModel === 'deepseek' ? (
                    <Stars className="w-full h-full animate-pulse text-[#00a3ff]" />
                  ) : (
                    <Loader className="w-full h-full animate-spin text-brand-gold" />
                  )}
                </div>
                <span className="text-sm text-gray-300">
                  {activeModel === 'deepseek' ? 
                    'DeepSeek AI is generating a response...' : 
                    'Student Companion AI is thinking...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
