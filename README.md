# ALU Student Companion

A mobile-first, AI-powered peer assistant for African Leadership University (ALU)
students. It answers questions about academics, campus life, policies, and
opportunities in a warm, peer-companion voice — and when it doesn't know, it says
so and points to where to look, instead of inventing an answer.

This repository is the **frontend**: an installable Progressive Web App built with
React, TypeScript, and Vite, deployed on Vercel. It talks to a separate
Retrieval-Augmented Generation (RAG) backend (FastAPI on a Hugging Face Space)
that grounds every answer in ALU's official knowledge base.

---

## Features

- **Grounded AI chat** — answers are retrieved from ALU's knowledge base and
  cited inline, not hallucinated.
- **Streaming responses** with automatic non-streaming fallback.
- **Firebase authentication** — email/password sign-in, with an admin area gated
  server-side.
- **Opportunities feed** — scholarships, internships, and programs.
- **News** and **document** sections.
- **Profile & settings**, including an admin console for knowledge-base status.
- **Installable PWA** — works like a native app on a phone.

---

## Tech stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| Framework    | React 18 + TypeScript                                   |
| Build tool   | Vite 5                                                  |
| UI           | Tailwind CSS + shadcn/ui (Radix primitives)             |
| Auth         | Firebase Authentication                                 |
| Backend      | FastAPI on a Hugging Face Space (separate repo)         |
| AI           | Anthropic Claude API, RAG over ChromaDB                 |
| Knowledge    | Google Sheet → Apps Script → ChromaDB (auto-synced)     |
| Hosting      | Vercel                                                  |

---

## How it works

1. The frontend sends a student's question to the backend.
2. The backend embeds the question (`all-MiniLM-L6-v2`) and runs a vector search
   against **ChromaDB**, returning the most semantically relevant entries from
   ALU's knowledge base.
3. Those entries are stitched into a carefully engineered system prompt and sent
   to the **Claude API**.
4. Claude reasons over the retrieved context and answers in a peer voice, citing
   official ALU URLs inline.
5. The answer streams back to the student's device.

Knowledge is maintained by staff in a single **Google Sheet** — no code, no PRs.
An Apps Script publishes the Sheet as JSON, and the backend polls it, re-embeds
changed rows, and updates ChromaDB within minutes. See
[ARCHITECTURE.md](ARCHITECTURE.md) for the full picture.

---

## Getting started

### Prerequisites

- Node.js 18+ (or [Bun](https://bun.sh))
- A Firebase project (for auth)

### Install

```bash
npm install
# or
bun install
```

### Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable                            | Description                                              |
| ----------------------------------- | -------------------------------------------------------- |
| `VITE_API_URL`                      | Backend base URL (Hugging Face Space or `localhost`)     |
| `VITE_FIREBASE_API_KEY`             | Firebase web API key (restrict by HTTP referrer)         |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                                     |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID                                      |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket                                  |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID                             |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID                                          |

> **Note:** `.env` is gitignored and must never be committed. Admin identity is
> decided **server-side** by the backend (`ADMIN_EMAILS` secret), never in the
> client bundle — there is intentionally no admin email list here.

### Run

```bash
npm run dev        # start the dev server on http://localhost:3000
npm run build      # production build to dist/
npm run preview    # preview the production build
npm run lint       # lint the codebase
```

---

## Project structure

```
src/
├── components/     UI components (chat, layout, shadcn/ui primitives)
├── config/         API base URL, auth headers, fetch helpers
├── contexts/       React context providers (auth, etc.)
├── hooks/          Custom React hooks
├── lib/            Firebase init and shared utilities
├── pages/          Route pages (Index, Login, Opportunities, News, admin, …)
├── services/       Backend API clients (aiService, opportunitiesService, …)
├── types/          Shared TypeScript types
└── utils/          Helpers
```

---

## Deployment

The app is deployed on **Vercel** from this repository's `main` branch.

- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing is handled by the rewrite in [vercel.json](vercel.json).

Set `VITE_API_URL` and the `VITE_FIREBASE_*` variables in the Vercel project's
**Environment Variables** (Production scope). The backend URL must point at the
live Hugging Face Space; the production default lives in
[src/config/api.ts](src/config/api.ts).

A push to `main` triggers a production build automatically.

---

## License

Internal project for African Leadership University. All rights reserved unless
stated otherwise.
