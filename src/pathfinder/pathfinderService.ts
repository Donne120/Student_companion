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
  result: { sentTo?: string[]; passedOn?: string[]; referrals?: Array<{ name: string; url: string }> };
  consentMarketing: boolean;
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

export const pathfinderService = {
  getRecommendations: (answers: Answers) =>
    post<PathfinderReport>("/api/pathfinder/recommend", { answers }),

  /** `universities`: website links of the universities the student chose
   *  to send their enquiry to (only those marked `contactable`). */
  submitLead: (details: LeadDetails, answers: Answers, report?: PathfinderReport, universities: string[] = []) =>
    post<LeadResult>("/api/pathfinder/lead", { details, answers, report, universities }),

  /**
   * Keep a copy of a sent request in Student Companion AI's records (the
   * backend on AWS), so the team can follow up, see which universities
   * responded and report on Pathfinder. Best effort: the student's request
   * has already been emailed, so a failure here never shows to them.
   */
  trackLead: async ({ details, answers, report, chosen, result, consentMarketing }: TrackedLead) => {
    const sent = new Set(result.sentTo ?? []);
    const passed = new Set(result.passedOn ?? []);
    const universities = report.schools
      .filter((s) => chosen.includes(s.url))
      .filter((s, i, all) => all.findIndex((t) => t.url === s.url) === i)
      .map((s) => ({
        name: s.name,
        url: s.url,
        delivery: sent.has(s.name) ? "emailed" : passed.has(s.name) ? "passed_on" : "requested",
      }));
    try {
      await fetch(`${API_URL}/api/pathfinder/leads`, {
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
          referral_alu: !!result.referrals?.length,
          source: currentSource(),
          consent_marketing: consentMarketing,
        }),
        keepalive: true,
      });
    } catch {
      /* best effort */
    }
  },
};
