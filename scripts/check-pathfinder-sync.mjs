/**
 * Verifies the server's answer allowlist (api/_shared.ts) still matches the
 * questions the page renders (src/pathfinder/questions.ts).
 *
 * The API deliberately keeps its own copy — it validates untrusted public
 * input and a Vercel function can't import out of src/ anyway. The risk that
 * creates is silent drift: reword an option on the page and the server starts
 * rejecting real students' answers as invalid, with no error to notice.
 *
 * This fails the build instead.
 */
import { readFileSync } from "fs";

function extractOptions(source) {
  const out = {};
  // Each question block: key, then its options array.
  for (const m of source.matchAll(/key:\s*"(\w+)"[\s\S]*?options:\s*\[([\s\S]*?)\]/g)) {
    const [, key, body] = m;
    out[key] = [...body.matchAll(/"([^"]*)"/g)].map((o) => o[1]);
  }
  return out;
}

const page = extractOptions(readFileSync("src/pathfinder/questions.ts", "utf8"));
const api = extractOptions(readFileSync("api/_shared.ts", "utf8"));

const problems = [];
const keys = new Set([...Object.keys(page), ...Object.keys(api)]);

if (keys.size === 0) {
  problems.push("Parsed no questions from either file — the check itself is broken.");
}

for (const key of keys) {
  const a = page[key];
  const b = api[key];
  if (!a) problems.push(`"${key}" exists in api/_shared.ts but not in the page's questions.`);
  else if (!b) problems.push(`"${key}" exists in the page's questions but not in api/_shared.ts.`);
  else if (a.length !== b.length || a.some((v, i) => v !== b[i])) {
    problems.push(
      `"${key}" options differ.\n    page: ${JSON.stringify(a)}\n    api:  ${JSON.stringify(b)}`
    );
  }
}

if (problems.length) {
  console.error("Pathfinder question sets are out of sync:\n");
  for (const p of problems) console.error("  - " + p);
  console.error(
    "\nThe server validates answers against its own list, so a mismatch makes it\n" +
      "reject real students' answers. Update api/_shared.ts to match.\n"
  );
  process.exit(1);
}

console.log(`Pathfinder question sets are in sync (${keys.size} questions).`);
