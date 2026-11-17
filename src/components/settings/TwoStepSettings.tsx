import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import * as cognito from "@/lib/cognito";

const inputClass =
  "h-10 bg-white border-[#E8DDB0] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-0";

type Stage =
  | { kind: "password" }
  | { kind: "code"; challenge: cognito.TwoStepRequired }
  | { kind: "status"; token: string; on: boolean }
  | { kind: "scan"; token: string; secret: string; qr: string };

/**
 * Two-step sign-in with an authenticator app (Google Authenticator,
 * Microsoft Authenticator, 1Password...), for email + password accounts.
 * Admins need it once the platform requires it; anyone may turn it on.
 * Changing it asks for the password again, so an unlocked laptop isn't enough.
 */
export function TwoStepSettings() {
  const { currentUser } = useAuth();
  const email = currentUser?.email || "";
  const google = currentUser?.providerData.some((p) => p.providerId === "google.com");
  const [stage, setStage] = useState<Stage>({ kind: "password" });
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setCode(""), [stage.kind]);

  if (google) {
    return (
      <p className="text-sm text-[#1A1A1A]/70">
        You sign in with Google. Turn on <span className="font-medium text-[#1A1A1A]">2-Step Verification</span> in
        your Google account (myaccount.google.com, Security) and it protects your Student Companion sign-in too.
      </p>
    );
  }
  if (!cognito.cognitoEnabled) {
    return <p className="text-sm text-[#1A1A1A]/70">Two-step sign-in isn't available on this version of the site.</p>;
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signedIn = async (tokens: cognito.CognitoTokens) => {
    setPassword("");
    const on = await cognito.twoStepEnabled(tokens.accessToken);
    setStage({ kind: "status", token: tokens.accessToken, on });
  };

  const checkPassword = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      try {
        await signedIn(await cognito.signIn(email, password));
      } catch (error) {
        if (error instanceof cognito.TwoStepRequired) {
          setStage({ kind: "code", challenge: error });
          return;
        }
        throw error;
      }
    });
  };

  const startSetup = (token: string) =>
    run(async () => {
      const secret = await cognito.startTwoStepSetup(token);
      const qr = await QRCode.toDataURL(cognito.authenticatorLink(secret, email), { margin: 1, width: 200 });
      setStage({ kind: "scan", token, secret, qr });
    });

  return (
    <div className="space-y-4 text-sm">
      {stage.kind === "password" && (
        <form onSubmit={checkPassword} className="space-y-3">
          <p className="text-[#1A1A1A]/70">
            Ask for a code from an authenticator app on your phone every time you sign in, as well as your password.
            Enter your password to see or change this setting.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              aria-label="Your password"
              required
            />
            <Button type="submit" disabled={busy || !password} className="bg-[#1A1A1A] hover:bg-black text-white">
              {busy ? <Loader className="h-4 w-4 animate-spin" /> : "Continue"}
            </Button>
          </div>
        </form>
      )}

      {stage.kind === "code" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => signedIn(await cognito.respondToTwoStep(stage.challenge, code)));
          }}
          className="space-y-3"
        >
          <p className="text-[#1A1A1A]/70">Enter the current code from your authenticator app.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${inputClass} tracking-[0.3em]`}
              aria-label="Code from your authenticator app"
              autoFocus
            />
            <Button type="submit" disabled={busy || code.length < 6} className="bg-[#1A1A1A] hover:bg-black text-white">
              {busy ? <Loader className="h-4 w-4 animate-spin" /> : "Verify"}
            </Button>
          </div>
        </form>
      )}

      {stage.kind === "status" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {stage.on ? (
              <ShieldCheck className="h-5 w-5 text-[#2E7D32]" />
            ) : (
              <ShieldOff className="h-5 w-5 text-[#6B6355]" />
            )}
            <span className="font-medium text-[#1A1A1A]">
              Two-step sign-in is {stage.on ? "on" : "off"}
            </span>
          </div>
          {stage.on ? (
            <>
              <p className="text-[#1A1A1A]/70">
                You'll be asked for a code from your authenticator app every time you sign in with your password.
              </p>
              <Button
                variant="outline"
                disabled={busy}
                className="border-[#E8DDB0]"
                onClick={() =>
                  run(async () => {
                    await cognito.setTwoStep(stage.token, false);
                    setStage({ ...stage, on: false });
                    toast.success("Two-step sign-in is off");
                  })
                }
              >
                Turn off
              </Button>
            </>
          ) : (
            <Button disabled={busy} className="bg-[#1A1A1A] hover:bg-black text-white" onClick={() => startSetup(stage.token)}>
              {busy ? <Loader className="h-4 w-4 animate-spin" /> : "Set up an authenticator app"}
            </Button>
          )}
        </div>
      )}

      {stage.kind === "scan" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await cognito.finishTwoStepSetup(stage.token, code);
              setStage({ kind: "status", token: stage.token, on: true });
              toast.success("Two-step sign-in is on", { description: "You'll need a code next time you sign in." });
            });
          }}
          className="space-y-3"
        >
          <ol className="list-decimal pl-5 space-y-1 text-[#1A1A1A]/80">
            <li>Open an authenticator app on your phone (Google Authenticator, Microsoft Authenticator, 1Password...).</li>
            <li>Add an account and scan this code.</li>
            <li>Type the 6-digit code the app shows.</li>
          </ol>
          <img src={stage.qr} alt="QR code to add Student Companion AI to your authenticator app" className="h-44 w-44 rounded-md border border-[#E8DDB0] bg-white p-1" />
          <p className="text-xs text-[#1A1A1A]/60 break-all">
            Can't scan? Enter this key in the app: <span className="font-mono text-[#1A1A1A]">{stage.secret}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${inputClass} tracking-[0.3em]`}
              aria-label="Code from your authenticator app"
            />
            <Button type="submit" disabled={busy || code.length < 6} className="bg-[#1A1A1A] hover:bg-black text-white">
              {busy ? <Loader className="h-4 w-4 animate-spin" /> : "Turn on"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
