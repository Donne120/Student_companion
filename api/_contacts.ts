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
  // ── Rwanda ───────────────────────────────────────────────────────────────
  // Admissions offices, from each university's own website (November 2026):
  "ur.ac.rw": "admissions@ur.ac.rw",
  "auca.ac.rw": "admissions@auca.ac.rw",
  "ughe.org": "admissions@ughe.org",
  "kepler.org": "admissions@kepler.org",
  "africa.engineering.cmu.edu": "applyafrica@andrew.cmu.edu",
  "africa.cmu.edu": "applyafrica@andrew.cmu.edu",
  // General enquiries (no admissions address published):
  "rp.ac.rw": "info@rp.ac.rw",
  "alueducation.com": "info@alueducation.com",
  "uok.ac.rw": "info@uok.ac.rw",
  // From the SCA Rwanda HLI outreach database (institutional addresses of
  // the head of each institution; replace with an admissions address when
  // the institution gives one):
  "ulk.ac.rw": "vc@ulk.ac.rw",
  "cur.ac.rw": "catholic.university.rwanda@cur.ac.rw",
  "uck.ac.rw": "recteur@uck.ac.rw",
  "ines.ac.rw": "vc.ines@ines.ac.rw",
  "utab.ac.rw": "vc@utab.ac.rw",
  "utb.ac.rw": "vc@utb.ac.rw",
  "piass.ac.rw": "vice.chancellor@piass.ac.rw",
  "eaur.ac.rw": "vc@eaur.ac.rw",
  "ilpd.ac.rw": "aime.muyoboke@ilpd.ac.rw",
  "aims.ac.rw": "sam.yala@aims.ac.rw",
  "vatel.rw": "n.bamukunde@vatel.rw",
  "rica.rw": "ricavcoffice@rica.rw",
  "actrwanda.org": "nathan.chiroma@actrwanda.org",
  "eacc.ac.rw": "principal@eacc.ac.rw",
  "mipc.ac.rw": "mipcprincipal@mipc.ac.rw",
  "asg.ac": "info@asg.ac",

  // ── Other countries: admissions offices, from each university's own
  //    website (November 2026) ─────────────────────────────────────────────
  // Kenya
  "uonbi.ac.ke": "admissions@uonbi.ac.ke",
  "ku.ac.ke": "admissions@ku.ac.ke",
  "jkuat.ac.ke": "admissions@aa.jkuat.ac.ke",
  "mu.ac.ke": "admissions@mu.ac.ke",
  "egerton.ac.ke": "admissions@egerton.ac.ke",
  "strathmore.edu": "admissions@strathmore.edu",
  "usiu.ac.ke": "admit@usiu.ac.ke",
  // Uganda
  "kyu.ac.ug": "arkyu@kyu.ac.ug",
  "must.ac.ug": "admissions@must.ac.ug",
  "gu.ac.ug": "ar@gu.ac.ug",
  "ucu.ac.ug": "admissions@ucu.ac.ug",
  // Tanzania
  "udsm.ac.tz": "admission.undergraduate@udsm.ac.tz",
  "udom.ac.tz": "admission@udom.ac.tz",
  "sua.ac.tz": "admission@sua.ac.tz",
  "muhas.ac.tz": "admission@muhas.ac.tz",
  // Nigeria
  "unilag.edu.ng": "admissions@unilag.edu.ng",
  "covenantuniversity.edu.ng": "admissions@covenantuniversity.edu.ng",
  // Ghana
  "ug.edu.gh": "admissions@ug.edu.gh",
  "knust.edu.gh": "admissions@knust.edu.gh",
  "ucc.edu.gh": "admissions@ucc.edu.gh",
  "ashesi.edu.gh": "admissions@ashesi.edu.gh",
  // South Africa
  "uct.ac.za": "admissions@uct.ac.za",
  "wits.ac.za": "ask.wits@wits.ac.za",
  "sun.ac.za": "info@sun.ac.za",
  "uj.ac.za": "mylife@uj.ac.za",
  "ukzn.ac.za": "enquiries@ukzn.ac.za",
  "unisa.ac.za": "study-info@unisa.ac.za",
  // Zambia, Botswana, Namibia, Mauritius, Egypt
  "unza.zm": "customerrelations@unza.zm",
  "cbu.ac.zm": "admissions@cbu.ac.zm",
  "ub.bw": "admissions@ub.ac.bw",
  "unam.edu.na": "info@unam.na",
  "uom.ac.mu": "admission@uom.ac.mu",
  "aucegypt.edu": "enrolauc@aucegypt.edu",
};

/**
 * Student Companion AI's own referral links, by university website domain.
 * An enquiry sent to that university includes the link, and the student is
 * asked to register their interest through it, so the referral is credited
 * to Student Companion AI.
 */
export const REFERRAL_LINKS: Record<string, string> = {
  // ALU referral programme (Referral Factory), Student Companion AI's link.
  "alueducation.com": "https://african-leadership-university.referral-factory.com/uZ8lxWuT",
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

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Looks a university website up in a table keyed by domain, parent
 *  domains included (admissions.ur.ac.rw -> ur.ac.rw). */
function lookup(table: Record<string, string>, url: string): string | null {
  const host = hostOf(url);
  if (!host) return null;
  const parts = host.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const hit = table[parts.slice(i).join(".")];
    if (hit) return hit;
  }
  return null;
}

/** Student Companion AI's referral link for this university, if it has one. */
export function referralFor(url: string): string | null {
  const link = lookup(REFERRAL_LINKS, url);
  return link && /^https:\/\//.test(link) ? link : null;
}

/** The admissions address for a university website, if the team has one. */
export function contactFor(url: string): string | null {
  const email = lookup({ ...CONTACTS, ...fromEnv() }, url);
  return email && EMAIL.test(email) ? email : null;
}
