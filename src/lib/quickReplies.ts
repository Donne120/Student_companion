/**
 * Quick replies: when the Companion asks a question with obvious answers it
 * ends its message with a line like
 *     Quick replies: Kigali | Mauritius | Not sure
 * (the backend prompts ask for exactly this). The line is taken out of the
 * text and shown as buttons the student can tap to answer.
 */
const LINE = /^\s*[*_]*quick\s+replies[*_]*\s*:?\s*[*_]*\s*(.*)$/i;
// While an answer streams in, hide a last line that is becoming "Quick replies:".
const PARTIAL = /^\s*[*_]*q(u(i(c(k(\s+(r(e(p(l(i(es?)?)?)?)?)?)?)?)?)?)?)?$/i;

export const MAX_QUICK_REPLIES = 4;

export function splitQuickReplies(text: string): { body: string; replies: string[] } {
  if (!text) return { body: text, replies: [] };
  const lines = text.replace(/\s+$/, "").split("\n");
  const last = lines[lines.length - 1] ?? "";
  const match = last.match(LINE);
  if (match) {
    const replies = match[1]
      .split("|")
      .map((r) => r.replace(/[*_`]/g, "").trim())
      .filter((r) => r.length > 0 && r.length <= 60)
      .slice(0, MAX_QUICK_REPLIES);
    return { body: lines.slice(0, -1).join("\n").replace(/\s+$/, ""), replies };
  }
  if (lines.length > 1 && last.trim().length > 0 && PARTIAL.test(last)) {
    return { body: lines.slice(0, -1).join("\n").replace(/\s+$/, ""), replies: [] };
  }
  return { body: text, replies: [] };
}

/** Send a quick reply as the student's next message. */
export const sendQuickReply = (reply: string) => {
  window.dispatchEvent(new CustomEvent("companion:send", { detail: reply }));
};
