import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Loader, MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { sendPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF6] flex flex-col items-center justify-center px-4">
      {/* Top gold bar */}
      <div className="fixed top-0 inset-x-0 h-1 bg-[#D4AF37]" />

      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        {/* Brand mark */}
        <div className="flex items-center gap-2.5 mb-10">
          <img
            src="/logo.png"
            alt="ALU Student Companion"
            className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
          />
          <span className="font-semibold tracking-tight text-[#1A1A1A]">
            ALU Student Companion
          </span>
        </div>

        {sent ? (
          /* ── Success state ─────────────────────────────────────── */
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <MailCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="font-serif text-3xl text-[#1A1A1A] tracking-tight">
              Check your inbox
            </h1>
            <p className="text-[#1A1A1A]/70 leading-relaxed">
              If <span className="font-medium text-[#1A1A1A]">{email}</span> is
              registered, you'll receive a password-reset link within a few minutes.
            </p>
            <p className="text-sm text-[#1A1A1A]/50">
              Didn't get it? Check your spam folder, or{" "}
              <button
                onClick={() => setSent(false)}
                className="text-[#B8941F] hover:underline font-medium"
              >
                try again
              </button>
              .
            </p>
            <div className="pt-4">
              <Link to="/login">
                <Button className="bg-[#1A1A1A] hover:bg-black text-white">
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* ── Form state ────────────────────────────────────────── */
          <>
            <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight mb-3">
              Forgot password?
            </h1>
            <p className="text-[#1A1A1A]/70 mb-10">
              Enter your ALU email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#1A1A1A] mb-2"
                >
                  ALU email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@alustudent.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="h-11 bg-white border-[#E8DDB0] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-0"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#1A1A1A] hover:bg-black text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>

            <p className="mt-8 text-sm text-center text-[#1A1A1A]/70">
              Remembered it?{" "}
              <Link to="/login" className="text-[#B8941F] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
