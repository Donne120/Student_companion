/**
 * TTS utility for Student Companion AI.
 *
 * Primary:  ElevenLabs streaming TTS  (requires VITE_ELEVENLABS_API_KEY +
 *           VITE_ELEVENLABS_VOICE_ID in .env — set these to your cloned voice)
 * Fallback: Web Speech API            (browser built-in, no API key needed)
 *
 * To use your custom voice:
 *   1. Go to elevenlabs.io → Voice Lab → Add a Generative or Professional Clone
 *   2. Upload your voice sample audio file
 *   3. Copy the generated Voice ID
 *   4. Add to .env:
 *        VITE_ELEVENLABS_API_KEY=your_key_here
 *        VITE_ELEVENLABS_VOICE_ID=your_voice_id_here
 */

const EL_API_KEY   = import.meta.env.VITE_ELEVENLABS_API_KEY   as string | undefined;
const EL_VOICE_ID  = import.meta.env.VITE_ELEVENLABS_VOICE_ID  as string | undefined;
const EL_MODEL     = (import.meta.env.VITE_ELEVENLABS_MODEL as string | undefined)
                     ?? "eleven_turbo_v2_5"; // fastest, lowest latency

const elevenLabsEnabled = !!EL_API_KEY && !!EL_VOICE_ID;

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

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": EL_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: EL_MODEL,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.85,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      console.warn(`[ElevenLabs] HTTP ${res.status} — falling back to Web Speech`);
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
    console.warn("[ElevenLabs] Error — falling back to Web Speech:", err);
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
  if (elevenLabsEnabled) {
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
