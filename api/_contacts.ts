/**
 * Admissions contacts that Pathfinder may send a student's enquiry to.
 *
 * Only addresses the Student Companion team has confirmed belong to the
 * university's admissions office go here: a wrong address would hand a
 * student's name, email and phone to a stranger. Each key is the
 * university's website domain as it appears in api/_directory.ts (without
 * "www."), so a suggestion in the report is matched by its link.
 *
 * Two places, both optional:
 *   1. CONTACTS below, in the code.
 *   2. The UNIVERSITY_CONTACTS environment variable in Vercel, as JSON, e.g.
 *        {"alueducation.com": "admissions@example.org", "ur.ac.rw": "..."}
 *      so the team can add or change one without a code change. It wins
 *      over CONTACTS for the same domain.
 *
 * A university with no contact is still suggested; the student just can't
 * send their enquiry to it from Pathfinder. The underscore keeps Vercel from
 * treating this file as an API route.
 */

export const CONTACTS: Record<string, string> = {
  // "alueducation.com": "<admissions address, confirmed with ALU>",
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function fromEnv(): Record<string, string> {
  const raw = process.env.UNIVERSITY_CONTACTS;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, v]) => typeof v === "string" && EMAIL.test(v.trim()))
        .map(([k, v]) => [k.trim().toLowerCase().replace(/^www\./, ""), (v as string).trim()])
    );
  } catch {
    console.error("[pathfinder/contacts] UNIVERSITY_CONTACTS is not valid JSON");
    return {};
  }
}

/** The admissions address for a university website, if the team has one. */
export function contactFor(url: string): string | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  const all = { ...CONTACTS, ...fromEnv() };
  // admissions.ur.ac.rw -> ur.ac.rw: a page on a subdomain still belongs to
  // the same university.
  const parts = host.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const email = all[parts.slice(i).join(".")];
    if (email && EMAIL.test(email)) return email;
  }
  return null;
}
