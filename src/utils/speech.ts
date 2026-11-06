/**
 * TTS utility for Student Companion AI.
 *
 * Primary:  natural voice from the backend (POST /api/tts), which calls
 *           ElevenLabs with a key kept on the server. The key used to be a
 *           VITE_ variable, which put it in the public JavaScript bundle
 *           where anyone could copy it.
 * Fallback: Web Speech API (browser built-in), when the backend has no
 *           voice configured (503) or the request fails.
 */
import { API_URL, authHeader } from "@/config/api";

// Set to false after the backend says it has no voice, so we stop asking.
let backendVoiceAvailable = true;

// Holds the current AudioContext + source so we can stop mid-speech cleanly.
let currentAudioCtx: AudioContext | null = null;
let currentAudioSource: AudioBufferSourceNode | null = null;

/** ── ElevenLabs TTS ──────────────────────────────────────────────────────── */

const speakElevenLabs = async (
  text: string,
  handlers: { onEnd?: () => void; onBlocked?: () => void }
): Promise<void> => {
  try {
    stopSpeaking(); // cancel any in-progress speech

    const res = await fetch(`${API_URL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      if (res.status === 503 || res.status === 404) backendVoiceAvailable = false;
      console.warn(`[TTS] HTTP ${res.status}; using the browser voice`);
      speakWebSpeech(text, handlers);
      return;
    }

    const arrayBuffer = await res.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      handlers.onBlocked?.();
      return;
    }

    // Decode and play via Web Audio API so we can stop it cleanly.
    currentAudioCtx = new AudioContext();
    const audioBuffer = await currentAudioCtx.decodeAudioData(arrayBuffer);

    currentAudioSource = currentAudioCtx.createBufferSource();
    currentAudioSource.buffer = audioBuffer;
    currentAudioSource.connect(currentAudioCtx.destination);
    currentAudioSource.onended = () => {
      handlers.onEnd?.();
      currentAudioCtx?.close();
      currentAudioCtx = null;
      currentAudioSource = null;
    };
    currentAudioSource.start(0);
  } catch (err) {
    console.warn("[TTS] Voice request failed; using the browser voice:", err);
    speakWebSpeech(text, handlers);
  }
};

/** ── Web Speech fallback ─────────────────────────────────────────────────── */

export const speechSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

const pickVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => /en[-_]/i.test(v.lang) && /female|natural|google/i.test(v.name)) ||
    voices.find((v) => /en[-_]/i.test(v.lang)) ||
    voices[0]
  );
};

const speakWebSpeech = (
  text: string,
  handlers: { onEnd?: () => void; onBlocked?: () => void }
): void => {
  if (!speechSupported() || !text.trim()) {
    handlers.onBlocked?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utter.voice = voice;
  utter.rate = 1.0;
  utter.pitch = 1.0;
  utter.onend = () => handlers.onEnd?.();
  utter.onerror = (e) => {
    if (e.error === "interrupted" || e.error === "canceled") {
      handlers.onEnd?.();
    } else {
      handlers.onBlocked?.();
    }
  };
  synth.speak(utter);
};

/** ── Public API ──────────────────────────────────────────────────────────── */

/**
 * Speak `text` using ElevenLabs TTS (custom voice) if configured, otherwise
 * fall back to the browser's built-in Web Speech API.
 */
export const speak = (
  text: string,
  handlers: { onEnd?: () => void; onBlocked?: () => void } = {}
): void => {
  if (!text.trim()) {
    handlers.onBlocked?.();
    return;
  }
  if (backendVoiceAvailable) {
    speakElevenLabs(text, handlers);
  } else {
    speakWebSpeech(text, handlers);
  }
};

/** Stop any currently playing speech (ElevenLabs or Web Speech). */
export const stopSpeaking = (): void => {
  // Stop ElevenLabs AudioContext
  if (currentAudioSource) {
    try { currentAudioSource.stop(); } catch { /* already stopped */ }
    currentAudioSource = null;
  }
  if (currentAudioCtx) {
    currentAudioCtx.close().catch(() => {});
    currentAudioCtx = null;
  }
  // Stop Web Speech
  if (speechSupported()) window.speechSynthesis.cancel();
};

export const isSpeaking = (): boolean => {
  if (currentAudioSource) return true;
  return speechSupported() && window.speechSynthesis.speaking;
};
