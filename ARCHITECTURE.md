# Student Companion AI — Architecture

A technical brief on how the platform works, how tenant isolation is
enforced, and how a new university actually gets onboarded.

---

## The pitch

Student Companion AI is a multi-tenant AI assistant platform: one product,
many universities, each with its own isolated knowledge base and its own
admin team. A student signs in with their university email; the platform
resolves which organization they belong to from the verified domain and
answers every question from *that university's own* handbook, policies,
and records — never a generic answer from the open web, and never another
university's data.

---

## How a question becomes an answer

A student asks: *"When is the add/drop deadline for this term?"*

1. **Frontend** (this repository — React + TypeScript + Vite, installable
   PWA, deployed on Vercel) sends the question to the backend, authenticated
   with the student's Firebase ID token.
2. **Backend** (FastAPI, deployed on a Hugging Face Space) verifies the
   token server-side and resolves the student's organization.
3. The backend runs a vector search against **that organization's own
   ChromaDB collection** — every organization is retrieval-isolated; a
   query for University A can never surface University B's documents.
4. The most relevant retrieved passages are stitched into a grounded
   system prompt, along with an explicit instruction: answer from the
   provided context, or say "I don't know — here's where to look" rather
   than invent an answer.
5. The prompt goes to the LLM. The answer streams back to the student,
   grounded in their own institution's material.

---

## Multi-tenancy: how isolation is actually enforced

Tenant isolation isn't a UI filter — it's enforced at every layer a query
touches:

```
                    ┌─────────────────────────────┐
                    │   Firebase Auth (per user)   │
                    │  email domain → organization │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │   Aurora PostgreSQL (RDS)     │
                    │  organizations, admins,       │
                    │  curators — every row scoped  │
                    │  to an organization_id        │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │   ChromaDB — one collection   │
                    │   per organization, never     │
                    │   queried across tenants       │
                    └────────────────────────────────┘
```

- **Identity:** a student's organization is resolved from their verified
  email domain at signup — there is no manual "choose your university"
  step, and no client-side list of allowed domains to keep in sync.
- **Relational data:** every admin, curator, and organization record in
  Aurora carries an `organization_id`; access is scoped server-side, never
  filtered client-side.
- **Retrieval:** each organization gets its own ChromaDB collection,
  created on first use. A retrieval query is bound to the caller's
  organization at the engine level — there's no code path where one
  tenant's query can reach another tenant's collection.
- **Admin roles:** a **platform admin** can onboard new universities and
  see the roster of organizations. An **organization (school) admin** can
  manage their own university's staff, curators, and settings — but
  cannot see or affect any other university's data or admin roster.

---

## Onboarding a new university

Adding a university is a self-service admin action, not an engineering
task:

1. A platform admin adds the organization (name + allowed email domain(s))
   from the admin dashboard.
2. The platform admin grants that university's first admin account.
3. That admin signs in and can immediately add their own staff/curator
   accounts, upload source documents, and configure office hours — all
   from their own scoped dashboard.
4. The first student who signs up with a verified `@thatuniversity.edu`
   email is automatically routed into the right organization. No deploy,
   no CloudShell, no engineer in the loop.

---

## Why it won't hallucinate

The system prompt enforces a strict grounding contract: answer only from
retrieved context, and when the context doesn't contain what's needed, say
so plainly and point the student to where they can find it — rather than
inventing deadlines, policies, or figures that sound plausible but aren't
sourced from the university's own material.

---

## Tech stack at a glance

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Mobile | Installable PWA (manifest + service worker) + a native Expo app (`mobile/`) |
| Auth | Firebase Authentication (client) + Firebase Admin SDK (server-verified) |
| Frontend hosting | Vercel |
| Backend | Python, FastAPI |
| Backend hosting | Hugging Face Space |
| Relational data | Aurora PostgreSQL (AWS RDS Serverless v2), IAM-authenticated |
| Vector retrieval | ChromaDB — one isolated collection per organization |
| Admin dashboard | Next.js, deployed separately on Vercel |

---

## What's distinctive about this implementation

- **Real per-tenant isolation**, enforced at the identity, relational-data,
  and retrieval layers — not a single shared knowledge base with a
  filter bolted on top.
- **Domain-resolved identity.** No manual university picker; a verified
  email domain is the source of truth for which organization a student
  belongs to.
- **Genuinely self-service onboarding.** A new university can be added,
  staffed with its own admins and curators, and serving students within
  the same session — no engineering ticket required.
- **Grounded, honest answers.** The platform is built to say "I don't
  know, here's where to look" rather than produce a confident, unsourced
  guess.

---

## Open areas for future work

- Code-split the frontend bundle for faster first paint on slower mobile
  networks.
- Broaden the per-organization role model beyond the current admin/curator
  split.
- Expand admin-facing analytics around retrieval quality and cache
  effectiveness per organization.
