// How an opportunity reads, shared with the career site.
//
// These rules mirror the listing on career.studentcompanionai.rw
// (sca-opportunities/script.js: dateBlock, shortLocation, shortEligibility,
// cleanSummary, detectMode), so an opportunity looks and reads the same in
// the chat's panel as on the career site. Both read the same Google Sheet,
// so new and edited opportunities already appear in both; when the
// listing's rules change there, change them here too.

export type DateBlock = {
  day: string;
  month: string;
  left: string;
  tone: "soon" | "closed" | "open" | "rolling";
  title: string;
};

const parseDeadline = (raw: string): Date | null => {
  if (/^(rolling|annual|verify)/i.test(raw)) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

/** The deadline as a calendar-style block: "17" / "Nov 2026" / "7 days left". */
export function dateBlock(raw?: string): DateBlock {
  const full = String(raw ?? "").trim();
  const d = full ? parseDeadline(full) : null;
  if (!d) {
    const word = /^rolling/i.test(full) ? "Rolling" : /^annual/i.test(full) ? "Annual" : "Open";
    return { day: word, month: "No fixed date", left: "", tone: "rolling", title: full };
  }
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  const month = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const title = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  if (days < 0) return { day: String(d.getDate()), month, left: "Closed", tone: "closed", title };
  if (days === 0) return { day: String(d.getDate()), month, left: "Closes today", tone: "soon", title };
  if (days <= 14)
    return { day: String(d.getDate()), month, left: `${days} day${days === 1 ? "" : "s"} left`, tone: "soon", title };
  return { day: String(d.getDate()), month, left: "", tone: "open", title };
}

/** "Remote (must be based in one of 11 countries)" -> "Remote". */
export const shortLocation = (loc?: string) =>
  String(loc ?? "").replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();

/** "Year 3 / Year 4 / Final Year" -> "Year 3, Year 4, Final Year";
 *  sentences and "Not specified" are left out (the summary covers them). */
export function shortEligibility(raw?: string) {
  const s = String(raw ?? "").trim();
  if (!s || /not specified|^any$|^n\/?a$/i.test(s)) return "";
  const parts = s.split(/\s*[/,;]\s*/).filter(Boolean);
  const joined = parts.join(", ");
  if (joined.length > 48 || parts.some((p) => p.split(" ").length > 3)) return "";
  return joined;
}

/** Summary without emoji or a repeated "DEADLINE 17 NOVEMBER — 11 days." lead-in. */
export const cleanSummary = (raw?: string) =>
  String(raw ?? "")
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]️?/gu, "")
    .replace(/^\s*(deadline|closes|closing)\b[^.]*\.\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

/** Onsite, Remote or Hybrid, from the remote column or the location. */
export function workMode(remote?: string, location?: string) {
  const r = String(remote ?? "").toLowerCase().trim();
  const loc = String(location ?? "").toLowerCase();
  if (r === "yes" || r === "true" || /remote|home-based|virtual|online/.test(loc)) {
    if (/hybrid|some remote|partial/.test(loc) || r === "some") return "Hybrid";
    return "Remote";
  }
  if (r === "some" || /hybrid/.test(loc)) return "Hybrid";
  return "Onsite";
}
