import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Volume2, Loader2, Unplug, PlayCircle, StopCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  emailBriefingService,
  EmailBriefingPrefs,
  DEFAULT_BRIEFING_PREFS,
} from "@/services/emailBriefingService";
import { speak, stopSpeaking, speechSupported } from "@/utils/speech";

const CATEGORY_TOGGLES: { key: keyof EmailBriefingPrefs; label: string; hint: string }[] = [
  { key: "assignments", label: "Assignments & due dates", hint: "Homework, submissions, deadlines" },
  { key: "classes", label: "Classes & schedule", hint: "Upcoming sessions, room or time changes" },
  { key: "congratulations", label: "Congratulations & achievements", hint: "Grades, awards, milestones" },
  { key: "announcements", label: "Announcements & events", hint: "School news, events, opportunities" },
  { key: "other", label: "Everything else", hint: "Any other email that looks important" },
];

/**
 * "Email briefing" card for the Settings page: connect the student's ALU
 * Gmail, choose what the Companion should mention, and preview the spoken
 * briefing. Server side: backend_hf/email_briefing.py.
 */
export const EmailBriefingSettings = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [connected, setConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<EmailBriefingPrefs>(DEFAULT_BRIEFING_PREFS);
  const [busy, setBusy] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      const status = await emailBriefingService.getStatus();
      setConfigured(status.configured);
      setConnected(status.connected);
      setGoogleEmail(status.google_email);
      setPrefs({ ...DEFAULT_BRIEFING_PREFS, ...status.prefs });
    } catch {
      // Backend unreachable — leave defaults, the card explains itself.
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Handle the redirect back from Google (?email_briefing=connected|denied|...)
  useEffect(() => {
    const outcome = searchParams.get("email_briefing");
    if (!outcome) return;
    if (outcome === "connected") {
      toast.success("Email connected", {
        description: "Your Companion can now brief you on new emails.",
      });
      loadStatus();
    } else if (outcome === "mismatch") {
      toast.error("Wrong Google account", {
        description: "Please connect the same ALU account you log in with.",
      });
    } else if (outcome === "denied") {
      toast.error("Connection cancelled", {
        description: "You declined access on the Google screen.",
      });
    } else {
      toast.error("Connection failed", {
        description: "Something went wrong — please try again.",
      });
    }
    searchParams.delete("email_briefing");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, loadStatus]);

  const handleConnect = async () => {
    setBusy(true);
    try {
      await emailBriefingService.connect(); // navigates away on success
    } catch (e) {
      toast.error("Could not start Google sign-in", {
        description: e instanceof Error ? e.message : String(e),
      });
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await emailBriefingService.disconnect();
      setConnected(false);
      setGoogleEmail(null);
      setPreviewText("");
      toast.success("Email disconnected");
    } catch (e) {
      toast.error("Disconnect failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(false);
    }
  };

  const updatePref = (key: keyof EmailBriefingPrefs, value: boolean | number) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    emailBriefingService.savePreferences(next).catch(() => {
      toast.error("Could not save briefing preferences");
    });
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewText("");
    try {
      const briefing = await emailBriefingService.getBriefing(true);
      if (!briefing.connected || !briefing.briefing) {
        toast.error("No briefing available", {
          description:
            briefing.reason === "reconnect_required"
              ? "Google access expired — please reconnect your email."
              : "Could not generate a briefing right now.",
        });
        if (briefing.reason === "reconnect_required") setConnected(false);
        return;
      }
      setPreviewText(briefing.briefing);
      if (prefs.voice_enabled && speechSupported()) {
        setSpeaking(true);
        speak(briefing.briefing, {
          onEnd: () => setSpeaking(false),
          onBlocked: () => setSpeaking(false),
        });
      }
    } catch (e) {
      toast.error("Briefing failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>Sign in to connect your ALU email.</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking email connection…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!configured && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800 text-sm">
            Email briefing isn't set up on the server yet (Google OAuth credentials
            missing). An administrator needs to configure it — see
            backend_hf/EMAIL_BRIEFING_SETUP.md.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium flex items-center gap-2">
            Your ALU inbox
            {connected && (
              <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30">
                Connected
              </Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {connected
              ? `Reading ${googleEmail ?? "your inbox"} (read-only access)`
              : "Give the Companion read-only access to your school Gmail"}
          </p>
        </div>
        {connected ? (
          <Button variant="outline" onClick={handleDisconnect} disabled={busy} className="gap-2">
            <Unplug className="h-4 w-4" /> Disconnect
          </Button>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={busy || !configured}
            className="gap-2 bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A]"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Connect Google account
          </Button>
        )}
      </div>

      {connected && (
        <>
          <Separator />

          {/* What to mention */}
          <div className="space-y-3">
            <h3 className="text-base font-medium">What should your briefing mention?</h3>
            {CATEGORY_TOGGLES.map(({ key, label, hint }) => (
              <div key={key} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <h4 className="font-medium text-sm">{label}</h4>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <Switch
                  checked={Boolean(prefs[key])}
                  onCheckedChange={(checked) => updatePref(key, checked)}
                  className="data-[state=checked]:bg-[#D4AF37]"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Voice & timing */}
          <div className="space-y-3">
            <h3 className="text-base font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-[#B8941F]" /> Voice
            </h3>
            <div className="flex items-center justify-between border rounded-md p-3">
              <div>
                <h4 className="font-medium text-sm">Read my briefing aloud</h4>
                <p className="text-xs text-muted-foreground">
                  {speechSupported()
                    ? "Uses your browser's built-in voice"
                    : "Your browser doesn't support speech — text only"}
                </p>
              </div>
              <Switch
                checked={prefs.voice_enabled}
                onCheckedChange={(checked) => updatePref("voice_enabled", checked)}
                className="data-[state=checked]:bg-[#D4AF37]"
              />
            </div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <div>
                <h4 className="font-medium text-sm">Greet me automatically</h4>
                <p className="text-xs text-muted-foreground">
                  Play the briefing when you open the chat (otherwise you tap play)
                </p>
              </div>
              <Switch
                checked={prefs.auto_play}
                onCheckedChange={(checked) => updatePref("auto_play", checked)}
                className="data-[state=checked]:bg-[#D4AF37]"
              />
            </div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <div>
                <h4 className="font-medium text-sm">Look back</h4>
                <p className="text-xs text-muted-foreground">How far back to scan your inbox</p>
              </div>
              <Select
                value={String(prefs.lookback_hours)}
                onValueChange={(v) => updatePref("lookback_hours", Number(v))}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">Last 24 hours</SelectItem>
                  <SelectItem value="48">Last 2 days</SelectItem>
                  <SelectItem value="72">Last 3 days</SelectItem>
                  <SelectItem value="168">Last week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">Try it now</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a fresh briefing from your current inbox
                </p>
              </div>
              {speaking ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    stopSpeaking();
                    setSpeaking(false);
                  }}
                  className="gap-2"
                >
                  <StopCircle className="h-4 w-4" /> Stop
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={previewLoading}
                  className="gap-2"
                >
                  {previewLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  Preview briefing
                </Button>
              )}
            </div>
            {previewText && (
              <div className="border rounded-md p-4 bg-[#FBF7E9]/60 border-[#E8DDB0] text-sm leading-relaxed">
                {previewText}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
