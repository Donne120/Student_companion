// When an admin suspends an account (dashboard → Students → Suspend), every
// request to our API answers 403 with code "account_suspended". This watches
// for that answer on any request, signs the person out and takes them to the
// sign-in page, which explains what happened. Sign-in itself is also
// switched off, so they can't simply sign in again.
import { API_URL } from "@/config/api";

export const SUSPENDED_MESSAGE =
  "This account has been suspended. If you think this is a mistake, email privacy@studentcompanionai.rw.";
export const SUSPENDED_EVENT = "account-suspended";

let installed = false;

export function watchForSuspension() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await original(input, init);
    if (res.status === 403) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (API_URL && url.startsWith(API_URL)) {
        res
          .clone()
          .json()
          .then((body: { detail?: { code?: string } }) => {
            if (body?.detail?.code === "account_suspended") {
              window.dispatchEvent(new Event(SUSPENDED_EVENT));
            }
          })
          .catch(() => {});
      }
    }
    return res;
  };
}
