import { useState } from "react";
import { Lightbulb, X, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { suggestionService } from "@/services/suggestionService";
import { toast } from "sonner";

interface AnswerSuggestionFormProps {
  questionText: string;
}

export const AnswerSuggestionForm = ({ questionText }: AnswerSuggestionFormProps) => {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-[#B8941F] bg-[#FBF7E9] border border-[#E8DDB0] rounded-lg px-3 py-2">
        <Lightbulb className="h-3.5 w-3.5 flex-shrink-0" />
        Thanks! Your suggestion is under review.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#1A1A1A]/50 hover:text-[#B8941F] transition-colors"
      >
        <Lightbulb className="h-3.5 w-3.5" />
        Know the answer? Suggest one
      </button>
    );
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error("Sign in to submit a suggestion");
      return;
    }
    if (answer.trim().length < 10) {
      toast.error("Answer must be at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      await suggestionService.submitSuggestion(currentUser.uid, questionText, answer);
      setSubmitted(true);
      toast.success("Suggestion submitted for review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-[#E8DDB0] bg-[#FBF7E9]/60 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#B8941F]">
          <Lightbulb className="h-3.5 w-3.5" />
          Suggest an answer
        </span>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded hover:bg-[#E8DDB0]/60 text-[#1A1A1A]/40"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-xs text-[#1A1A1A]/50 mb-2 leading-relaxed line-clamp-2">
        Question: {questionText}
      </p>
      {!currentUser ? (
        <p className="text-xs text-[#1A1A1A]/50">
          Please{" "}
          <a href="/login" className="text-[#B8941F] hover:underline">
            sign in
          </a>{" "}
          to submit a suggestion.
        </p>
      ) : (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Share what you know… (10–2000 characters)"
            maxLength={2000}
            rows={3}
            className="w-full text-xs rounded-lg border border-[#E8DDB0] bg-white p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[#1A1A1A]/40">
              {answer.length}/2000
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting || answer.trim().length < 10}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-black text-white text-xs font-medium disabled:opacity-40 transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
};
