import { useState } from "react";
import { toast } from "sonner";
import { MailCheck, RefreshCw, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Shown by ProtectedRoute to password-signup accounts that haven't clicked
 * their verification link yet. Google accounts never see this — Google has
 * already proven the mailbox is real.
 */
export const VerifyEmailGate = () => {
  const { currentUser, resendVerification, refreshUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentAt, setResentAt] = useState<number | null>(null);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const verified = await refreshUser();
      if (verified) {
        toast.success("Email verified — welcome!");
        // ProtectedRoute re-renders from the refreshed user and lets us through.
      } else {
        toast.error("Not verified yet", {
          description: "Click the link in the email first, then try again.",
        });
      }
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      setResentAt(Date.now());
      toast.success("Verification email sent", {
        description: "Check your inbox — and the spam folder, just in case.",
      });
    } catch (e) {
      toast.error("Could not resend", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#FBF7E9] border border-[#E8DDB0] flex items-center justify-center">
          <MailCheck className="h-7 w-7 text-[#B8941F]" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Verify your email</h1>
          <p className="text-[#1A1A1A]/70 text-sm leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-medium text-[#1A1A1A]">{currentUser?.email}</span>.
            Open it, click the link, then come back here.
          </p>
          <p className="text-xs text-[#1A1A1A]/50">
            No email after a minute? Check your spam folder, or resend below.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleCheck}
            disabled={checking}
            className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] gap-2"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
            I've clicked the link — continue
          </Button>
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resending || (resentAt !== null && Date.now() - resentAt < 30_000)}
            className="w-full gap-2"
          >
            {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {resentAt && Date.now() - resentAt < 30_000 ? "Sent — wait a moment" : "Resend verification email"}
          </Button>
          <button
            onClick={logout}
            className="w-full inline-flex items-center justify-center gap-2 text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] py-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            Use a different account
          </button>
        </div>
      </div>
    </div>
  );
};
