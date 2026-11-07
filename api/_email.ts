/**
 * Branded emails for Pathfinder enquiries: the layout, Student Companion
 * AI's links, and a short introduction to the platform for the
 * institutions that receive an enquiry.
 *
 * Email clients ignore most CSS, so everything here is tables and inline
 * styles, 600px wide, with a plain-text version alongside. The underscore
 * keeps Vercel from treating this file as an API route.
 */

export const LINKS = {
  website: "https://studentcompanionai.rw",
  chat: "https://chat.studentcompanionai.rw",
  pathfinder: "https://chat.studentcompanionai.rw/pathfinder",
  opportunities: "https://career.studentcompanionai.rw/opportunities.html",
  courses: "https://career.studentcompanionai.rw/courses.html",
  housing: "https://www.kigalihouz.com",
  travel: "https://play.google.com/store/apps/details?id=rw.itike.app",
  email: "info@studentcompanionai.rw",
  logo: "https://chat.studentcompanionai.rw/logo-icon.png",
};

/**
 * Social media and WhatsApp, shown in every email's footer. Fill these in,
 * or set SOCIAL_LINKS in Vercel as JSON, e.g.
 *   {"WhatsApp": "https://wa.me/2507...", "LinkedIn": "https://www.linkedin.com/company/..."}
 * Empty entries are left out.
 */
const SOCIAL_DEFAULTS: Record<string, string> = {
  WhatsApp: "",
  LinkedIn: "",
  Instagram: "",
  Facebook: "",
  X: "",
  TikTok: "",
  YouTube: "",
};

export function socialLinks(): Array<[string, string]> {
  let fromEnv: Record<string, unknown> = {};
  try {
    fromEnv = JSON.parse(process.env.SOCIAL_LINKS || "{}");
  } catch {
    console.error("[pathfinder/email] SOCIAL_LINKS is not valid JSON");
  }
  const merged: Record<string, string> = { ...SOCIAL_DEFAULTS };
  for (const [k, v] of Object.entries(fromEnv)) if (typeof v === "string") merged[k] = v;
  return Object.entries(merged).filter(([, url]) => /^https:\/\//.test(url.trim()));
}

const INK = "#1A1A1A";
const MUTED = "#6B6355";
const GOLD = "#B8941F";
const CREAM = "#FBF7E9";
const LINE = "#E8DDB0";
const FONT = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";
const SERIF = "font-family:Georgia,'Times New Roman',serif;";

export function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const a = (href: string, text: string, style = "") =>
  `<a href="${esc(href)}" style="color:${GOLD};text-decoration:underline;${style}">${text}</a>`;

/** A dark, rounded button. */
export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 4px"><tr>
    <td style="background:${INK};border-radius:8px">
      <a href="${esc(href)}" style="display:inline-block;padding:12px 22px;${FONT}font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none">${label}</a>
    </td></tr></table>`;
}

export function heading(text: string): string {
  return `<h2 style="margin:28px 0 10px;${SERIF}font-size:18px;font-weight:600;color:${INK}">${text}</h2>`;
}

export function paragraph(html: string, extra = ""): string {
  return `<p style="margin:0 0 14px;${FONT}font-size:15px;line-height:1.6;color:${INK};${extra}">${html}</p>`;
}

/** Label/value rows in a soft card. Values are escaped here. */
export function detailCard(rows: Array<[string, string]>): string {
  const body = rows
    .filter(([, v]) => v)
    .map(
      ([k, v], i) => `<tr>
        <td style="padding:9px 14px;${FONT}font-size:13px;color:${MUTED};width:38%;vertical-align:top;${i ? `border-top:1px solid ${LINE};` : ""}">${esc(k)}</td>
        <td style="padding:9px 14px;${FONT}font-size:14px;color:${INK};vertical-align:top;${i ? `border-top:1px solid ${LINE};` : ""}">${esc(v)}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border:1px solid ${LINE};border-radius:10px;border-collapse:separate">${body}</table>`;
}

// summarise() labels are written to the student; these read better for an
// admissions team or adviser.
const PROFILE_LABELS: Record<string, string> = {
  "Where you are": "Finishing high school in",
  "What you studied": "Subjects",
  "Where you do well": "Strengths",
  "What pulls you": "Interests",
  "What's realistic": "Budget and constraints",
  "How far ahead": "Planning to start",
};

/** The student's Pathfinder answers (summarise() text) as card rows. */
export function profileRows(profile: string): Array<[string, string]> {
  // The optional free-text note is fenced in """ for the model; show it as
  // the student's own words.
  const own = /"""\n?([\s\S]*?)\n?"""/.exec(profile);
  const lines = profile
    .replace(/\n?In the student's own words[\s\S]*$/, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const rows: Array<[string, string]> = lines.map((line) => {
    const at = line.indexOf(":");
    if (at <= 0) return ["", line];
    const key = line.slice(0, at).trim();
    return [PROFILE_LABELS[key] || key, line.slice(at + 1).trim()];
  });
  if (own && own[1].trim()) rows.push(["In their own words", own[1].trim()]);
  return rows;
}

