import { auth } from "@/lib/firebase";

export const getApiUrl = (): string => {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return fromEnv;

  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || /^192\.168\./.test(window.location.hostname))
  ) {
    return "http://localhost:8080";
  }

  return "https://studentcompanion-alu-chatbot.hf.space";
};

export const API_URL = getApiUrl();

export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Returns an { Authorization: "Bearer <token>" } header for the signed-in
 * user. Used by any call to a server route protected by require_user /
 * require_admin (chat, opportunities, essay coach, admin routes). Throws if
 * no user is signed in so callers fail fast instead of getting a 401.
 */
export const authHeader = async (): Promise<{ Authorization: string }> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not signed in — auth token unavailable");
  }
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

/**
 * Fetch wrapper for protected /api/admin/* routes. Attaches the current
 * user's Firebase ID token as a Bearer header — the backend's require_admin
 * dependency is the real gate, this just presents the credential.
 *
 * `path` is joined to API_URL, e.g. adminFetch("/api/admin/sheet-status").
 * Throws if no user is signed in so callers fail fast instead of getting 401.
 */
export const adminFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const { Authorization } = await authHeader();
  const headers = new Headers(options.headers);
  headers.set("Authorization", Authorization);
  return fetch(`${API_URL}${path}`, { ...options, headers });
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetchWithTimeout(API_URL, {}, 5000);
    return res.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};
