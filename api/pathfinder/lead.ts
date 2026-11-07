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
 *   UNIVERSITY_CONTACTS       — optional; admissions addresses (see _contacts.ts)
 *
 * Universities: the student can tick universities from their report to send
 * their enquiry to as well. Only universities with a confirmed admissions
 * address (api/_contacts.ts) can be chosen, the address is looked up here
 * from the university's website and never taken from the request, and at
 * most three are sent per enquiry. Sending to a university needs a verified
 * sender domain (LEAD_FROM_EMAIL): Resend's shared sender can only deliver
 * to the account owner, so until then the team is told which universities
 * the student chose and passes the enquiry on.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
// See the note in recommend.ts — the .js extension is required under ESM.
import { methodGuard, parseAnswers, rateLimit, summarise } from "../_shared.js";
import { contactFor } from "../_contacts.js";

const PLATFORM_URL = "https://chat.studentcompanionai.rw";
const PATHFINDER_URL = `${PLATFORM_URL}/pathfinder`;
const MAX_UNIVERSITIES = 3;

/**
 * Where enquiries are sent. Defaults to the address that owns the Resend
 * account, because Resend's free shared sender refuses to deliver anywhere
 * else — sending to studentcompanionai@gmail.com returned a 403 until a
 * domain is verified. Once studentcompanionai.rw (or similar) is verified at
 * resend.com/domains, set LEAD_FROM_EMAIL to an address on it and this can
 * point anywhere.
 */
const NOTIFY_TO = process.env.LEAD_NOTIFY_EMAIL || "d.ngum@alustudent.com";

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

interface University {
  name: string;
  url: string;
  programme: string;
  email: string;
}

/**
 * The universities the student ticked, with their admissions addresses.
 * Names and programmes come from the student's report (for the email text
 * only); the address comes from _contacts.ts by the university's website.
 */
