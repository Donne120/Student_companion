import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signInWithPopup, signOut } from "firebase/auth";
import { Loader, ShieldCheck, Users } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { API_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { resetParent } from "@/hooks/useParent";
import { resetBranding } from "@/hooks/useBranding";

/**
 * /parents?code=ALU-7KX2-9QPM — a parent or guardian joins their child's
 * university with the code it shared, using a personal Google account.
 *
 * Everything is decided by the backend (parent_access.py): whether parent
 * access is open at all, which university the code belongs to, and that a
 * university email can't join as a parent. Until the platform turns parent
 * access on, every code answers "not available yet".
 */

type Check = { state: "loading" } | { state: "valid"; university: string } | { state: "invalid"; available: boolean };

async function checkCode(code: string): Promise<Check> {
  try {
    const res = await fetch(`${API_URL}/api/parents/check?code=${encodeURIComponent(code)}`);
    const data = (await res.json().catch(() => ({}))) as { valid?: boolean; organization_name?: string; available?: boolean };
    if (res.ok && data.valid && data.organization_name) return { state: "valid", university: data.organization_name };
    return { state: "invalid", available: data.available !== false };
  } catch {
    return { state: "invalid", available: true };
  }
}

async function joinWith(code: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in again.");
  const res = await fetch(`${API_URL}/api/parents/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
    body: JSON.stringify({ code }),
  });
  const data = (await res.json().catch(() => ({}))) as { organization_name?: string; detail?: unknown };
  if (res.ok) return data.organization_name ?? "";
  const detail = data.detail as { message?: string } | string | undefined;
  const message = typeof detail === "string" ? detail : detail?.message;
  const err = new Error(message || "We couldn't add you right now. Please try again in a moment.");
  (err as { status?: number }).status = res.status;
  throw err;
}

const Parents = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [code, setCode] = useState((params.get("code") || "").toUpperCase());
  const [check, setCheck] = useState<Check | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code.replace(/\s/g, "").length < 12) {
      setCheck(null);
      return;
    }
    let live = true;
    setCheck({ state: "loading" });
    checkCode(code.trim()).then((result) => live && setCheck(result));
    return () => {
      live = false;
    };
  }, [code]);

  async function finish() {
    await joinWith(code.trim());
    // The chat asks again who this is: now a parent, with the university's look.
    resetParent();
    resetBranding();
    navigate("/chat?joined=parent", { replace: true });
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      await finish();
    } catch (e) {
      const status = (e as { status?: number }).status;
      // A university email: it must sign in as a student or staff member.
      if (status === 409) await signOut(auth).catch(() => undefined);
      const message = e instanceof Error ? e.message : String(e);
      setError(/popup-closed|cancelled-popup/.test(message) ? null : message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignedIn() {
    setBusy(true);
    setError(null);
    try {
      await finish();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // Signed in with another account (for example a student or alumni email,
  // which can't join as a parent): sign out here so a different Google
  // account can be chosen. The code stays filled in.
  async function switchAccount() {
    setError(null);
    await signOut(auth).catch(() => undefined);
  }

  const ready = check?.state === "valid";

  return (
    <div className="min-h-screen bg-white dark:bg-[#141311] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#FBF7E9] border border-[#E8DDB0] flex items-center justify-center">
            <Users className="h-7 w-7 text-[#B8941F]" />
          </div>
          <h1 className="font-serif text-3xl text-[#1A1A1A] dark:text-[#F3EFE6]">For parents and guardians</h1>
          <p className="text-sm leading-relaxed text-[#1A1A1A]/70 dark:text-[#F3EFE6]/70">
            Ask Student Companion about your child's university: fees and payments, key dates, visas and travel,
            accommodation, wellbeing and family events.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="parent-code" className="text-sm font-medium text-[#1A1A1A] dark:text-[#F3EFE6]">
            Your university's parent code
          </label>
          <input
            id="parent-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. ALU-7KX2-9QPM"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border border-[#E8DDB0] bg-white dark:bg-[#1E1C19] px-3 py-2.5 font-mono tracking-wider text-[#1A1A1A] dark:text-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
          <p className="min-h-5 text-sm" aria-live="polite">
            {check?.state === "loading" ? <span className="text-[#1A1A1A]/50 dark:text-[#F3EFE6]/50">Checking…</span> : null}
            {check?.state === "valid" ? <span className="text-emerald-700 dark:text-emerald-400">You're joining {check.university}.</span> : null}
            {check?.state === "invalid" ? (
              <span className="text-red-700 dark:text-red-400">
                {check.available ? "That code isn't valid. Check it with your child's university." : "Parent access isn't open yet. Please check back soon."}
              </span>
            ) : null}
          </p>
        </div>

        {currentUser ? (
          <div className="space-y-3">
          <button
            type="button"
            onClick={handleSignedIn}
            disabled={!ready || busy}
            className="w-full rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#B8941F] disabled:opacity-50"
          >
            {busy ? "Joining…" : `Join as ${currentUser.email}`}
          </button>
          <p className="text-center text-sm text-[#1A1A1A]/60 dark:text-[#F3EFE6]/60">
            Not the email you want to use?{" "}
            <button
              type="button"
              onClick={switchAccount}
              disabled={busy}
              className="font-medium text-[#8A6D12] underline underline-offset-4 hover:text-[#1A1A1A] dark:text-[#D4AF37] dark:hover:text-[#F3EFE6] disabled:opacity-50"
            >
              Use a different account
            </button>
          </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGoogle}
            disabled={!ready || busy}
            className="flex w-full items-center justify-center rounded-lg border border-[#E8DDB0] bg-white dark:bg-[#1E1C19] px-4 py-2.5 text-sm font-medium text-[#1A1A1A] dark:text-[#F3EFE6] hover:bg-[#FBF7E9] dark:hover:bg-[#26231F] disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Connecting…
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        )}

        {error ? <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}

        <div className="flex gap-3 rounded-lg bg-[#FBF7E9] dark:bg-[#1E1C19] p-4 text-xs leading-relaxed text-[#1A1A1A]/70 dark:text-[#F3EFE6]/70">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#B8941F]" aria-hidden="true" />
          <p>
            We keep your email and the university you joined, nothing else. Student Companion answers general
            questions about the university; it can't see or share your child's grades, fees, attendance or other
            records. Students sign in with their university email on the normal sign-in page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Parents;
