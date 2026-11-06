/**
 * Inline source markers some models write into answers, e.g. "【Source 8】",
 * "[Source 3]", "(Sources 2, 5)" or "【4†source】". They mean nothing to a
 * student: the sources are listed, with their links, under every answer.
 * The backend tells every model not to write them; this removes any that
 * slip through, including in chats saved before that change.
 */
const MARKERS =
  /[ \t]*(?:【[^】\n]{0,40}】|\[(?:sources?|src)\s*[\d\s,&–-]*(?:and\s*\d+)?\](?!\()|\((?:sources?|src)\s*[\d\s,&–-]*(?:and\s*\d+)?\))/gi;

export function stripSourceMarkers(text: string): string {
  if (!text) return text;
  return text
    .replace(MARKERS, "")
    .replace(/[ \t]+([.,;:!?])/g, "$1"); // "challenges ." -> "challenges."
}