/** The same answers as plain text, with the same labels. */
export function profileText(profile: string): string {
  return profileRows(profile).map(([k, v]) => (k ? `${k}: ${v}` : v)).join("\n");
}

export function callout(html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0"><tr>
    <td style="border-left:3px solid ${GOLD};background:${CREAM};padding:12px 14px;${FONT}font-size:14px;line-height:1.55;color:${INK}">${html}</td>
  </tr></table>`;
}

/** How Student Companion AI supports students, with links. */
function servicesList(): string {
  const items: Array<[string, string, string]> = [
    ["AI student assistant", LINKS.chat, "answers students' questions from their own university's handbooks, policies and student life pages, with links to the source, any time of day."],
    ["Pathfinder", LINKS.pathfinder, "free course and university guidance for high school leavers across Africa, with no account needed."],
    ["Opportunities", LINKS.opportunities, "verified internships, jobs, scholarships, fellowships and competitions for African students."],
    ["Free courses", LINKS.courses, "short courses on practical skills for study and work."],
    ["Housing and travel", LINKS.housing, `help finding a place to live in Kigali (KigaliHouz) and getting around (${a(LINKS.travel, "Itike")}).`],
  ];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items
    .map(
      ([name, href, text]) => `<tr><td style="padding:7px 0;${FONT}font-size:14px;line-height:1.55;color:${INK}">
        <span style="color:${GOLD}">&#9679;</span>&nbsp; ${a(href, `<strong>${name}</strong>`, "text-decoration:none")}: ${text}
      </td></tr>`
    )
    .join("")}</table>`;
}

/** The introduction to the platform, for institutions. */
export function forInstitutions(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0 0;border:1px solid ${LINE};border-radius:12px;border-collapse:separate"><tr><td style="padding:20px 22px">
    <p style="margin:0 0 4px;${FONT}font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${GOLD}">About Student Companion AI</p>
    <p style="margin:0 0 12px;${SERIF}font-size:19px;line-height:1.3;color:${INK}">Supporting students from their first question to their first job</p>
    ${servicesList()}
    <p style="margin:14px 0 0;${FONT}font-size:14px;line-height:1.6;color:${INK}">
      <strong>Bring Student Companion AI to your institution.</strong> Give your students one place to get accurate
      answers about admissions, fees, student life and support, drawn from your own information, and free your
      staff for the conversations that need them.</p>
    ${button(`mailto:${LINKS.email}?subject=${encodeURIComponent("Student Companion AI for our institution")}`, "Talk to our team")}
  </td></tr></table>`;
}

function footer(note: string): string {
  const social = socialLinks();
  const links: Array<[string, string]> = [
    ["Website", LINKS.website],
    ["Student assistant", LINKS.chat],
    ["Pathfinder", LINKS.pathfinder],
    ["Opportunities", LINKS.opportunities],
    ...social,
  ];
  return `<tr><td style="padding:22px 32px 28px;border-top:1px solid ${LINE}">
    <p style="margin:0 0 8px;${FONT}font-size:13px;line-height:1.8;color:${MUTED}">
      ${links.map(([label, href]) => a(href, esc(label), `color:${MUTED};white-space:nowrap`)).join("&nbsp;&nbsp;· ")}
    </p>
    <p style="margin:0 0 8px;${FONT}font-size:13px;color:${MUTED}">
      ${a(`mailto:${LINKS.email}`, LINKS.email, `color:${MUTED}`)}&nbsp;&nbsp;·&nbsp;&nbsp;Kigali, Rwanda</p>
    <p style="margin:0;${FONT}font-size:12px;line-height:1.55;color:${MUTED}">${note}</p>
  </td></tr>`;
}

/** The whole email: header with logo, content, footer. */
export function layout(opts: { preheader: string; title: string; body: string; footerNote: string }): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#F4EFE1">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE1"><tr><td align="center" style="padding:28px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid ${LINE}">
      <tr><td style="height:4px;background:${GOLD};font-size:0;line-height:0">&nbsp;</td></tr>
      <tr><td style="padding:22px 32px 0">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle"><img src="${LINKS.logo}" width="34" height="34" alt="" style="display:block;border:0"></td>
          <td style="vertical-align:middle;padding-left:10px;${SERIF}font-size:18px;color:${INK}">Student Companion AI</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:22px 32px 8px">
        <h1 style="margin:0 0 16px;${SERIF}font-size:24px;line-height:1.25;font-weight:600;color:${INK}">${esc(opts.title)}</h1>
        ${opts.body}
      </td></tr>
      ${footer(opts.footerNote)}
    </table>
  </td></tr></table>
</body></html>`;
}

/** Footer for the plain-text version. */
export function textFooter(note: string): string {
  const social = socialLinks().map(([k, v]) => `${k}: ${v}`);
  return [
    "—",
    "Student Companion AI",
    `Website: ${LINKS.website}`,
    `Student assistant: ${LINKS.chat}`,
    `Pathfinder: ${LINKS.pathfinder}`,
    `Opportunities: ${LINKS.opportunities}`,
    ...social,
    `Email: ${LINKS.email}`,
    "",
    note,
  ].join("\n");
}
