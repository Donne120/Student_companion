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
import { methodGuard, parseAnswers, rateLimit, summarise } from "../_shared";

const NOTIFY_TO = process.env.LEAD_NOTIFY_EMAIL || "studentcompanionai@gmail.com";

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
  if (!projectId || !clientEmail || !privateKey) return; // storage optional

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
      from: "Pathfinder <onboarding@resend.dev>",
      to: [NOTIFY_TO],
      reply_to: lead.email,
      subject: `Pathfinder enquiry — ${lead.name}`,
      html: body,
    }),
  });
  if (!res.ok) throw new Error(`Email failed (${res.status})`);
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

  try {
    await notify(lead, profile, resendKey);
  } catch (err) {
    console.error("[pathfinder/lead] email", err);
    return res.status(502).json({ error: "We couldn't send that. Please try again shortly." });
  }

  // Storage is a safety net, not the delivery path. If it fails the student
  // has still reached us by email, so don't fail their submission for it.
  try {
    await store(lead, profile);
  } catch (err) {
    console.error("[pathfinder/lead] store", err);
  }

  return res.status(200).json({ ok: true });
}
