import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ChatFeedbackProps {
  messageId: string;
  messageContent: string;
  onFeedbackSubmit: (messageId: string, type: 'positive' | 'negative', details?: string) => void;
}

export function ChatFeedback({ messageId, messageContent, onFeedbackSubmit }: ChatFeedbackProps) {
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Check if feedback collection is enabled
  const isCollectFeedback = localStorage.getItem('COLLECT_FEEDBACK') !== 'false';
  const isDetailedNegative = localStorage.getItem('DETAILED_NEGATIVE_FEEDBACK') !== 'false';
  
  if (!isCollectFeedback || feedbackSubmitted) {
    return null;
  }

  const handleFeedbackClick = (type: 'positive' | 'negative') => {
    setFeedbackType(type);
    
    // For positive feedback, submit immediately unless we want details
    if (type === 'positive') {
      submitFeedback(type);
    }
  };

  const submitFeedback = (type: 'positive' | 'negative', details?: string) => {
    setIsSubmitting(true);
    
    try {
      // Call the parent handler
      onFeedbackSubmit(messageId, type, details || feedbackDetails);
      
      // Store in localStorage for analytics
      const feedback = JSON.parse(localStorage.getItem('FEEDBACK') || '[]');
      feedback.push({
        id: crypto.randomUUID(),
        type,
        userQuery: "User query", // This would come from context in a real implementation
        message: messageContent,
        details: details || feedbackDetails,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('FEEDBACK', JSON.stringify(feedback));
      
      // Update satisfaction rate in analytics
      const storedAnalytics = JSON.parse(localStorage.getItem('ALU_CHATBOT_ANALYTICS') || '{}');
      if (storedAnalytics) {
        const positiveFeedback = feedback.filter(f => f.type === 'positive').length;
        const feedbackRatio = feedback.length > 0 
          ? (positiveFeedback / feedback.length) * 100 
          : 0;
        
        storedAnalytics.userSatisfaction = feedbackRatio;
        localStorage.setItem('ALU_CHATBOT_ANALYTICS', JSON.stringify(storedAnalytics));
      }
      
      setFeedbackSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2">
      {feedbackType === null ? (
        <div className="flex items-center justify-end gap-2 mt-1">
          <span className="text-xs text-muted-foreground">Was this helpful?</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => handleFeedbackClick('positive')}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Yes
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleFeedbackClick('negative')}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            No
          </Button>
        </div>
      ) : feedbackType === 'negative' && isDetailedNegative ? (
        <div className="border border-red-200 rounded-md p-3 mt-2 bg-red-50">
          <p className="text-sm mb-2 text-red-700">What could be improved?</p>
          <Textarea
            placeholder="Please provide details about what was incorrect or unhelpful..."
            className="resize-none text-sm mb-2 min-h-[80px]"
            value={feedbackDetails}
            onChange={(e) => setFeedbackDetails(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => setFeedbackType(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 bg-red-600 hover:bg-red-700"
              onClick={() => submitFeedback('negative')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}