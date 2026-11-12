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
 *   LEAD_NOTIFY_EMAIL         — team inbox(es), comma-separated for several
 *   FIREBASE_PROJECT_ID       — optional; storage is skipped if absent
 *   FIREBASE_CLIENT_EMAIL     — service-account email
 *   FIREBASE_PRIVATE_KEY      — service-account key ("\n" escapes are handled)
 *   UNIVERSITY_CONTACTS       — optional; admissions addresses (see _contacts.ts)
 *   LEAD_CC_EMAIL             — copied on university emails; defaults to
 *                               info@studentcompanionai.rw ("off" to stop)
 *
 * Universities: the student can tick universities from their report to send
 * their enquiry to as well. Only universities with a confirmed admissions
 * address (api/_contacts.ts) can be chosen, the address is looked up here
 * from the university's website and never taken from the request, and at
 * most three are sent per enquiry. Sending to a university needs a verified
 * sender domain (LEAD_FROM_EMAIL): Resend's shared sender can only deliver
 * to the account owner, so until then the team is told which universities
 * the student chose and passes the enquiry on.
 *
 * Undergraduate route: no universities are contacted. The student ticks
 * opportunities to track; the team's email lists them, and (once a sender
 * domain is verified) the student gets their list by email with tracked
 * application links. That list is read back from the backend's follow-up
 * state, so its names and links are the backend's, never the request's.
 */
import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
// See the note in recommend.ts — the .js extension is required under ESM.
import { methodGuard, parseAnswers, rateLimit, stageOf, summarise } from "../_shared.js";
import { contactFor, referralFor } from "../_contacts.js";
import {
  LINKS, button, callout, detailCard, esc, forInstitutions, heading, layout, paragraph,
  profileRows, profileText, textFooter,
} from "../_email.js";

const MAX_UNIVERSITIES = 3;

/**
 * Copied on every enquiry sent to a university, so the team sees each one
 * that goes out. LEAD_CC_EMAIL in Vercel overrides it; set it to "off" to
 * stop copying.
 */
const UNIVERSITY_CC = (() => {
  const v = (process.env.LEAD_CC_EMAIL ?? "info@studentcompanionai.rw").trim();
  return v && v.toLowerCase() !== "off" ? v : "";
})();

/**
 * Where enquiries are sent. Defaults to the address that owns the Resend
 * account, because Resend's free shared sender refuses to deliver anywhere
 * else — sending to studentcompanionai@gmail.com returned a 403 until a
 * domain is verified. Once studentcompanionai.rw (or similar) is verified at
 * resend.com/domains, set LEAD_FROM_EMAIL to an address on it and this can
 * point anywhere.
 */
const NOTIFY_TO = (process.env.LEAD_NOTIFY_EMAIL || "d.ngum@alustudent.com")
  // Several team inboxes can get every enquiry: separate them with commas,
  // e.g. "studentcompanionai@gmail.com, info@studentcompanionai.rw".
  .split(",")
  .map((e) => e.trim())
  .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))
  .slice(0, 5);

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
  /** Student Companion AI's referral link for this university, if any. */
  referral: string;
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
    out.push({
      name: str(school.name, 160) || host,
      url,
      programme: str(school.programme, 200),
      email,
      referral: referralFor(url) || "",
    });
  }
  return out;
}

/** Where Student Companion AI's backend issues one-click links. Links from
 *  the request body are only used if they point here, so a crafted request
 *  can't put another site's link in an email. */
const LINK_BASE = (process.env.PATHFINDER_LINK_BASE || "https://api.studentcompanionai.rw/api/pathfinder/").replace(/\/?$/, "/");

function linkOk(v: unknown): v is string {
  return typeof v === "string" && v.length < 400 && v.startsWith(LINK_BASE) && /^[\w:/.\-=]+$/.test(v);
}

