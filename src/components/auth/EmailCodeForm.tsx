import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { toast } from "sonner";

const inputClass =
  "h-11 bg-white border-[#E8DDB0] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-0";

interface EmailCodeFormProps {
  email: string;
  /** Called with the code (and the new password, when askNewPassword). */
  onSubmit: (code: string, newPassword?: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  submitLabel: string;
  /** Password reset: also ask for a new password. */
  askNewPassword?: boolean;
}

/** "Enter the 6-digit code we emailed you" step, shared by sign-up, login and reset. */
export function EmailCodeForm({ email, onSubmit, onResend, onBack, submitLabel, askNewPassword }: EmailCodeFormProps) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(code, askNewPassword ? newPassword : undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await onResend();
      toast.success("We sent a new code", { description: `Check ${email} (and your spam folder).` });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send a new code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-[#1A1A1A]/70">
        We emailed a 6-digit code to <span className="font-medium text-[#1A1A1A]">{email}</span>. It can take a
        minute to arrive; check your spam folder too.
      </p>
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Code
        </label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          autoFocus
          className={`${inputClass} tracking-[0.4em] text-lg`}
        />
      </div>
      {askNewPassword && (
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-[#1A1A1A] mb-2">
            New password
          </label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
            className={inputClass}
          />
        </div>
      )}
      <Button
        type="submit"
        className="w-full h-12 bg-[#1A1A1A] hover:bg-black text-white font-medium"
        disabled={busy || code.length < 6}
      >
        {busy ? <Loader className="h-4 w-4 animate-spin" /> : submitLabel}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-[#1A1A1A]/60 hover:text-[#1A1A1A]">
          ← Back
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="text-[#B8941F] hover:underline font-medium disabled:opacity-50"
        >
          {resending ? "Sending…" : "Send a new code"}
        </button>
      </div>
    </form>
  );
}
