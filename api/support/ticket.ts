/**
 * "Talk to a person": a student's request to their university team.
 *
 * 1. The request is stored by the backend (POST /api/support/tickets), with
 *    the student's own sign-in token. The backend decides which team and
 *    address serve this student, so this form can't be used to email anyone
 *    else.
 * 2. The team is emailed through Resend, with reply-to set to the student,
 *    so replying to the email answers them.
 * 3. The student gets a receipt by email (reference, team, their message).
 * 4. The backend is told whether the email went (…/delivered). The request
 *    is in the team's dashboard (Inquiries) either way.
 *
 * Env: RESEND_API_KEY (shared with Pathfinder); SUPPORT_FROM_EMAIL, else
 * LEAD_FROM_EMAIL, as the sender; BACKEND_URL, else VITE_API_URL, else
 * https://api.studentcompanionai.rw.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { detailCard, esc, heading, layout, paragraph, textFooter } from "../_email.js";

const BACKEND = (process.env.BACKEND_URL || process.env.VITE_API_URL || "https://api.studentcompanionai.rw").replace(/\/+$/, "");
const FROM_ADDRESS =
  process.env.SUPPORT_FROM_EMAIL || process.env.LEAD_FROM_EMAIL || "Student Companion AI <onboarding@resend.dev>";

interface Ticket {
  id: string;
  reference: string;
  team_name: string;
  to_email: string;
  student_name: string | null;
  student_email: string;
  organization_name: string;
  topic: string;
  message: string;
  transcript: Array<{ role: "student" | "assistant"; text: string }>;
  created_at: string;
}

function emailFor(t: Ticket) {
  const who = t.student_name || t.student_email;
  const rows: Array<[string, string]> = [
    ["Reference", t.reference],
    ["From", `${who} <${t.student_email}>`],
    ["University", t.organization_name],
    ["Topic", t.topic],
  ];
  const convo = t.transcript.length
    ? `<div style="margin-top:18px">${heading("The conversation so far")}${t.transcript
        .map(
          (m) =>
            `<p style="margin:0 0 10px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;line-height:1.5;color:${
              m.role === "student" ? "#1A1A1A" : "#6B6355"
            }"><strong>${m.role === "student" ? esc(who) : "Student Companion"}:</strong> ${esc(m.text).replace(/\n/g, "<br>")}</p>`
        )
        .join("")}</div>`
    : "";
  const html = layout({
    preheader: `${t.topic}: ${t.message.slice(0, 90)}`,
    title: `Request from ${who}`,
    body:
      paragraph(`${esc(who)} asked to talk to the ${esc(t.team_name)} team from Student Companion AI.`) +
      detailCard(rows) +
      `<div style="margin-top:18px">${heading("Their message")}${paragraph(esc(t.message).replace(/\n/g, "<br>"))}</div>` +
      convo +
      paragraph(
        `Reply to this email to answer ${esc(who)} directly. Mark the request resolved in the Student Companion dashboard (Inquiries) when it's done.`,
        "color:#6B6355;font-size:13px;"
      ),
    footerNote: `Sent because ${t.to_email} is the ${t.team_name} contact for ${t.organization_name} on Student Companion AI.`,
  });
  const text = [
    `Request from ${who} <${t.student_email}>`,
    `Reference: ${t.reference}`,
    `University: ${t.organization_name}`,
    `Topic: ${t.topic}`,
    "",
    t.message,
    ...(t.transcript.length
      ? ["", "The conversation so far:", ...t.transcript.map((m) => `${m.role === "student" ? who : "Student Companion"}: ${m.text}`)]
      : []),
    "",
    `Reply to this email to answer ${who} directly.`,
    "",
    textFooter(`Sent because ${t.to_email} is the ${t.team_name} contact for ${t.organization_name}.`),
  ].join("\n");
  return {
    to: [t.to_email],
    reply_to: t.student_email,
    subject: `[${t.reference}] ${t.topic}: ${who}`,
    html,
    text,
  };
}

/** When it was sent, in Kigali time: "Wed 19 Nov 2026, 14:22". */
function sentAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Kigali", weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const v = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${v("weekday")} ${v("day")} ${v("month")} ${v("year")}, ${v("hour")}:${v("minute")} (Kigali time)`;
}

/** The student's receipt: what was sent, to whom, and what happens next.
 *  Only ever goes to the address they signed in with. */
