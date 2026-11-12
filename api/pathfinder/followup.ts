/**
 * POST /api/pathfinder/followup: send one Pathfinder follow-up email.
 *
 * Called by Student Companion AI's backend (its worker checks every 15
 * minutes) when a student's follow-up is due: 3 weeks, 2 months and 4
 * months after their request, until every university they chose has an
 * outcome or they stop the emails. The email asks "How did it go with
 * <university>?" with one-click answers (I applied, I got in, Not going
 * ahead, Still deciding), a link to the application page, and a link to
 * stop the emails.
 *
 * Nothing in the request is trusted: the backend's state link (which must
 * be on the backend's own address) says whether a follow-up is really due,
 * and the address is only used if its check matches. The follow-up is then
 * claimed before sending, so a repeat or forged call sends nothing.
 *
 * Undergraduate route: the same check-ins about the opportunities the
 * student tracks (2 weeks, 6 weeks and 3 months, with "I got it" wording),
 * and deadline reminders: a state link of type "reminder" (/d/<token>) for
 * one opportunity whose deadline is 5 days away.
 *
 * Env: RESEND_API_KEY, LEAD_FROM_EMAIL (shared with lead.ts),
 * PATHFINDER_LINK_BASE (optional).
 */

import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, rateLimit } from "../_shared.js";
import { esc, heading, layout, paragraph, textFooter } from "../_email.js";

const FROM_ADDRESS = process.env.LEAD_FROM_EMAIL || "Pathfinder <onboarding@resend.dev>";
const LINK_BASE = (process.env.PATHFINDER_LINK_BASE || "https://api.studentcompanionai.rw/api/pathfinder/").replace(/\/?$/, "/");
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface State {
  type?: "followup" | "reminder";
  stage?: "high_school" | "undergraduate";
  due: boolean;
  number: number;
  stop?: string;
  email_check?: string;
  universities: Array<{
    name: string;
    outcome: string;
    apply: string | null;
    status: string;
    kind?: string;
    organization?: string | null;
    deadline?: string | null;
  }>;
}

const linkOk = (v: unknown): v is string =>
  typeof v === "string" && v.length < 400 && v.startsWith(LINK_BASE) && /^[\w:/.\-=]+$/.test(v);

const GOLD = "#B8941F";
const INK = "#1A1A1A";
const FONT = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";

/** A small outlined answer button. */
const choice = (href: string, label: string, strong = false) =>
  `<a href="${esc(href)}" style="display:inline-block;margin:6px 6px 0 0;padding:9px 14px;border-radius:999px;` +
  `border:1px solid ${strong ? INK : "#D8CFA8"};background:${strong ? INK : "#FFFFFF"};` +
  `${FONT}font-size:13.5px;font-weight:600;color:${strong ? "#FFFFFF" : INK};text-decoration:none">${label}</a>`;

const ANSWERS: Array<[string, string]> = [
  ["applied", "I applied"],
  ["enrolled", "I got in / enrolled"],
  ["not_proceeding", "Not going ahead"],
  ["deciding", "Still deciding"],
];
// For an internship, job, scholarship or fellowship ("enrolled" = got it).
const OPPORTUNITY_ANSWERS: Array<[string, string]> = [
  ["applied", "I applied"],
  ["enrolled", "I got it"],
  ["not_proceeding", "Not going ahead"],
  ["deciding", "Haven't applied yet"],
];

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "Deadline in 5 days": one opportunity whose deadline is close. */
function reminderEmail(state: State) {
  const u = state.universities.find((x) => linkOk(x.outcome));
  if (!u) return null;
  const when = u.deadline ? longDate(u.deadline) : "soon";
  const days = u.deadline ? Math.round((Date.parse(`${u.deadline}T00:00:00Z`) - Date.now()) / 86_400_000) : null;
  const soon = days !== null && days >= 0 ? (days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`) : "soon";
  const stop = linkOk(state.stop) ? state.stop : null;
  const apply = linkOk(u.apply) ? u.apply : null;
  const html = layout({
    preheader: `The deadline for ${u.name} is ${when}.`,
    title: `Deadline ${soon}`,
    body:
      paragraph(
        `You asked us to remind you: the deadline for <strong>${esc(u.name)}</strong>` +
          `${u.organization ? ` (${esc(u.organization)})` : ""} is <strong>${esc(when)}</strong>.`
      ) +
      paragraph("If you haven't applied yet, there's still time. Check the requirements on the page before you start.") +
      (apply ? `<div>${choice(apply, "Open the application", true)}</div>` : "") +
      paragraph(
        `Already applied? <a href="${esc(u.outcome)}?a=applied" style="color:${GOLD}">Tell us in one click</a>. ` +
          `Decided not to? <a href="${esc(u.outcome)}?a=not_proceeding" style="color:${GOLD}">Let us know</a> and we'll stop asking.`,
        "margin-top:18px"
      ),
    footerNote:
      "You're getting this because you asked Pathfinder on Student Companion AI for deadline reminders. " +
      (stop ? `<a href="${esc(stop)}" style="color:#6B6355">Stop these emails</a>.` : ""),
  });
  const text = [
    `Deadline ${soon}: ${u.name}${u.organization ? ` (${u.organization})` : ""}, ${when}.`,
    "",
    ...(apply ? [`Open the application: ${apply}`] : []),
    `Already applied? ${u.outcome}?a=applied`,
    `Not going ahead? ${u.outcome}?a=not_proceeding`,
    "",
    textFooter(`You asked Pathfinder for deadline reminders.${stop ? ` Stop these emails: ${stop}` : ""}`),
  ].join("\n");
  return { html, text, subject: `Deadline ${soon}: ${u.name}`, stop };
}

