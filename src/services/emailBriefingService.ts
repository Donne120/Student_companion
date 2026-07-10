import { API_URL, authHeader, fetchWithTimeout } from "@/config/api";

/**
 * Client for the backend email-briefing routes (/api/email/*).
 * See backend_hf/email_briefing.py for the server side.
 */

export interface EmailBriefingPrefs {
  assignments: boolean;
  classes: boolean;
  congratulations: boolean;
  announcements: boolean;
  other: boolean;
  voice_enabled: boolean;
  auto_play: boolean;
  lookback_hours: number;
}

export interface EmailBriefingStatus {
  configured: boolean;
  connected: boolean;
  google_email: string | null;
  prefs: EmailBriefingPrefs;
}

export interface EmailBriefing {
  connected: boolean;
  briefing: string | null;
  engine?: string;
  email_count?: number;
  prefs?: EmailBriefingPrefs;
  reason?: string;
  cached?: boolean;
}

export const DEFAULT_BRIEFING_PREFS: EmailBriefingPrefs = {
  assignments: true,
  classes: true,
  congratulations: true,
  announcements: true,
  other: false,
  voice_enabled: true,
  auto_play: true,
  lookback_hours: 48,
};

const authedFetch = async (
  path: string,
  options: RequestInit = {},
  timeout = 30000
): Promise<Response> => {
  const { Authorization } = await authHeader();
  const headers = new Headers(options.headers);
  headers.set("Authorization", Authorization);
  headers.set("Content-Type", "application/json");
  return fetchWithTimeout(`${API_URL}${path}`, { ...options, headers }, timeout);
};

export const emailBriefingService = {
  async getStatus(): Promise<EmailBriefingStatus> {
    const res = await authedFetch("/api/email/status");
    if (!res.ok) throw new Error(`Status check failed (${res.status})`);
    return res.json();
  },

  /** Get the Google consent URL and send the browser there. */
  async connect(): Promise<void> {
    const res = await authedFetch("/api/email/connect", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.detail || `Could not start Google sign-in (${res.status})`);
    }
    const { auth_url } = await res.json();
    window.location.href = auth_url;
  },

  async disconnect(): Promise<void> {
    const res = await authedFetch("/api/email/disconnect", { method: "POST" });
    if (!res.ok) throw new Error(`Disconnect failed (${res.status})`);
  },

  async savePreferences(prefs: EmailBriefingPrefs): Promise<void> {
    const res = await authedFetch("/api/email/preferences", {
      method: "PUT",
      body: JSON.stringify({ prefs }),
    });
    if (!res.ok) throw new Error(`Saving preferences failed (${res.status})`);
  },

  /** Briefing generation can take a while (Gmail scan + LLM), hence 60s. */
  async getBriefing(refresh = false): Promise<EmailBriefing> {
    const res = await authedFetch(
      `/api/email/briefing${refresh ? "?refresh=true" : ""}`,
      {},
      60000
    );
    if (!res.ok) throw new Error(`Briefing failed (${res.status})`);
    return res.json();
  },
};
