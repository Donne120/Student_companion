/**
 * Minimal diagnostic endpoint. No imports, no dependencies — if this fails,
 * the problem is how Vercel builds functions in this project, not our code.
 * Also reports which Pathfinder keys are visible to the runtime, without
 * revealing any values.
 */
export default async function handler(req: any, res: any) {
  const out: Record<string, unknown> = {
    ok: true,
    runtime: process.version,
    keys: {
      tavily: Boolean(process.env.TAVILY_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY),
      resend: Boolean(process.env.RESEND_API_KEY),
    },
  };

  // Report which chat models this Groq key can actually use. A hardcoded
  // model name 404'd in production, so this makes the real list visible
  // rather than guessed. Never exposes the key itself.
  const key = process.env.GROQ_API_KEY;
  if (key) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!r.ok) {
        out.groqModels = `error ${r.status}`;
      } else {
        const data = (await r.json()) as { data?: Array<{ id?: string }> };
        out.groqModels = (data.data ?? [])
          .map((m) => m.id)
          .filter((id): id is string => Boolean(id))
          .sort();
      }
    } catch (e) {
      out.groqModels = e instanceof Error ? e.message : "lookup failed";
    }
  }

  res.status(200).json(out);
}
