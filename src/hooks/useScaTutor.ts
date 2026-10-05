import { useState, useCallback, useEffect } from 'react';
import { askSCA, type TutorMessage } from '@/services/scaTutorService';

export function useScaTutor(
  courseId: string,
  courseTitle: string,
  currentLesson?: string,
) {
  const storageKey = `sca-tutor-${courseId}`;

  // Restore from sessionStorage on mount
  const [messages, setMessages] = useState<TutorMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
      }>;
      return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // sessionStorage quota exceeded — non-fatal
    }
  }, [messages, storageKey]);

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;

      const userMsg: TutorMessage = {
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const reply = await askSCA({
          userMessage: text.trim(),
          courseTitle,
          currentLesson,
          conversationHistory: messages,
        });

        const assistantMsg: TutorMessage = {
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errorMsg: TutorMessage = {
          role: 'assistant',
          content:
            'Sorry, I ran into a problem. Please try again in a moment.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        console.error('[SCA] askSCA error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [courseTitle, currentLesson, messages],
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // non-fatal
    }
  }, [storageKey]);

  return { messages, isLoading, sendMessage, clearHistory };
}
