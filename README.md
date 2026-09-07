<div align="center">

<img src="public/logo-icon.png" alt="Student Companion AI" width="88" />

# Student Companion AI

**One AI companion, every university's own knowledge.**

Student Companion AI is a multi-tenant Progressive Web App that gives each
university its own AI assistant — grounded in *that university's* handbook,
policies, and records, not a generic answer from the open web. A student's
university is resolved automatically from their verified email domain; no
manual "pick your school" step, no cross-tenant data leakage, one login for
every campus on the platform.

[**Live app**](https://chat.studentcompanionai.rw) · [Report an issue](../../issues)

</div>

<br />

<img src="public/news-leadership.png" alt="A student speaking to a full lecture hall" width="100%" />

<br /><br />

## Why this exists

Every university has the same problem: policies, deadlines, and department
contacts live scattered across PDFs, portals, and word-of-mouth. Students
either dig for answers or wait for office hours. Student Companion AI closes
that gap — instant, sourced answers from the institution's own materials,
available at 2pm or 2am.

What makes it a platform rather than a single chatbot:

- **True multi-tenancy.** Each university gets its own isolated knowledge
  base, its own admin team, and its own curators — with no code changes and
  no engineering ticket required to onboard a new school.
- **Domain-based identity.** A student's university is resolved from their
  verified email domain (`@youruni.edu` → the right tenant, automatically).
- **Self-service administration.** University admins manage their own staff
  accounts, office-hours curators, and plan tier from a real dashboard — not
  a spreadsheet request to engineering.

<br />

## What it looks like

<table>
<tr>
<td width="50%">
<img src="public/news-tech.png" alt="Students collaborating around laptops" width="100%" />
<p align="center"><sub>Real collaboration, real questions — the product is built around how students actually work.</sub></p>
</td>
<td width="50%">
<img src="public/study.png" alt="Students studying together with course materials" width="100%" />
<p align="center"><sub>Grounded answers from a university's own handbook, not a guess from the open web.</sub></p>
</td>
</tr>
</table>

<br />

## Features

| Area | What it does |
| --- | --- |
| **Grounded AI chat** | Retrieval-augmented answers, cited from the student's own university's knowledge base — streamed, with automatic non-streaming fallback. |
| **Multi-tenant identity** | Firebase authentication with server-verified email-domain routing; each organization's data is isolated at the retrieval and database layer. |
| **Admin dashboard** | Organization admins manage their own staff, curators, and office-hours listings; platform admins manage the roster of onboarded universities and plan tiers. |
| **Office hours** | Real, bookable curator office-hours listings per organization — replacing what used to be a hidden, hardcoded widget. |
| **Opportunities & News** | Scholarships, internships, programs, and campus updates surfaced per organization. |
| **Document tools** | Upload and manage source documents that feed each organization's knowledge base. |
| **Analytics & feedback** | Admin-facing dashboards for usage, student feedback, and suggestions. |
| **Installable PWA** | Works like a native app on a phone — offline-friendly shell, home-screen install, push-ready. |

<br />

## How a question becomes an answer

```
Student asks a question
        │
        ▼
Frontend (this repo) — resolves the student's organization from their
        │              verified email domain, sends the question with auth
        ▼
Backend (FastAPI, Hugging Face Space) — embeds the question and runs a
        │              vector search against that organization's own
        │              ChromaDB collection (never another tenant's)
        ▼
Relevant, sourced context is retrieved and stitched into a grounded prompt
        │
        ▼
The model answers from that context — and says "I don't know, here's
        │              where to look" rather than inventing an answer
        ▼
Answer streams back to the student, cited
```

<br />

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| UI | Tailwind CSS + shadcn/ui (Radix primitives) |
| Auth | Firebase Authentication (client) + Firebase Admin (server-verified) |
| Backend | FastAPI on a Hugging Face Space (separate repository) |
| Retrieval | ChromaDB — one isolated collection per organization |
| Relational data | Aurora PostgreSQL (AWS RDS Serverless v2) |
| Hosting | Vercel |

<br />

## Getting started

### Prerequisites

- Node.js 18+
- A Firebase project (for auth)

### Install

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend base URL (Hugging Face Space or `localhost`) |
| `VITE_FIREBASE_API_KEY` | Firebase web API key (restrict by HTTP referrer) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

> **Note:** `.env` is gitignored and must never be committed. Admin identity
> is decided **server-side** by the backend, never in the client bundle —
> there is intentionally no admin email list here.

### Run

```bash
npm run dev        # start the dev server on http://localhost:3000
npm run build      # production build to dist/
npm run preview    # preview the production build
npm run lint       # lint the codebase
```

<br />

## Project structure

```
src/
├── components/     UI components (chat, admin, layout, shadcn/ui primitives)
├── config/         API base URL, auth headers, fetch helpers
├── contexts/       React context providers (auth, etc.)
├── hooks/          Custom React hooks
├── lib/            Firebase init and shared utilities
├── pages/          Route pages — landing, auth, chat, admin, office hours, …
├── services/       Backend API clients (aiService, opportunitiesService, …)
├── types/          Shared TypeScript types
└── utils/          Helpers

mobile/             React Native (Expo) companion app
```

<br />

## Deployment

The app is deployed on **Vercel** from this repository's `main` branch.

- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing is handled by the rewrite in [vercel.json](vercel.json).

Set `VITE_API_URL` and the `VITE_FIREBASE_*` variables in the Vercel
project's **Environment Variables** (Production scope). A push to `main`
triggers a production build automatically.

<br />

<div align="center">
<img src="public/news-sustainability.png" alt="A modern, sustainable university building" width="100%" />
</div>

<br />

## License

Proprietary. All rights reserved unless stated otherwise.