/** The "We've contacted this student" link for each university, by website. */
function respondLinks(raw: unknown): Map<string, string> {
  const out = new Map<string, string>();
  const unis = raw && typeof raw === "object" ? (raw as { universities?: unknown }).universities : null;
  if (!Array.isArray(unis)) return out;
  for (const u of unis.slice(0, 6)) {
    const url = u && typeof u === "object" ? (u as { url?: unknown }).url : null;
    const respond = u && typeof u === "object" ? (u as { respond?: unknown }).respond : null;
    if (typeof url === "string" && linkOk(respond)) out.set(url, respond);
  }
  return out;
}

/** Tell the backend how the enquiry reached each university. Best effort. */
async function reportDelivery(respond: string | undefined, delivery: "emailed" | "passed_on") {
  if (!respond) return;
  try {
    await fetch(`${respond}/delivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delivery }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* the request is already saved; the team can correct delivery by hand */
  }
}

/** The opportunities the student ticked, for the team's email only (titles
 *  as shown in their report). */
interface TrackedOpportunity {
  title: string;
  organization: string;
  deadline: string;
}

function parseOpportunities(raw: unknown, report: unknown): TrackedOpportunity[] {
  if (!Array.isArray(raw)) return [];
  const list =
    report && typeof report === "object" && Array.isArray((report as { opportunities?: unknown }).opportunities)
      ? ((report as { opportunities: unknown[] }).opportunities as Array<Record<string, unknown>>)
      : [];
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  return raw
    .slice(0, 6)
    .map((id) => list.find((o) => o && o.id === id))
    .filter((o): o is Record<string, unknown> => !!o)
    .map((o) => ({ title: str(o.title, 160), organization: str(o.organization, 120), deadline: str(o.deadline, 80) }))
    .filter((o) => o.title);
}

interface StateItem {
  name: string;
  organization?: string | null;
  deadline?: string | null;
  outcome: string;
  apply: string | null;
}

/**
 * The student's tracked opportunities, read from the backend (names, dates
 * and links as stored there), and only if the address matches the request.
 */
async function trackedFromBackend(links: unknown, email: string): Promise<{ items: StateItem[]; stop: string | null }> {
  const state = links && typeof links === "object" ? (links as { followup_state?: unknown }).followup_state : null;
  if (!linkOk(state)) return { items: [], stop: null };
  const r = await fetch(state, { signal: AbortSignal.timeout(6000) });
  if (!r.ok) return { items: [], stop: null };
  const data = (await r.json()) as { email_check?: string; stop?: string; universities?: Array<Record<string, unknown>> };
  const token = state.slice(state.lastIndexOf("/") + 1);
  const check = createHash("sha256").update(`${token}:${email.trim().toLowerCase()}`).digest("hex");
  if (data.email_check !== check) return { items: [], stop: null };
  const items = (data.universities ?? [])
    .filter((u) => u.kind === "opportunity" && typeof u.name === "string" && linkOk(u.outcome))
    .slice(0, 6)
    .map((u) => ({
      name: String(u.name).slice(0, 160),
      organization: typeof u.organization === "string" ? u.organization.slice(0, 120) : null,
      deadline: typeof u.deadline === "string" ? u.deadline : null,
      outcome: u.outcome as string,
      apply: linkOk(u.apply) ? (u.apply as string) : null,
    }));
  return { items, stop: linkOk(data.stop) ? data.stop : null };
}

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** The student's own copy of what they're tracking. Best effort. */
async function emailTracked(lead: Lead, links: unknown, key: string, remind: boolean) {
  const { items, stop } = await trackedFromBackend(links, lead.email);
  if (!items.length) return;
  const first = lead.name.split(/\s+/)[0] || lead.name;
  const blocks = items
    .map((u) => {
      const when = u.deadline ? `Deadline: ${esc(longDate(u.deadline))}` : "Deadline: rolling or see the page";
      return (
        heading(esc(u.name)) +
        paragraph(`${u.organization ? `${esc(u.organization)} · ` : ""}${when}`) +
        (u.apply ? button(u.apply, "Open the application") : "") +
        paragraph(
          `Applied already? <a href="${esc(u.outcome)}?a=applied" style="color:#B8941F">Tell us in one click</a>.`
        )
      );
    })
    .join("");
  const note =
    "You're getting this because you asked Pathfinder on Student Companion AI to track these opportunities. " +
    (stop ? `<a href="${esc(stop)}" style="color:#6B6355">Stop these emails</a>.` : "");
  const html = layout({
    preheader: "The opportunities you're tracking, with their deadlines.",
    title: "Your opportunities",
    body:
      paragraph(`Hi ${esc(first)}, here are the opportunities you chose on Pathfinder.`) +
      (remind ? paragraph("We'll remind you 5 days before each fixed deadline.") : "") +
      blocks +
      paragraph(
        `More open opportunities: <a href="${LINKS.opportunities}" style="color:#B8941F">SCA career site</a>. ` +
          "Questions? Reply to this email.",
        "margin-top:24px"
      ),
    footerNote: note,
  });
  const text = [
    `Hi ${first}, here are the opportunities you chose on Pathfinder.`,
    remind ? "We'll remind you 5 days before each fixed deadline." : "",
    "",
    ...items.flatMap((u) => [
      `${u.name}${u.organization ? ` (${u.organization})` : ""}`,
      `  Deadline: ${u.deadline ? longDate(u.deadline) : "rolling or see the page"}`,
      ...(u.apply ? [`  Apply: ${u.apply}`] : []),
      `  Applied already? ${u.outcome}?a=applied`,
      "",
    ]),
    `More open opportunities: ${LINKS.opportunities}`,
    textFooter(`You asked Pathfinder to track these.${stop ? ` Stop these emails: ${stop}` : ""}`),
  ]
    .filter((l, i, all) => l !== "" || all[i - 1] !== "")
    .join("\n");
  await send(key, {
    to: [lead.email],
    replyTo: "info@studentcompanionai.rw",
    subject: items.length === 1 ? `Your opportunity: ${items[0].name}` : "The opportunities you're tracking",
    html,
    text,
    headers: stop ? { "List-Unsubscribe": `<${stop}>` } : undefined,
  });
}

/** Sending outside the team needs a verified domain in Resend. */
function canEmailOutsiders(): boolean {
  return !/@resend\.dev>?$/i.test(FROM_ADDRESS.trim());
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
async function notifyUniversity(lead: Lead, profile: string, uni: University, key: string, respond?: string) {
  const first = lead.name.split(/\s+/)[0] || lead.name;
  const note =
    "This enquiry comes from the Student Companion AI platform. The student chose to share these details " +
    "with your institution. Student Companion AI gives guidance only and does not make admission decisions.";
  const details: Array<[string, string]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone / WhatsApp", lead.phone || "Not given"],
    ["Interested in", uni.programme],
  ];
  const html = layout({
    preheader: `${lead.name} would like to hear from ${uni.name}.`,
    title: "A prospective student would like to hear from you",
    footerNote: note,
    body: [
      paragraph(`Dear ${esc(uni.name)} admissions team,`),
      paragraph(
        `<strong>${esc(lead.name)}</strong> used ` +
          `<a href="${LINKS.pathfinder}" style="color:#B8941F">Pathfinder</a> on ` +
          `<a href="${LINKS.chat}" style="color:#B8941F">Student Companion AI</a>, our student support platform. ` +
          `Pathfinder helps high school students find the universities and programmes that match their skills ` +
          `and learning profile, and it suggested your institution. ${esc(first)} asked us to introduce them to ` +
          `you. Replying to this email reaches ${esc(first)} directly.`
      ),
      detailCard(details),
      lead.message ? heading("Their question") + paragraph(esc(lead.message)) : "",
      heading("About them"),
      detailCard(profileRows(profile)),
      uni.referral
        ? callout(
            `<strong>Referral.</strong> ${esc(first)} was referred by Student Companion AI through your referral ` +
              `programme, and we have asked them to register through our link: ` +
              `<a href="${esc(uni.referral)}" style="color:#B8941F">${esc(uni.referral)}</a>`
          )
        : "",
      button(
        `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(`Your enquiry to ${uni.name}`)}`,
        `Reply to ${esc(first)}`
      ),
      respond
        ? paragraph(
            `Once you've been in touch, please <a href="${esc(respond)}" style="color:#B8941F;font-weight:600">` +
              `confirm you've contacted ${esc(first)}</a>. It takes one click and helps us show students ` +
              `which universities follow up.`
          )
        : "",
      forInstitutions(),
    ].join(""),
  });
  const text = [
    `Dear ${uni.name} admissions team,`,
    "",
    `${lead.name} used Pathfinder (${LINKS.pathfinder}) on Student Companion AI, our student support platform. ` +
      `Pathfinder helps high school students find the universities and programmes that match their skills and ` +
      `learning profile, and it suggested your institution. They asked us to introduce them to you. ` +
      `Replying to this email reaches them directly.`,
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone / WhatsApp: ${lead.phone || "Not given"}`,
    uni.programme ? `Interested in: ${uni.programme}` : "",
    lead.message ? `\nTheir question:\n${lead.message}` : "",
    "",
    "About them:",
    profileText(profile),
    uni.referral ? `\nReferral: referred by Student Companion AI through your referral programme: ${uni.referral}` : "",
    respond ? `\nOnce you've been in touch, please confirm you've contacted ${first} (one click): ${respond}` : "",
    "",
    "About Student Companion AI, our student support platform: an AI student assistant, Pathfinder (matching " +
      "high school students with the right universities), opportunities, free courses, and housing " +
      `and travel support for students. Bring it to your institution: ${LINKS.email}`,
    "",
    textFooter(note),
  ]
    .filter((line) => line !== "")
    .join("\n");
  await send(key, {
    to: [uni.email],
    ...(UNIVERSITY_CC && UNIVERSITY_CC.toLowerCase() !== uni.email.toLowerCase() ? { cc: [UNIVERSITY_CC] } : {}),
    replyTo: lead.email,
    subject: `Prospective student enquiry via Student Companion AI: ${lead.name}`,
    html,
    text,
  });
}

async function notify(
  lead: Lead,
  profile: string,
  key: string,
  sentTo: University[],
  pending: University[],
  tracking: TrackedOpportunity[] = [],
  undergrad = false
) {
  const names = (unis: University[]) => unis.map((u) => esc(u.name)).join(", ");
  const referred = [...sentTo, ...pending].filter((u) => u.referral);
  const body = [
    paragraph(
      `<strong>${esc(lead.name)}</strong> asked for free advice on Pathfinder` +
        `${undergrad ? " (university student or recent graduate)" : ""}. Reply to this email to reach them.`
    ),
    detailCard([
      ["Name", lead.name],
      ["Email", lead.email],
      ["Phone / WhatsApp", lead.phone || "Not given"],
    ]),
    sentTo.length ? callout(`<strong>Sent to:</strong> ${names(sentTo)}. You were copied on each.`) : "",
    pending.length
      ? callout(
          `<strong>Please forward to:</strong> ${pending.map((u) => `${esc(u.name)} (${esc(u.email)})`).join(", ")}. ` +
            "The student chose these universities, but the email could not be sent automatically."
        )
      : "",
    tracking.length
      ? callout(
          `<strong>Tracking:</strong> ${tracking
            .map((o) => `${esc(o.title)}${o.organization ? ` (${esc(o.organization)})` : ""}, deadline ${esc(o.deadline)}`)
            .join("; ")}.`
        )
      : "",
    referred.length
      ? callout(
          `<strong>Referral:</strong> ${referred.map((u) => `${esc(u.name)}, <a href="${esc(u.referral)}" style="color:#B8941F">our referral link</a>`).join("; ")}. ` +
            "Include the link when forwarding by hand."
        )
      : "",
    lead.message ? heading("Their question") + paragraph(esc(lead.message)) : "",
    heading("Their answers"),
    detailCard(profileRows(profile)),
    button(`mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent("Your Pathfinder request")}`, `Reply to ${esc(lead.name.split(/\s+/)[0] || lead.name)}`),
  ].join("");
  const note = "Sent by Pathfinder to the Student Companion AI team.";
  await send(key, {
    to: NOTIFY_TO.length ? NOTIFY_TO : ["d.ngum@alustudent.com"],
    // Resend's current API uses replyTo; the older reply_to is rejected
    // with a 422, which is invisible without reading the response body.
    replyTo: lead.email,
    subject: `Pathfinder ${undergrad ? "undergraduate " : ""}enquiry — ${lead.name}`,
    html: layout({ preheader: `${lead.name} asked for free advice.`, title: "New Pathfinder request", body, footerNote: note }),
    text: [
      `${lead.name} asked for free advice on Pathfinder.`,
      `Email: ${lead.email}`,
      `Phone / WhatsApp: ${lead.phone || "Not given"}`,
      sentTo.length ? `Sent to: ${sentTo.map((u) => u.name).join(", ")}` : "",
      pending.length ? `Please forward to: ${pending.map((u) => `${u.name} (${u.email})`).join(", ")}` : "",
      tracking.length ? `Tracking: ${tracking.map((o) => `${o.title} (${o.organization}), deadline ${o.deadline}`).join("; ")}` : "",
      referred.length ? `Referral links: ${referred.map((u) => `${u.name}: ${u.referral}`).join("; ")}` : "",
      lead.message ? `\nTheir question:\n${lead.message}` : "",
      "",
      "Their answers:",
      profileText(profile),
      "",
      textFooter(note),
    ].filter((l) => l !== "").join("\n"),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res)) return;

  // Tighter than the report endpoint — nobody legitimately submits 3+ times.
  if (!rateLimit(req, 3, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many submissions. Please wait a few minutes." });
  }

  const body = req.body as {
    details?: unknown;
    answers?: unknown;
    universities?: unknown;
    report?: unknown;
    links?: unknown;
    opportunities?: unknown;
  };
  const lead = parseLead(body?.details);
  if (!lead) return res.status(400).json({ error: "Please check your name and email address." });

  const answers = parseAnswers(body?.answers);
  const profile = answers ? summarise(answers) : "(answers unavailable)";
  const undergrad = !!answers && stageOf(answers) === "undergraduate";
  // Undergraduates contact no universities: they track opportunities.
  const universities = undergrad ? [] : parseUniversities(body?.universities, body?.report);
  const tracking = undergrad ? parseOpportunities(body?.opportunities, body?.report) : [];
  const respondFor = respondLinks(body?.links);

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
      await notifyUniversity(lead, profile, uni, resendKey, respondFor.get(uni.url));
      sentTo.push(uni);
    } catch (err) {
      console.error("[pathfinder/lead] university email", uni.name, err);
      pending.push(uni);
    }
  }

  await Promise.all([
    ...sentTo.map((u) => reportDelivery(respondFor.get(u.url), "emailed")),
    ...pending.map((u) => reportDelivery(respondFor.get(u.url), "passed_on")),
  ]);

  if (undergrad && tracking.length && canEmailOutsiders()) {
    const remind = Array.isArray((body?.links as { universities?: unknown[] } | undefined)?.universities)
      ? ((body.links as { universities: Array<{ reminder?: unknown }> }).universities.some((u) => linkOk(u?.reminder)))
      : false;
    try {
      await emailTracked(lead, body?.links, resendKey, remind);
    } catch (err) {
      console.error("[pathfinder/lead] tracked list email", err);
    }
  }

  try {
    await notify(lead, profile, resendKey, sentTo, pending, tracking, undergrad);
  } catch (err) {
    console.error("[pathfinder/lead] email", err);
    // If the record was saved, or a university already has it, we can still
    // follow up, so don't tell the student their submission failed.
    if (stored || sentTo.length) {
      return res.status(200).json(result(sentTo, pending));
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

  return res.status(200).json(result(sentTo, pending));
}

/** What the student is told: who has their request, and where to start an
 *  application so a referral is credited. */
function result(sentTo: University[], pending: University[]) {
  return {
    ok: true,
    sentTo: sentTo.map((u) => u.name),
    passedOn: pending.map((u) => u.name),
    referrals: [...sentTo, ...pending]
      .filter((u) => u.referral)
      .map((u) => ({ name: u.name, url: u.referral })),
  };
}
