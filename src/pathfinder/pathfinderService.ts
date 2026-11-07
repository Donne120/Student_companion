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
};
