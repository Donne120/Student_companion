import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface TwoStepCodeFormProps {
  onSubmit: (code: string) => Promise<void>;
  onBack: () => void;
}

/** "Enter the code from your authenticator app" step at sign-in. */
export function TwoStepCodeForm({ onSubmit, onBack }: TwoStepCodeFormProps) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(code);
    } catch (error) {
      setCode("");
      toast.error(error instanceof Error ? error.message : "That code didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-[#E8DDB0] bg-[#FBF7E9] p-3 text-sm text-[#1A1A1A]/80">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[#B8941F]" />
        <p>Your account uses two-step sign-in. Open your authenticator app and enter the 6-digit code for Student Companion AI.</p>
      </div>
      <div>
        <label htmlFor="two-step-code" className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Code
        </label>
        <Input
          id="two-step-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          autoFocus
          className="h-11 bg-white border-[#E8DDB0] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-0 tracking-[0.4em] text-lg"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-12 bg-[#1A1A1A] hover:bg-black text-white font-medium"
        disabled={busy || code.length < 6}
      >
        {busy ? <Loader className="h-4 w-4 animate-spin" /> : "Verify and sign in"}
      </Button>
      <button type="button" onClick={onBack} className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A]">
        ← Back
      </button>
    </form>
  );
}