function parseUniversities(raw: unknown, report: unknown): University[] {
  if (!Array.isArray(raw)) return [];
  const schools = (
    report && typeof report === "object" && Array.isArray((report as { schools?: unknown }).schools)
      ? ((report as { schools: unknown[] }).schools as Array<Record<string, unknown>>)
      : []
  );
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const seen = new Set<string>();
  const out: University[] = [];
  for (const item of raw.slice(0, MAX_UNIVERSITIES)) {
    const url = str(item, 500);
    if (!/^https?:\/\//i.test(url)) continue;
    const email = contactFor(url);
    if (!email || seen.has(email)) continue;
    seen.add(email);
    const school = schools.find((s) => s && s.url === url) || {};
    let host = url;
    try {
      host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      /* keep the raw url */
    }
    out.push({ name: str(school.name, 160) || host, url, programme: str(school.programme, 200), email });
  }
  return out;
}

/** Sending outside the team needs a verified domain in Resend. */
function canEmailOutsiders(): boolean {
  return !/@resend\.dev>?$/i.test(FROM_ADDRESS.trim());
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function store(lead: Lead, profile: string, universities: string[]) {
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
    universities,
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function send(key: string, email: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ from: FROM_ADDRESS, ...email }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
}

/** The enquiry, to one university's admissions office, from the platform. */
async function notifyUniversity(lead: Lead, profile: string, uni: University, key: string) {
  const html = `
    <p>Dear ${escapeHtml(uni.name)} admissions team,</p>
    <p>A prospective student, <strong>${escapeHtml(lead.name)}</strong>, used
       <a href="${PATHFINDER_URL}">Pathfinder</a> on
       <a href="${PLATFORM_URL}">Student Companion AI</a>, a free course and university guidance
       platform for students in Africa, and asked us to share their enquiry with you.
       Please reply to them directly: replying to this email reaches them.</p>
    <p><strong>Name:</strong> ${escapeHtml(lead.name)}<br>
       <strong>Email:</strong> ${escapeHtml(lead.email)}<br>
       <strong>Phone / WhatsApp:</strong> ${escapeHtml(lead.phone) || "not given"}</p>
    ${uni.programme ? `<p><strong>Interested in:</strong> ${escapeHtml(uni.programme)}</p>` : ""}
    ${lead.message ? `<p><strong>Their question:</strong><br>${escapeHtml(lead.message)}</p>` : ""}
    <h3 style="font-family:Georgia,serif">What they told Pathfinder</h3>
    <pre style="background:#FBF7E9;padding:12px;border-radius:8px;white-space:pre-wrap;font-family:inherit">${escapeHtml(profile)}</pre>
    <p style="color:#6B6355;font-size:12px">This enquiry comes from the Student Companion AI platform
       (<a href="${PLATFORM_URL}">${PLATFORM_URL.replace("https://", "")}</a>). The student chose to share
       these details with your university. Student Companion AI does not make admission decisions.</p>
  `;
  await send(key, {
    to: [uni.email],
    replyTo: lead.email,
    subject: `Prospective student enquiry via Student Companion AI: ${lead.name}`,
    html,
  });
}

async function notify(lead: Lead, profile: string, key: string, sentTo: University[], pending: University[]) {
  const list = (unis: University[]) => unis.map((u) => escapeHtml(u.name)).join(", ");
  const body = `
    <h2 style="font-family:Georgia,serif">New Pathfinder enquiry</h2>
    ${sentTo.length ? `<p><strong>Also sent to:</strong> ${list(sentTo)}</p>` : ""}
    ${pending.length ? `<p><strong>The student asked us to pass this on to:</strong> ${list(pending)}
       (${pending.map((u) => escapeHtml(u.email)).join(", ")}). It was not sent automatically: please forward it.</p>` : ""}
    <p><strong>Name:</strong> ${escapeHtml(lead.name)}<br>
       <strong>Email:</strong> ${escapeHtml(lead.email)}<br>
       <strong>Phone:</strong> ${escapeHtml(lead.phone) || "—"}</p>
    ${lead.message ? `<p><strong>Message:</strong><br>${escapeHtml(lead.message)}</p>` : ""}
    <h3>Their answers</h3>
    <pre style="background:#FBF7E9;padding:12px;border-radius:8px;white-space:pre-wrap;font-family:inherit">${escapeHtml(profile)}</pre>
  `;

  await send(key, {
    to: [NOTIFY_TO],
    // Resend's current API uses replyTo; the older reply_to is rejected
    // with a 422, which is invisible without reading the response body.
    replyTo: lead.email,
    subject: `Pathfinder enquiry — ${lead.name}`,
    html: body,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res)) return;

  // Tighter than the report endpoint — nobody legitimately submits 3+ times.
  if (!rateLimit(req, 3, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many submissions. Please wait a few minutes." });
  }

  const body = req.body as { details?: unknown; answers?: unknown; universities?: unknown; report?: unknown };
  const lead = parseLead(body?.details);
  if (!lead) return res.status(400).json({ error: "Please check your name and email address." });

  const answers = parseAnswers(body?.answers);
  const profile = answers ? summarise(answers) : "(answers unavailable)";
  const universities = parseUniversities(body?.universities, body?.report);

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
    await store(lead, profile, universities.map((u) => u.name));
    stored = true;
  } catch (err) {
    console.error("[pathfinder/lead] store", err);
  }

  // Each chosen university gets its own email. One failing must not stop the
  // others or the student's own request; the team is told which still need
  // passing on.
  const sentTo: University[] = [];
  const pending: University[] = [];
  for (const uni of universities) {
    if (!canEmailOutsiders()) {
      pending.push(uni);
      continue;
    }
    try {
      await notifyUniversity(lead, profile, uni, resendKey);
      sentTo.push(uni);
    } catch (err) {
      console.error("[pathfinder/lead] university email", uni.name, err);
      pending.push(uni);
    }
  }

  try {
    await notify(lead, profile, resendKey, sentTo, pending);
  } catch (err) {
    console.error("[pathfinder/lead] email", err);
    // If the record was saved, or a university already has it, we can still
    // follow up, so don't tell the student their submission failed.
    if (stored || sentTo.length) {
      return res.status(200).json({ ok: true, sentTo: sentTo.map((u) => u.name), passedOn: pending.map((u) => u.name) });
    }

    const body: Record<string, string> = {
      error: "We couldn't send that. Please try again shortly.",
    };
    // Back behind the flag now the cause is known — a public endpoint
    // shouldn't leak upstream internals as a matter of course.
    if (process.env.PATHFINDER_DEBUG === "1") {
      body.detail = err instanceof Error ? err.message : String(err);
    }
    return res.status(502).json(body);
  }

  return res.status(200).json({ ok: true, sentTo: sentTo.map((u) => u.name), passedOn: pending.map((u) => u.name) });
}
