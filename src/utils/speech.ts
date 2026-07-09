/**
 * Thin wrapper around the Web Speech API for the spoken email briefing.
 * No external TTS service — this uses the voices built into the browser/OS.
 */

export const speechSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/** Pick a pleasant English voice if one is available. */
const pickVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => /en[-_]/i.test(v.lang) && /female|natural|google/i.test(v.name)) ||
    voices.find((v) => /en[-_]/i.test(v.lang)) ||
    voices[0]
  );
};

/**
 * Speak `text` aloud. Resolves when speech finishes or fails.
 * Note: browsers block speech that isn't preceded by ANY user interaction
 * with the page — callers should be prepared for a silent failure and offer
 * a play button as fallback (onBlocked is called in that case).
 */
export const speak = (
  text: string,
  handlers: { onEnd?: () => void; onBlocked?: () => void } = {}
): void => {
  if (!speechSupported() || !text.trim()) {
    handlers.onBlocked?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel(); // never overlap two briefings

  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utter.voice = voice;
  utter.rate = 1.0;
  utter.pitch = 1.0;
  utter.onend = () => handlers.onEnd?.();
  utter.onerror = (e) => {
    // "not-allowed" = autoplay policy; anything else we also surface as blocked
    if (e.error === "interrupted" || e.error === "canceled") {
      handlers.onEnd?.();
    } else {
      handlers.onBlocked?.();
    }
  };
  synth.speak(utter);
};

export const stopSpeaking = (): void => {
  if (speechSupported()) window.speechSynthesis.cancel();
};

export const isSpeaking = (): boolean =>
  speechSupported() && window.speechSynthesis.speaking;
