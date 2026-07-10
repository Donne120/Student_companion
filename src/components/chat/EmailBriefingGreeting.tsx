import { useEffect, useRef, useState } from "react";
import { Mail, Volume2, VolumeX, X, Loader2, PlayCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { emailBriefingService, EmailBriefing } from "@/services/emailBriefingService";
import { speak, stopSpeaking, speechSupported } from "@/utils/speech";

// Shown at most once per browser session so reopening the chat doesn't
// re-announce the same inbox.
const SESSION_KEY = "EMAIL_BRIEFING_GREETED";

/**
 * The "Hi <name>, you have..." moment. When the student opens the chat and
 * has connected their email in Settings, this banner fetches their briefing,
 * shows it, and (if enabled) reads it aloud.
 *
 * Browsers block speech before the first user interaction with the page.
 * Coming from the login click or any in-app navigation, speech works; on a
 * cold reload it may be blocked, in which case we quietly fall back to a
 * play button.
 */
export const EmailBriefingGreeting = () => {
  const { currentUser } = useAuth();
  const [briefing, setBriefing] = useState<EmailBriefing | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    if (!currentUser || started.current) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    started.current = true;

    let cancelled = false;
    (async () => {
      try {
        const status = await emailBriefingService.getStatus();
        if (cancelled || !status.connected) return;

        setLoading(true);
        setVisible(true);
        const result = await emailBriefingService.getBriefing();
        if (cancelled) return;
        setLoading(false);

        if (!result.connected || !result.briefing) {
          setVisible(false);
          return;
        }
        setBriefing(result);
        setVoiceOn(status.prefs.voice_enabled);
        sessionStorage.setItem(SESSION_KEY, "1");

        if (status.prefs.voice_enabled && status.prefs.auto_play && speechSupported()) {
          setSpeaking(true);
          speak(result.briefing, {
            onEnd: () => setSpeaking(false),
            onBlocked: () => setSpeaking(false), // autoplay policy — play button remains
          });
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
          setVisible(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // Stop talking if the student navigates away mid-briefing.
  useEffect(() => stopSpeaking, []);

  if (!visible) return null;

  const handlePlayStop = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else if (briefing?.briefing) {
      setSpeaking(true);
      speak(briefing.briefing, {
        onEnd: () => setSpeaking(false),
        onBlocked: () => setSpeaking(false),
      });
    }
  };

  const handleDismiss = () => {
    stopSpeaking();
    setSpeaking(false);
    setVisible(false);
  };

  return (
    <div className="mx-3 md:mx-6 mt-3">
      <div className="rounded-xl border border-[#E8DDB0] bg-[#FBF7E9]/70 shadow-sm overflow-hidden">
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="mt-0.5 h-8 w-8 rounded-full bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <Mail className="h-4 w-4 text-[#1A1A1A]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B8941F]">
                Your email briefing
              </span>
              {briefing?.email_count !== undefined && (
                <span className="text-[10px] text-[#1A1A1A]/50">
                  {briefing.email_count} recent email{briefing.email_count === 1 ? "" : "s"}
                </span>
              )}
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/60 mt-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Checking your inbox…
              </div>
            ) : (
              <p className="text-sm text-[#1A1A1A]/90 leading-relaxed mt-1">
                {briefing?.briefing}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!loading && voiceOn && speechSupported() && (
              <button
                onClick={handlePlayStop}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#E8DDB0]/60 text-[#1A1A1A]/70"
                aria-label={speaking ? "Stop reading" : "Read aloud"}
                title={speaking ? "Stop reading" : "Read aloud"}
              >
                {speaking ? <VolumeX className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
              </button>
            )}
            {speaking && (
              <Volume2 className="h-4 w-4 text-[#B8941F] animate-pulse" aria-hidden />
            )}
            <button
              onClick={handleDismiss}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#E8DDB0]/60 text-[#1A1A1A]/50"
              aria-label="Dismiss briefing"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
