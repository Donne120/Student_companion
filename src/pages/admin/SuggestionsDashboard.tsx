import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, RefreshCw, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { requireAdmin } from "@/utils/adminAuth";
import { useAuth } from "@/contexts/AuthContext";
import {
  suggestionService,
  type AnswerSuggestion,
} from "@/services/suggestionService";

const formatDate = (ms: number) =>
  ms
    ? new Date(ms).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

function SuggestionsDashboard() {
  const { currentUser } = useAuth();
  const [suggestions, setSuggestions] = useState<AnswerSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [showRejectBox, setShowRejectBox] = useState<Record<string, boolean>>({});

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await suggestionService.getPendingSuggestions();
      setSuggestions(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleApprove = async (id: string) => {
    if (!currentUser) return;
    setActionId(id);
    try {
      await suggestionService.approveSuggestion(id, currentUser.uid);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Suggestion approved");
    } catch {
      toast.error("Failed to approve suggestion");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!currentUser) return;
    setActionId(id);
    try {
      await suggestionService.rejectSuggestion(
        id,
        currentUser.uid,
        rejectNotes[id]?.trim() || undefined
      );
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Suggestion rejected");
    } catch {
      toast.error("Failed to reject suggestion");
    } finally {
      setActionId(null);
      setShowRejectBox((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-[#D4AF37]">
            Answer Suggestions
          </h1>
        </div>
        <Button variant="outline" size="icon" onClick={fetchSuggestions} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#D4AF37]">
              {loading ? "—" : suggestions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading suggestions…
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={fetchSuggestions} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      ) : suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No pending suggestions — you're all caught up!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base mb-1">Student Question</CardTitle>
                    <CardDescription className="text-sm text-[#1A1A1A]/80 font-medium">
                      {s.questionText}
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Pending
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(s.submittedAt)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#FBF7E9] rounded-lg p-4 border border-[#E8DDB0]">
                  <p className="text-xs uppercase tracking-wider text-[#B8941F] font-medium mb-2">
                    Suggested Answer
                  </p>
                  <p className="text-sm text-[#1A1A1A]/80 leading-relaxed whitespace-pre-wrap">
                    {s.suggestedAnswer}
                  </p>
                </div>

                {/* Rejection note box */}
                {showRejectBox[s.id] && (
                  <div>
                    <Textarea
                      placeholder="Optional rejection note for record-keeping…"
                      value={rejectNotes[s.id] ?? ""}
                      onChange={(e) =>
                        setRejectNotes((prev) => ({ ...prev, [s.id]: e.target.value }))
                      }
                      className="resize-none text-sm"
                      rows={2}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                    onClick={() => handleApprove(s.id)}
                    disabled={actionId === s.id}
                  >
                    {actionId === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve
                  </Button>

                  {showRejectBox[s.id] ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5"
                      onClick={() => handleReject(s.id)}
                      disabled={actionId === s.id}
                    >
                      {actionId === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Confirm Reject
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() =>
                        setShowRejectBox((prev) => ({ ...prev, [s.id]: true }))
                      }
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  )}

                  <span className="text-xs text-muted-foreground ml-auto">
                    ID: {s.id.slice(0, 8)}…
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const SuggestionsDashboardWithAuth = requireAdmin(SuggestionsDashboard);
export default SuggestionsDashboardWithAuth;