export function confirmationFor(t: Ticket) {
  const first = (t.student_name || "").trim().split(/\s+/)[0];
  const hello = first ? `Hi ${first},` : "Hi,";
  const when = sentAt(t.created_at);
  const rows: Array<[string, string]> = [
    ["Reference", t.reference],
    ["Sent to", t.team_name],
    ["Sent", when],
    ["Topic", t.topic],
  ];
  const html = layout({
    preheader: `Your request ${t.reference} is with the ${t.team_name} team.`,
    title: "Your request has been sent",
    body:
      paragraph(`${esc(hello)} your request has been sent to the <strong>${esc(t.team_name)}</strong> team at ${esc(t.organization_name)}.`) +
      detailCard(rows) +
      `<div style="margin-top:18px">${heading("Your message")}${paragraph(esc(t.message).replace(/\n/g, "<br>"))}</div>` +
      `<div style="margin-top:18px">${heading("What happens next")}${paragraph(
        `The team will reply to this email address. If you need to follow up, write to <a href="mailto:${esc(t.to_email)}">${esc(t.to_email)}</a> and quote <strong>${esc(t.reference)}</strong>.`
      )}</div>`,
    footerNote: `You're receiving this because you sent a request from Student Companion AI as ${t.student_email}.`,
  });
  const text = [
    hello,
    "",
    `Your request has been sent to the ${t.team_name} team at ${t.organization_name}.`,
    "",
    `Reference: ${t.reference}`,
    ...(when ? [`Sent: ${when}`] : []),
    `Topic: ${t.topic}`,
    "",
    "Your message:",
    t.message,
    "",
    `What happens next: the team will reply to this email address. If you need to follow up, write to ${t.to_email} and quote ${t.reference}.`,
    "",
    textFooter(`You're receiving this because you sent a request from Student Companion AI as ${t.student_email}.`),
  ].join("\n");
  return {
    to: [t.student_email],
    reply_to: t.to_email,
    subject: `We've sent your request to ${t.team_name} [${t.reference}]`,
    html,
    text,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const auth = req.headers.authorization;
  if (!auth || !/^Bearer\s+\S+/.test(auth)) return res.status(401).json({ error: "Please sign in again." });

  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) || {};
  const payload = {
    topic: String(body.topic || "").slice(0, 200),
    message: String(body.message || "").slice(0, 6000),
    transcript: Array.isArray(body.transcript) ? body.transcript.slice(-20) : [],
  };

  // 1. Store it (and learn who to email) with the student's own sign-in.
  let ticket: Ticket;
  try {
    const r = await fetch(`${BACKEND}/api/support/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const data = (await r.json().catch(() => ({}))) as { detail?: unknown } & Partial<Ticket>;
    if (!r.ok) {
      const detail = typeof data?.detail === "string" ? data.detail : "";
      const status = r.status === 401 || r.status === 403 ? 401 : r.status === 429 ? 429 : r.status === 422 ? 422 : r.status === 404 ? 404 : 502;
      const fallback =
        status === 429 ? "You've sent several requests recently. Please wait a little before sending another."
        : status === 401 ? "Please sign in again."
        : "Your request couldn't be sent. Please try again in a moment.";
      return res.status(status).json({ error: detail || fallback });
    }
    ticket = data as Ticket;
  } catch (e) {
    console.error("[support/ticket] backend unreachable:", e);
    return res.status(502).json({ error: "Your request couldn't be sent. Please try again in a moment." });
  }

  // 2. Email the team.
  let emailed = false;
  let error: string | undefined;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    error = "RESEND_API_KEY missing";
    console.error("[support/ticket] RESEND_API_KEY missing: request stored, not emailed", ticket.reference);
  } else {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ from: FROM_ADDRESS, ...emailFor(ticket) }),
        signal: AbortSignal.timeout(15000),
      });
      emailed = r.ok;
      if (!r.ok) error = `Resend ${r.status}: ${(await r.text().catch(() => "")).slice(0, 200)}`;
    } catch (e) {
      error = e instanceof Error ? e.message : "send failed";
    }
    if (!emailed) console.error("[support/ticket] email failed", ticket.reference, error);
  }

  // 3. The student's receipt (best effort: it never fails the request).
  let confirmed = false;
  if (key) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ from: FROM_ADDRESS, ...confirmationFor(ticket) }),
        signal: AbortSignal.timeout(15000),
      });
      confirmed = r.ok;
      if (!r.ok) console.error("[support/ticket] confirmation failed", ticket.reference, r.status, (await r.text().catch(() => "")).slice(0, 200));
    } catch (e) {
      console.error("[support/ticket] confirmation failed", ticket.reference, e);
    }
  }

  // 4. Record delivery (best effort: the request is stored either way).
  try {
    await fetch(`${BACKEND}/api/support/tickets/${encodeURIComponent(ticket.id)}/delivered`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify({ ok: emailed, error }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error("[support/ticket] could not record delivery", ticket.reference, e);
  }

  return res.status(200).json({
    reference: ticket.reference,
    team_name: ticket.team_name,
    to_email: ticket.to_email,
    emailed,
    confirmed,
  });
}
