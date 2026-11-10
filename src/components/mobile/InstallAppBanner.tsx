import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

// Lets phone users put Student Companion AI on their home screen, where it
// opens full screen like an app. Android (Chrome, Edge, Samsung Internet)
// offers a one-tap install through `beforeinstallprompt`; iPhone Safari has
// no such event, so it gets the two-step "Share → Add to Home Screen" hint.
// Hidden on desktop, inside the installed app, and for two weeks after a
// student closes it.

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const KEY = "sc_install_dismissed_at";
const QUIET_DAYS = 14;

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const recentlyDismissed = () => {
  try {
    const at = Number(localStorage.getItem(KEY) || 0);
    return Date.now() - at < QUIET_DAYS * 864e5;
  } catch {
    return false;
  }
};

export const InstallAppBanner = ({ className = "" }: { className?: string }) => {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;
    if (isIos()) {
      setIos(true);
      setHidden(false);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
      setHidden(false);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden) return null;

  const close = () => {
    setHidden(true);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* private mode: hiding for this visit is enough */
    }
  };

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === "accepted") setHidden(true);
  };

  return (
    <div
      className={`md:hidden flex items-center gap-3 bg-white border border-[#E8DDB0] rounded-2xl shadow-[0_8px_24px_rgba(26,26,26,0.12)] pl-3 pr-2 py-2.5 ${className}`}
      role="region"
      aria-label="Install the app"
    >
      <img src="/icon-192.png" alt="" className="w-10 h-10 rounded-[10px] flex-none border border-[#E8DDB0]" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#1A1A1A] leading-tight">Get the Student Companion app</p>
        {ios ? (
          <p className="text-[11.5px] text-[#6B6355] leading-snug mt-0.5">
            Tap <Share className="inline h-3.5 w-3.5 -mt-0.5" aria-label="Share" /> then{" "}
            <span className="font-medium text-[#1A1A1A]">Add to Home Screen</span>
          </p>
        ) : (
          <p className="text-[11.5px] text-[#6B6355] leading-snug mt-0.5">Free, opens full screen, no app store needed</p>
        )}
      </div>
      {!ios && (
        <button
          onClick={install}
          className="flex-none inline-flex items-center gap-1.5 bg-[#1A1A1A] text-white text-[12.5px] font-semibold rounded-full px-3.5 py-2"
        >
          <Download className="h-3.5 w-3.5" />
          Install
        </button>
      )}
      <button
        onClick={close}
        aria-label="Not now"
        className="flex-none p-1.5 rounded-full text-[#1A1A1A]/40 hover:text-[#1A1A1A] hover:bg-[#FBF7E9]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
