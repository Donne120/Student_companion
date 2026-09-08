/**
 * POST /api/pathfinder/recommend
 *
 * Takes a validated answer set, searches the live web for real university
 * programmes, and asks the model to turn both into a structured report.
 *
 * Isolated from the platform: no auth, no organization, no backend_hf.
 *
 * Required environment variables (set in Vercel):
 *   TAVILY_API_KEY  — tavily.com, free tier is enough to launch
 *   GROQ_API_KEY    — console.groq.com, free tier, no card required
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
// The .js extension is required: package.json sets "type": "module", so this
// runs as ESM on Vercel, and Node's ESM resolver does not add extensions the
// way CommonJS did. Without it the module fails to load and every request
// returns FUNCTION_INVOCATION_FAILED before the handler ever runs.
import { methodGuard, parseAnswers, rateLimit, summarise } from "../_shared.js";

// Groq's free tier runs this comfortably. The job here is summarising real
// search results into a fixed JSON shape, not open-ended reasoning, so a
// mid-size open model is a sound fit rather than a compromise.
const MODEL = "llama-3.3-70b-versatile";

/**
 * Bias search toward official institutional sources, away from blog spam.
 *
 * These are matched as domain suffixes by Tavily. The first attempt uses them;
 * if that returns nothing (a narrow filter easily can) the caller retries
 * without any restriction, so this improves quality without risking an empty
 * report.
 */
const PREFERRED_DOMAINS = [
  "ac.rw",
  "ur.ac.rw",
  "ines.ac.rw",
  "mineduc.gov.rw",
  "hec.gov.rw",
  "ac.ke",
  "ac.ug",
  "ac.tz",
];

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

async function search(
  query: string,
  key: string,
  restrictDomains: boolean
): Promise<TavilyResult[]> {
  // Tavily authenticates with a Bearer header. The older api_key body field
  // is deprecated and rejected on newer accounts.
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "advanced",
      max_results: 10,
      ...(restrictDomains ? { include_domains: PREFERRED_DOMAINS } : {}),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Tavily ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = (await res.json()) as { results?: TavilyResult[] };
  return data.results ?? [];
}

/** Retry once without the domain filter — a narrow filter can return nothing. */
async function searchWithFallback(query: string, key: string): Promise<TavilyResult[]> {
  const first = await search(query, key, true);
  if (first.length > 0) return first;
  return search(query, key, false).catch(() => []);
}

const SYSTEM =`You advise students in East Africa who are finishing secondary school and choosing what to study.

You will be given a student's profile and a set of real web search results about universities and programmes.

Rules you must follow:
- Recommend fields that genuinely follow from the student's subjects, strengths and interests. Do not flatter; if a field is a stretch, label it "Worth exploring" and say why.
- Only name universities and programmes that appear in the supplied search results. Never invent an institution, a programme name, or a URL.
- Copy each school's URL exactly from the search results. If you have no URL for a school, omit that school entirely.
- Never state fees, deadlines or exact entry cut-offs as fact — those change and being wrong about them harms the student. Refer them to the university's page instead.
- Respect the student's stated constraint (cost, location, speed to earning). Advice that ignores it is useless.
- Write plainly, to an 18-year-old, without jargon or hype. Be encouraging but honest.

Return ONLY valid JSON, no markdown fence, matching exactly:
{
  "headline": string,
  "summary": string,
  "fields": [{ "name": string, "strength": "Strong match" | "Good match" | "Worth exploring", "reason": string, "tags": string[] }],
  "schools": [{ "name": string, "location": string, "kind": string, "programme": string, "detail": string, "url": string }],
  "careers": { "summary": string, "roles": string[] }
}
Give 2-3 fields, 2-4 schools, and 3-6 career roles.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res)) return;

  // 5 reports per IP per 10 minutes — generous for a real student, a brake on scripts.
  if (!rateLimit(req, 5, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many requests. Please wait a minute." });
  }

  const tavilyKey = process.env.TAVILY_API_KEY;
  const modelKey = process.env.GROQ_API_KEY;
  if (!tavilyKey || !modelKey) {
    // Explicit rather than silently returning invented data.
    return res.status(503).json({
      error: "Pathfinder isn't switched on yet. Please check back shortly.",
    });
  }

  const answers = parseAnswers((req.body as { answers?: unknown })?.answers);
  if (!answers) return res.status(400).json({ error: "Please answer the questions again." });

  const profile = summarise(answers);
  const country = (answers.country as string) || "Rwanda";
  const track = (answers.track as string) || "";

  try {
    const results = await searchWithFallback(
      `universities in ${country} undergraduate degree programmes admission ${track}`,
      tavilyKey
    );

    if (results.length === 0) {
      return res.status(502).json({
        error: "We couldn't find current university information just now. Please try again shortly.",
      });
    }

    const sources = results
      .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content.slice(0, 900)}`)
      .join("\n\n");

    const ai = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${modelKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        temperature: 0.4,
        // Guarantees parseable output instead of hoping the model obeys the
        // "return only JSON" instruction.
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `STUDENT PROFILE\n${profile}\n\nSEARCH RESULTS\n${sources}`,
          },
        ],
      }),
    });

    if (!ai.ok) {
      const detail = await ai.text().catch(() => "");
      throw new Error(`Groq ${ai.status}: ${detail.slice(0, 300)}`);
    }

    const payload = (await ai.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = payload.choices?.[0]?.message?.content?.trim() ?? "";
    // Models occasionally wrap JSON in a fence despite instructions.
    const json = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    let report: unknown;
    try {
      report = JSON.parse(json);
    } catch {
      throw new Error("Model returned malformed JSON");
    }

    // Drop any school the model produced without a usable link, rather than
    // rendering a dead end for the student.
    const r = report as { schools?: Array<{ url?: string }> };
    if (Array.isArray(r.schools)) {
      r.schools = r.schools.filter((s) => typeof s.url === "string" && s.url.startsWith("http"));
    }

    return res.status(200).json(report);
  } catch (err) {
    console.error("[pathfinder/recommend]", err);
    // PATHFINDER_DEBUG surfaces the upstream failure (which API, which status)
    // in the response. Vercel's function logs are the proper place for this,
    // but this makes a failure diagnosable from a single curl. Unset it once
    // the integration is confirmed working.
    const body: Record<string, string> = {
      error: "We couldn't build your report just now. Please try again shortly.",
    };
    if (process.env.PATHFINDER_DEBUG === "1") {
      body.detail = err instanceof Error ? err.message : String(err);
    }
    return res.status(502).json(body);
  }
}
