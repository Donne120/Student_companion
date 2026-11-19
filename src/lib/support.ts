/**
 * "Talk to a person": whether this student can reach a university team from
 * the chat, and sending them a request.
 *
 * The backend decides which team (and address) serves the student
 * (GET /api/support/contact). Sending goes through this site's own function
 * (/api/support/ticket), which stores the request with the backend and emails
 * the team; the browser never chooses the address.
 */
import { API_URL, authHeader } from "@/config/api";

export interface SupportContact {
  enabled: boolean;
  team_name?: string;
  email?: string;
  phone?: string | null;
}

export interface SupportTurn {
  role: "user" | "assistant";
  text: string;
}

export interface SupportResult {
  reference: string;
  team_name: string;
  to_email: string;
  emailed: boolean;
  /** A copy was emailed to the student. */
  confirmed?: boolean;
}

export const SUPPORT_TOPICS = [
  "Transcript or certificate",
  "Recommendation or support letter",
  "ALUmni Connect or my account",
  "Events, summits or programmes",
  "Fees, invoices or payments",
  "Something else",
];

let cached: Promise<SupportContact> | null = null;

/** The team for this student, once per page load. */
export function getSupportContact(): Promise<SupportContact> {
  if (!cached) {
    cached = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/support/contact`, { headers: await authHeader() });
        if (!res.ok) return { enabled: false };
        return (await res.json()) as SupportContact;
      } catch {
        return { enabled: false };
      }
    })();
    cached.then((c) => {
      if (!c.enabled) cached = null; // try again later (e.g. after signing in)
    });
  }
  return cached;
}

export async function sendSupportRequest(body: {
  topic: string;
  message: string;
  transcript?: SupportTurn[];
}): Promise<SupportResult> {
  const headers = await authHeader();
  const res = await fetch("/api/support/ticket", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof data?.error === "string" ? data.error : "";
    throw new Error(detail || "Your request couldn't be sent. Please try again in a moment.");
  }
  return data as SupportResult;
}
