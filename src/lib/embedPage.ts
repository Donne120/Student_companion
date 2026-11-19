/**
 * The partner page the mini chat (/embed) was opened from. widget.js sends
 * it; every chat request then includes it, so the assistant knows that
 * "this" or "here" means that page. The backend decides which sites count
 * (page_context.py); this only carries it.
 */
export type EmbedPage = { url: string; title: string; context: string };

let current: EmbedPage | null = null;

export const getEmbedPage = (): EmbedPage | null => current;

/** Accept a page message only from the window that holds the mini chat,
 *  and only if the page's address really is on that window's site. */
export function acceptEmbedPage(event: MessageEvent): EmbedPage | null {
  if (event.source !== window.parent || window.parent === window) return null;
  const data = event.data as { type?: string; url?: unknown; title?: unknown; context?: unknown } | null;
  if (!data || data.type !== "sc-widget:page") return null;
  const url = String(data.url ?? "").slice(0, 500);
  try {
    if (new URL(url).origin !== event.origin) return null;
  } catch {
    return null;
  }
  current = {
    url,
    title: String(data.title ?? "").slice(0, 300),
    context: String(data.context ?? "").slice(0, 60),
  };
  return current;
}
