/**
 * Minimal diagnostic endpoint. No imports, no dependencies — if this fails,
 * the problem is how Vercel builds functions in this project, not our code.
 * Also reports which Pathfinder keys are visible to the runtime, without
 * revealing any values.
 */
export default function handler(req: any, res: any) {
  res.status(200).json({
    ok: true,
    runtime: process.version,
    keys: {
      tavily: Boolean(process.env.TAVILY_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY),
      resend: Boolean(process.env.RESEND_API_KEY),
    },
  });
}
