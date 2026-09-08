/**
 * POST /api/pathfinder/lead
 *
 * A student asking to be contacted. Emails the team and stores the record so
 * nothing is lost if an email is missed.
 *
 * Writes to Firestore with the Admin SDK, server-side only — the
 * `pathfinder_leads` collection is closed to all client access (see
 * firestore.rules), so one student can never read another's contact details.
 *
 * Required environment variables (set in Vercel):
 *   RESEND_API_KEY            — resend.com, free tier is ample
 *   LEAD_NOTIFY_EMAIL         — defaults to studentcompanionai@gmail.com
 *   FIREBASE_PROJECT_ID       — optional; storage is skipped if absent
 *   FIREBASE_CLIENT_EMAIL     — service-account email
 *   FIREBASE_PRIVATE_KEY      — service-account key ("\n" escapes are handled)
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
// See the note in recommend.ts — the .js extension is required under ESM.
import { methodGuard, parseAnswers, rateLimit, summarise } from "../_shared.js";

const NOTIFY_TO = process.env.LEAD_NOTIFY_EMAIL || "studentcompanionai@gmail.com";

/**
 * Resend's shared onboarding@resend.dev sender works without any setup, but
 * only delivers to the address that owns the Resend account. Once a domain is
 * verified in Resend, set LEAD_FROM_EMAIL (e.g. "Pathfinder
 * <pathfinder@studentcompanionai.rw>") to send to anyone.
 */
const FROM_ADDRESS = process.env.LEAD_FROM_EMAIL || "Pathfinder <onboarding@resend.dev>";

interface Lead {
  name: string;
  email: string;
  phone: string;
  message: string;
}

function parseLead(raw: unknown): Lead | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;

  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const name = str(d.name, 120);
  const email = str(d.email, 200);
  const phone = str(d.phone, 40);
  const message = str(d.message, 600);

  if (!name || !email) return null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  return { name, email, phone, message };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function store(lead: Lead, profile: string) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  // Storage is optional, but say so plainly rather than returning silently —
  // otherwise "not configured" looks identical to "saved successfully" in the
  // logs, and the caller can't tell whether an enquiry is actually recoverable
  // if email delivery fails.
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("storage not configured (FIREBASE_* env vars unset)");
  }

  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getFirestore, FieldValue } = await import("firebase-admin/firestore");

  if (getApps().length === 0) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  await getFirestore().collection("pathfinder_leads").add({
    ...lead,
    profile,
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function notify(lead: Lead, profile: string, key: string) {
  const body = `
    <h2 style="font-family:Georgia,serif">New Pathfinder enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(lead.name)}<br>
       <strong>Email:</strong> ${escapeHtml(lead.email)}<br>
       <strong>Phone:</strong> ${escapeHtml(lead.phone) || "—"}</p>
    ${lead.message ? `<p><strong>Message:</strong><br>${escapeHtml(lead.message)}</p>` : ""}
    <h3>Their answers</h3>
    <pre style="background:#FBF7E9;padding:12px;border-radius:8px;white-space:pre-wrap;font-family:inherit">${escapeHtml(profile)}</pre>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [NOTIFY_TO],
      // Resend's current API uses replyTo; the older reply_to is rejected
      // with a 422, which is invisible without reading the response body.
      replyTo: lead.email,
      subject: `Pathfinder enquiry — ${lead.name}`,
      html: body,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res)) return;

  // Tighter than the report endpoint — nobody legitimately submits 3+ times.
  if (!rateLimit(req, 3, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many submissions. Please wait a few minutes." });
  }

  const body = req.body as { details?: unknown; answers?: unknown };
  const lead = parseLead(body?.details);
  if (!lead) return res.status(400).json({ error: "Please check your name and email address." });

  const answers = parseAnswers(body?.answers);
  const profile = answers ? summarise(answers) : "(answers unavailable)";

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("[pathfinder/lead] RESEND_API_KEY missing — cannot deliver enquiry");
    return res.status(503).json({
      error: "We can't take enquiries just yet. Please try again shortly.",
    });
  }

  // Store first. If email delivery fails, the enquiry must still be recorded —
  // a student who asked for help should never be lost because of a mail
  // provider problem. Storage is optional (needs the FIREBASE_* vars), so a
  // failure here is logged, not fatal.
  let stored = false;
  try {
    await store(lead, profile);
    stored = true;
  } catch (err) {
    console.error("[pathfinder/lead] store", err);
  }

  try {
    await notify(lead, profile, resendKey);
  } catch (err) {
    console.error("[pathfinder/lead] email", err);
    // If the record was saved we can still follow up, so don't tell the
    // student their submission failed — it didn't.
    if (stored) return res.status(200).json({ ok: true });

    // The upstream reason is included deliberately. It comes from Resend, not
    // from the student's input, and without it this failure is undiagnosable
    // from the outside — which has already cost several rounds of guessing.
    // It reveals nothing about the submitter and never includes the API key.
    return res.status(502).json({
      error: "We couldn't send that. Please try again shortly.",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  return res.status(200).json({ ok: true });
}
