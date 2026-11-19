/**
 * Where to go after signing in. Normally the chat; inside the mini chat
 * (/embed, shown on partner websites) back to the mini chat, so the person
 * never lands on the full app inside a small window.
 */
export function afterAuthPath(): string {
  try {
    const saved = localStorage.getItem("redirectAfterAuth");
    if (saved && saved.startsWith("/embed")) {
      localStorage.removeItem("redirectAfterAuth");
      return saved;
    }
  } catch {
    /* storage blocked: fall through */
  }
  return "/chat";
}

/** True inside the mini chat window on a partner website. */
export const IN_FRAME: boolean = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();