function email(state: State) {
  const undergrad = state.stage === "undergraduate";
  const unis = state.universities.filter((u) => linkOk(u.outcome)).slice(0, undergrad ? 5 : 3);
  const opening = undergrad
    ? state.number === 1
      ? "A couple of weeks ago you used Pathfinder and chose these opportunities. How is it going?"
      : "We're checking in again on the opportunities you chose on Pathfinder. Any news?"
    : state.number === 1
      ? "A few weeks ago you used Pathfinder and asked to hear from these universities. How is it going?"
      : "We're checking in again on the universities you chose on Pathfinder. Any news?";
  const blocks = unis
    .map((u) => {
      const opp = u.kind === "opportunity";
      const answers = (opp ? OPPORTUNITY_ANSWERS : ANSWERS)
        .map(([a, label], i) => choice(`${u.outcome}?a=${a}`, label, i === 0))
        .join("");
      const apply = linkOk(u.apply)
        ? `<p style="margin:10px 0 0;${FONT}font-size:13.5px"><a href="${esc(u.apply)}" style="color:${GOLD}">` +
          (opp ? "Haven't applied yet? Open the application" : `Haven't applied yet? Open ${esc(u.name)}'s application page`) +
          `</a></p>`
        : "";
      return heading(`How did it go with ${esc(u.name)}?`) + `<div>${answers}</div>` + apply;
    })
    .join("");
  const stop = linkOk(state.stop) ? state.stop : null;
  const note =
    "You're getting this because you sent a request through Pathfinder on Student Companion AI. " +
    (stop ? `<a href="${esc(stop)}" style="color:#6B6355">Stop these emails</a>.` : "");
  const html = layout({
    preheader: "One click tells us how your university applications went.",
    title: "How are your applications going?",
    body:
      paragraph(opening) +
      paragraph(
        undergrad
          ? "One click is enough. It helps us find better opportunities for the next students."
          : "One click is enough. It helps us guide the next students, and shows us which universities follow up."
      ) +
      blocks +
      paragraph(`Questions? Reply to this email or write to info@studentcompanionai.rw.`, "margin-top:24px"),
    footerNote: note,
  });
  const text = [
    "How are your applications going?",
    "",
    opening,
    "",
    ...unis.flatMap((u) => [
      `${u.name}:`,
      ...(u.kind === "opportunity" ? OPPORTUNITY_ANSWERS : ANSWERS).map(([a, label]) => `  ${label}: ${u.outcome}?a=${a}`),
      ...(linkOk(u.apply) ? [`  Application page: ${u.apply}`] : []),
      "",
    ]),
    textFooter(`You're getting this because you sent a request through Pathfinder.${stop ? ` Stop these emails: ${stop}` : ""}`),
  ].join("\n");
  const subject = unis.length === 1
    ? `How did it go with ${unis[0].name}?`
    : undergrad
      ? "How are your applications going?"
      : "How are your university applications going?";
  return { html, text, unis, subject };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res)) return;
  if (!rateLimit(req, 120, 15 * 60 * 1000)) return res.status(429).json({ error: "Too many requests" });

  const body = (req.body || {}) as { state?: unknown; email?: unknown };
  const address = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!linkOk(body.state) || !EMAIL.test(address)) return res.status(400).json({ error: "Bad request" });
  const stateUrl = body.state;
  const token = stateUrl.slice(stateUrl.lastIndexOf("/") + 1);

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: "Email is not configured" });

  let state: State;
  try {
    const r = await fetch(stateUrl, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return res.status(404).json({ error: "Not found" });
    state = (await r.json()) as State;
  } catch {
    return res.status(502).json({ error: "Backend unavailable" });
  }

  const check = createHash("sha256").update(`${token}:${address}`).digest("hex");
  if (!state.due || state.email_check !== check) return res.status(200).json({ ok: true, sent: false });

  const message =
    state.type === "reminder"
      ? reminderEmail(state)
      : (() => {
          const m = email(state);
          return m.unis.length ? m : null;
        })();
  if (!message) return res.status(200).json({ ok: true, sent: false });
  const { html, text, subject } = message;

  // Claim this follow-up first: only one caller can, so it is sent once.
  try {
    const c = await fetch(`${stateUrl}/sent?number=${encodeURIComponent(String(state.number))}`, {
      method: "POST",
      signal: AbortSignal.timeout(8000),
    });
    const claimed = c.ok && ((await c.json()) as { claimed?: boolean }).claimed;
    if (!claimed) return res.status(200).json({ ok: true, sent: false });
  } catch {
    return res.status(502).json({ error: "Backend unavailable" });
  }

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [address],
      replyTo: "info@studentcompanionai.rw",
      subject,
      html,
      text,
      headers: state.stop ? { "List-Unsubscribe": `<${state.stop}>` } : undefined,
    }),
  });
  if (!r.ok) {
    console.error("[pathfinder/followup] Resend", r.status, (await r.text().catch(() => "")).slice(0, 300));
    return res.status(502).json({ error: "Could not send" });
  }
  return res.status(200).json({ ok: true, sent: true });
}
