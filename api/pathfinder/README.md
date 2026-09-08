# Pathfinder — setup

Free, public course-and-university guidance for high-school leavers, at
`/pathfinder`. Deliberately **isolated** from the rest of Student Companion AI:
no login, no organizations, no curators, no ChromaDB, no `backend_hf`. The only
shared infrastructure is the Firebase project, and the leads collection is
closed to all client access.

Until the variables below are set, the tool loads and the questions work, but
submitting shows *"Pathfinder isn't switched on yet"* rather than inventing
recommendations.

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Required | What it's for |
| --- | --- | --- |
| `TAVILY_API_KEY` | yes | Live web search. Free tier at [tavily.com](https://tavily.com) is enough to launch. |
| `GROQ_API_KEY` | yes | Turns the search results into the report. Free tier at [console.groq.com](https://console.groq.com), no card required. |
| `RESEND_API_KEY` | yes, for the form | Sends each enquiry by email. Free tier at [resend.com](https://resend.com). |
| `LEAD_NOTIFY_EMAIL` | no | Where enquiries go. Defaults to `d.ngum@alustudent.com` — see the sender note below before changing it. |
| `LEAD_FROM_EMAIL` | no | Sender address. Defaults to Resend's shared `onboarding@resend.dev`; set this once you verify your own domain. |
| `FIREBASE_PROJECT_ID` | no | Enables storing leads as well as emailing them. |
| `FIREBASE_CLIENT_EMAIL` | no | Service-account email (Firebase console → Project settings → Service accounts). |
| `FIREBASE_PRIVATE_KEY` | no | Service-account private key. Paste it whole; `\n` escapes are handled. |

Set these as **Config**, not Secret, so they can be edited later. They are read
only on the server and never reach the browser.

If the Firebase variables are omitted, enquiries are still emailed — storage is
a safety net, not the delivery path.

All three have free tiers, so Pathfinder costs nothing to run at launch
volumes.

### Changing the model provider

`recommend.ts` calls Groq's OpenAI-compatible endpoint. Swapping to another
provider means changing the URL, the `MODEL` constant and the env var name —
the request and response shapes are the standard OpenAI ones, so most
providers are close to a drop-in.

## Sending from your own domain

Emails default to Resend's shared `onboarding@resend.dev` sender. It works with
no setup, but Resend restricts it hard: **it will only deliver to the email
address that owns the Resend account.** Sending anywhere else returns a 403:

> You can only send testing emails to your own email address. To send emails to
> other recipients, please verify a domain at resend.com/domains, and change the
> `from` address to an email using this domain.

That is why `LEAD_NOTIFY_EMAIL` defaults to the account owner's address rather
than a shared inbox.

To send to any address (and to stop landing in spam):

1. Verify a domain at [resend.com/domains](https://resend.com/domains) — this
   means adding DNS records at your registrar.
2. Set `LEAD_FROM_EMAIL` to an address on that domain, e.g.
   `Pathfinder <pathfinder@studentcompanionai.rw>`.
3. Set `LEAD_NOTIFY_EMAIL` to wherever you actually want enquiries.

No code change is needed for any of it.

## Deploying the Firestore rule

`firestore.rules` adds a `pathfinder_leads` rule that denies **all** client
access. Publish it from the Firebase console (Firestore → Rules) — the server
writes with the Admin SDK, which bypasses rules, so nothing breaks.

This lockdown is deliberate: submitters have no account, so there is no owner to
scope reads to, and the records hold a minor's name, email and phone number.
Read them in the Firebase console, never by loosening the rule.

## Protections already in place

- API keys server-side only — never in the client bundle.
- Per-IP rate limiting: 5 reports and 3 enquiries per 10 minutes.
- Every answer validated against the declared option list, so no free public
  text reaches the model.
- Search biased toward official `.ac.rw` / `.edu` / ministry domains.
- The model is instructed never to invent an institution or URL, and any
  school it returns without a valid link is dropped before display.
- Fees and deadlines are never stated as fact; students are sent to the
  university's own page.

The rate limiter is per serverless instance and therefore best-effort. If real
abuse appears, move it to a shared store (e.g. Upstash Redis) rather than
elaborating the in-memory map.
