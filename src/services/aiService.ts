import { Message, MessageSource } from "@/types/chat";
import { API_URL, fetchWithTimeout, authHeader } from "@/config/api";

// Phase 2: hits the Claude + RAG endpoint on the HF backend.
// To revert to the legacy alu_brain + Groq fallback, change this back to `/api/chat`.
const CHAT_ENDPOINT = `${API_URL}/api/chat/claude`;
const CHAT_STREAM_ENDPOINT = `${API_URL}/api/chat/claude/stream`;
const HEALTH_CACHE_MS = 30_000;

export type StreamCallbacks = {
  onChunk: (text: string) => void;
  onSources?: (sources: MessageSource[]) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
};

type Personality = {
  name?: string;
  traits?: string[];
  tone?: string;
  [key: string]: unknown;
};

type HealthCache = { status: boolean | null; timestamp: number };

const healthCache: HealthCache = { status: null, timestamp: 0 };

const isBackendAvailable = async (): Promise<boolean> => {
  const now = Date.now();
  if (healthCache.status !== null && now - healthCache.timestamp < HEALTH_CACHE_MS) {
    return healthCache.status;
  }
  try {
    const res = await fetchWithTimeout(API_URL, { method: "GET" }, 5000);
    healthCache.status = res.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    healthCache.status = false;
  }
  healthCache.timestamp = now;
  return healthCache.status;
};

const getResponseFromBackend = async (
  query: string,
  conversationHistory: Message[],
  options: { personality?: Personality } = {}
): Promise<{ text: string; sources: MessageSource[] }> => {
  const history = conversationHistory.map((message) => ({
    role: message.isAi ? "assistant" : "user",
    content: message.text,
  }));

  const res = await fetchWithTimeout(
    CHAT_ENDPOINT,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ message: query, history, options }),
    },
    30_000
  );

  if (!res.ok) {
    throw new Error(`Backend response error: ${res.status}`);
  }

  const data = await res.json();
  return {
    text: data.response || "No response from backend",
    sources: Array.isArray(data.sources) ? data.sources : [],
  };
};

/**
 * Stream a response from the Claude endpoint. Resolves with the full
 * accumulated text once the stream completes. Falls back to a non-streaming
 * request if anything goes wrong mid-stream so the caller always gets a
 * usable string.
 */
const streamResponseFromBackend = async (
  query: string,
  conversationHistory: Message[],
  callbacks: StreamCallbacks
): Promise<string> => {
  const history = conversationHistory.map((message) => ({
    role: message.isAi ? "assistant" : "user",
    content: message.text,
  }));

  const res = await fetch(CHAT_STREAM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(await authHeader()),
    },
    body: JSON.stringify({ message: query, history }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";
  let streamErrorMessage: string | null = null;

  // SSE frames are separated by "\n\n". We accumulate raw bytes and split.
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let separator: number;
    while ((separator = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, separator);
      buffer = buffer.slice(separator + 2);
      if (!frame.startsWith("data:")) continue;

      const payload = frame.slice(5).trim();
      if (!payload) continue;

      try {
        const event = JSON.parse(payload);
        if (event.type === "chunk" && typeof event.text === "string") {
          accumulated += event.text;
          callbacks.onChunk(event.text);
        } else if (event.type === "sources" && Array.isArray(event.sources)) {
          callbacks.onSources?.(event.sources);
        } else if (event.type === "done") {
          callbacks.onDone?.();
        } else if (event.type === "error") {
          streamErrorMessage = event.message ?? "Stream error";
        }
      } catch (e) {
        console.warn("Bad SSE frame", payload, e);
      }
    }
  }

  // Throw if the stream signaled an error OR ended without any text — the
  // outer streamResponse() catches this and retries via the non-streaming
  // endpoint, which falls back to Groq server-side.
  if (streamErrorMessage || !accumulated) {
    throw new Error(streamErrorMessage ?? "Stream ended with no content");
  }

  return accumulated;
};

export const aiService = {
  async generateResponse(
    query: string,
    conversationHistory: Message[] = [],
    options: { personality?: Personality } = {}
  ): Promise<string> {
    if (!(await isBackendAvailable())) {
      throw new Error("Backend service is currently unavailable");
    }
    try {
      return (await getResponseFromBackend(query, conversationHistory, options)).text;
    } catch (error) {
      console.error("Error generating response:", error);
      return "I'm sorry, I'm having trouble connecting to the ALU knowledge base right now. Please try again later.";
    }
  },

  /**
   * Streaming version of generateResponse. Calls onChunk for each text
   * piece as it arrives. Resolves with the full accumulated text.
   *
   * If streaming fails for any reason, falls back to the non-streaming
   * endpoint and delivers the whole answer in a single onChunk call so
   * the UI doesn't need separate failure handling.
   */
  async streamResponse(
    query: string,
    conversationHistory: Message[] = [],
    callbacks: StreamCallbacks
  ): Promise<string> {
    try {
      return await streamResponseFromBackend(query, conversationHistory, callbacks);
    } catch (error) {
      console.warn("Stream failed, falling back to non-streaming:", error);
      try {
        const full = await getResponseFromBackend(query, conversationHistory);
        if (full.sources.length) callbacks.onSources?.(full.sources);
        callbacks.onChunk(full.text);
        callbacks.onDone?.();
        return full.text;
      } catch (fallbackError) {
        const message =
          fallbackError instanceof Error
            ? fallbackError.message
            : "Unable to reach the Companion right now.";
        callbacks.onError?.(message);
        return "";
      }
    }
  },

  isBackendAvailable,

  async getBackendStatus(): Promise<{ status: "online" | "offline"; message: string }> {
    const available = await isBackendAvailable();
    return {
      status: available ? "online" : "offline",
      message: available ? "Knowledge base connected" : "Knowledge base unavailable",
    };
  },

  async getNypthoStatus(): Promise<{
    ready: boolean;
    learning: { observation_count: number; learning_rate: number };
  }> {
    try {
      const res = await fetchWithTimeout(`${API_URL}/nyptho/status`, { method: "GET" }, 2000);
      if (!res.ok) return { ready: false, learning: { observation_count: 0, learning_rate: 0 } };
      const data = await res.json();
      return {
        ready: !!data.ready,
        learning: data.learning || { observation_count: 0, learning_rate: 0 },
      };
    } catch (error) {
      console.error("Error getting Nyptho status:", error);
      return { ready: false, learning: { observation_count: 0, learning_rate: 0 } };
    }
  },
};
