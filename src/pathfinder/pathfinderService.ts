/**
 * Client for the two Pathfinder endpoints.
 *
 * These are Vercel serverless functions in this same repo (see /api/pathfinder).
 * They are NOT part of backend_hf and send no auth header — Pathfinder is a
 * public tool. The functions exist purely because the search and model API
 * keys must never reach the browser: anything in a Vite bundle is public, and
 * scraped keys get abused and billed within days.
 */
import type { Answers, PathfinderReport } from "./questions";
import { API_URL } from "@/config/api";

const SOURCE_KEY = "pf_source";

/** Remember the campaign a visitor arrived from (?source=, ?utm_source= or
 *  ?ref=) for this visit, so a request sent later is credited to it. */
export function rememberSource(search: string = window.location.search): void {
  try {
    const p = new URLSearchParams(search);
    const src = p.get("source") || p.get("utm_source") || p.get("ref");
    if (src) sessionStorage.setItem(SOURCE_KEY, src.slice(0, 80));
  } catch {
    /* private mode: the request is credited to "direct" */
  }
}

function currentSource(): string | undefined {
  try {
    return sessionStorage.getItem(SOURCE_KEY) || undefined;
  } catch {
    return undefined;
  }
}

export interface TrackedLead {
  details: { name: string; email: string; phone?: string; message?: string };
  answers: Answers;
  report: PathfinderReport;
  /** Website links of the universities the student ticked. */
  chosen: string[];
  consentMarketing: boolean;
  /** The school, picked from the suggestions (with its id) or typed. */
  school?: { name: string; id?: string } | null;
}

/** One-click links the backend issues for a saved request: they go into the
 *  university emails ("We've contacted this student") and the student's
 *  follow-ups. */
export interface LeadLinks {
  followup_state?: string;
  stop?: string;
  universities?: Array<{ name: string; url: string | null; respond: string; outcome: string; apply: string | null }>;
}

export interface LeadDetails {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface LeadResult {
  ok: true;
  /** Universities the enquiry was emailed to. */
  sentTo?: string[];
  /** Universities the team will pass it on to by hand. */
  passedOn?: string[];
  /** Where to start an application so Student Companion AI's referral is
   *  credited (e.g. ALU). */
  referrals?: Array<{ name: string; url: string }>;
}

/** Thrown with a message safe to show a student. */
export class PathfinderError extends Error {}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new PathfinderError(
      "We couldn't reach the service. Check your connection and try again."
    );
  }

  if (res.status === 429) {
    throw new PathfinderError(
      "That's a lot of requests in a short time. Please wait a minute and try again."
    );
  }

  if (!res.ok) {
    // Surface the server's message when it wrote one for the student
    // (e.g. "not configured yet"), otherwise stay generic.
    let detail = "";
    try {
      detail = ((await res.json()) as { error?: string }).error || "";
    } catch {
      /* response wasn't JSON — fall through to the generic message */
    }
    throw new PathfinderError(
      detail || "Something went wrong on our side. Please try again shortly."
    );
  }

  return (await res.json()) as T;
}

/** A school suggested as the student types (see SchoolPicker). */
export interface SchoolSuggestion {
  id: string;
  name: string;
  district: string | null;
  province: string | null;
  sector: string | null;
  levels: string[];
  combinations: string[];
  listed: boolean;
}

export const pathfinderService = {
  /** Schools in `country` matching what the student has typed. Empty on any
   *  failure: the student can always type their school instead. */
  searchSchools: async (country: string, q: string, signal?: AbortSignal): Promise<SchoolSuggestion[]> => {
    try {
      const res = await fetch(
        `${API_URL}/api/schools/search?country=${encodeURIComponent(country)}&q=${encodeURIComponent(q)}`,
        { signal }
      );
      if (!res.ok) return [];
      return ((await res.json()) as { schools?: SchoolSuggestion[] }).schools ?? [];
    } catch {
      return [];
    }
  },

  getRecommendations: (answers: Answers) =>
    post<PathfinderReport>("/api/pathfinder/recommend", { answers }),

  /** `universities`: website links of the universities the student chose
   *  to send their enquiry to (only those marked `contactable`). */
  submitLead: (
    details: LeadDetails,
    answers: Answers,
    report?: PathfinderReport,
    universities: string[] = [],
    links?: LeadLinks | null
  ) => post<LeadResult>("/api/pathfinder/lead", { details, answers, report, universities, links: links ?? undefined }),

  /**
   * Save the request in Student Companion AI's records (the backend on AWS)
   * before it is emailed, and get back the one-click links that go into the
   * emails, so universities and the student can record what happened
   * without anyone typing it in. Best effort: if the backend is slow or
   * down, the request is still emailed, just without the links.
   */
  trackLead: async ({ details, answers, report, chosen, consentMarketing, school }: TrackedLead): Promise<LeadLinks | null> => {
    const universities = report.schools
      .filter((s) => chosen.includes(s.url))
      .filter((s, i, all) => all.findIndex((t) => t.url === s.url) === i)
      .map((s) => ({ name: s.name, url: s.url, delivery: "requested" }));
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(`${API_URL}/api/pathfinder/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name,
          email: details.email,
          phone: details.phone || null,
          message: details.message || null,
          answers,
          interests: report.fields.map((f) => f.name).slice(0, 10),
          universities,
          referral_alu: universities.some((u) => /alueducation\.com|alu\.edu/i.test(u.url)),
          source: currentSource(),
          consent_marketing: consentMarketing,
          school_name: school?.name || null,
          school_id: school?.id || null,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { links?: LeadLinks };
      return data.links ?? null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  },
};
