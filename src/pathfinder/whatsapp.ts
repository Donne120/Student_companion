/**
 * Pathfinder on WhatsApp, without any messaging service.
 *
 * Many high-school students have no email but all have WhatsApp. The
 * report page builds a WhatsApp link (wa.me) to the student's own number
 * with their report as the message: WhatsApp opens the chat with
 * themselves ("Message yourself") and they tap send. Nothing is sent by
 * Student Companion AI, so there is no API, cost or conversation to answer.
 * The message ends with an invitation to follow the Student Companion AI
 * WhatsApp channel, where new scholarships and opportunities are posted.
 */
import type { AnyReport } from "./questions";

export const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029VajtyR71SWt02iOsLK2l";
const PATHFINDER = "https://chat.studentcompanionai.rw/pathfinder";

/** Country calling codes for Pathfinder's countries. */
const DIAL: Record<string, string> = {
  Rwanda: "250", Kenya: "254", Uganda: "256", Tanzania: "255", Burundi: "257", "DR Congo": "243",
  Ethiopia: "251", "South Sudan": "211", Nigeria: "234", Ghana: "233", Senegal: "221", "Côte d'Ivoire": "225",
  Cameroon: "237", "Sierra Leone": "232", Liberia: "231", "The Gambia": "220", "South Africa": "27",
  Zambia: "260", Zimbabwe: "263", Malawi: "265", Botswana: "267", Namibia: "264", Mozambique: "258",
  Mauritius: "230", Egypt: "20", Morocco: "212", Tunisia: "216",
};

/**
 * The number in WhatsApp's international form (digits only), or null.
 * "+250 788 123 456", "00250788123456" and, for a student in Rwanda,
 * "0788 123 456" all become "250788123456".
 */
export function toWhatsAppNumber(raw: string, country?: string): string | null {
  const trimmed = (raw || "").trim();
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  const code = country ? DIAL[country] : undefined;
  if (trimmed.startsWith("+")) {
    // already international
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (code && !digits.startsWith(code)) {
    // Côte d'Ivoire keeps its leading 0 after the country code.
    digits = code + (code !== "225" && digits.startsWith("0") ? digits.slice(1) : digits);
  }
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

const MAX = 1800;

/** The report as a WhatsApp message (WhatsApp's *bold* formatting). */
export function reportMessage(report: AnyReport): string {
  const lines: string[] = ["*My Pathfinder report* · Student Companion AI", "", report.headline];
  if ("directions" in report) {
    if (report.opportunities.length) {
      lines.push("", "*Open opportunities for me*");
      for (const o of report.opportunities.slice(0, 5)) {
        lines.push(`• ${o.title} (${o.organization}). Deadline: ${o.deadline}`, `  ${o.apply_link}`);
      }
    }
    if (report.directions.length) {
      lines.push("", "*Directions that fit me*", ...report.directions.map((d) => `• ${d.name}`));
    }
    if (report.skills.length) {
      lines.push("", "*Skills to build next*", ...report.skills.map((k) => `• ${k.name}`));
    }
    lines.push("", `More opportunities: ${report.browse}`);
  } else {
    if (report.fields.length) {
      lines.push("", "*Fields that fit me*", ...report.fields.map((f) => `• ${f.name} (${f.strength})`));
    }
    if (report.schools.length) {
      lines.push("", "*Where I could study*");
      for (const s of report.schools.slice(0, 5)) {
        lines.push(`• ${s.name}${s.programme ? `: ${s.programme}` : ""}`, `  ${s.url}`);
      }
    }
    if (report.careers.roles?.length) lines.push("", `*Where it can lead*: ${report.careers.roles.join(", ")}`);
  }
  const tail = [
    "",
    `📢 Follow Student Companion AI on WhatsApp for new scholarships and opportunities: ${WHATSAPP_CHANNEL}`,
    `See my options again: ${PATHFINDER}`,
  ];
  let body = lines.join("\n");
  const room = MAX - tail.join("\n").length;
  if (body.length > room) body = body.slice(0, room - 1).replace(/\n[^\n]*$/, "") + "\n…";
  return [body, ...tail].join("\n");
}

export function whatsAppLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
