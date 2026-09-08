/**
 * Shared helpers for the Pathfinder serverless functions.
 *
 * These functions exist only to keep API keys off the client — a Vite bundle
 * is public, so a key shipped to the browser is a key that gets scraped and
 * billed to us. Nothing here touches backend_hf, auth, or organizations.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { QUESTIONS } from "../src/pathfinder/questions";

/**
 * In-memory per-IP rate limit.
 *
 * Deliberately simple. Serverless instances don't share memory, so this is a
 * best-effort brake on casual abuse of a free public endpoint, not a strict
 * guarantee — a determined attacker spread across instances can exceed it.
 * That's an accepted trade for launch; if abuse shows up, move this to a
 * shared store (Upstash/Redis) rather than making this map cleverer.
 */
const hits = new Map<string, number[]>();

export function rateLimit(req: VercelRequest, limit: number, windowMs: number): boolean {
  const fwd = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd || "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(ip, recent);
    return false;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound across a warm instance's life.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(key);
    }
  }
  return true;
}

/**
 * Validates the answer set against the known question list.
 *
 * Every question is closed-choice, so anything not in the declared options is
 * rejected outright. This is what keeps arbitrary public text from reaching
 * the model — it removes prompt injection as a concern rather than trying to
 * filter for it.
 */
export function parseAnswers(raw: unknown): Record<string, string | string[]> | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  const clean: Record<string, string | string[]> = {};

  for (const q of QUESTIONS) {
    const value = input[q.key];
    if (value == null) continue;

    if (q.type === "multi") {
      if (!Array.isArray(value)) return null;
      const picked = value.filter((v): v is string => typeof v === "string" && q.options.includes(v));
      if (picked.length !== value.length) return null;
      if (picked.length > (q.max ?? 3)) return null;
      if (picked.length) clean[q.key] = picked;
    } else {
      if (typeof value !== "string" || !q.options.includes(value)) return null;
      clean[q.key] = value;
    }
  }

  // Require a usable brief; a near-empty set produces a worthless report.
  return Object.keys(clean).length >= 4 ? clean : null;
}

export function summarise(answers: Record<string, string | string[]>): string {
  return QUESTIONS.map((q) => {
    const v = answers[q.key];
    const text = Array.isArray(v) ? v.join(", ") : v;
    return text ? `${q.label}: ${text}` : null;
  })
    .filter(Boolean)
    .join("\n");
}

export function methodGuard(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }
  return true;
}
