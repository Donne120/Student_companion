# ALU Student Companion — Architecture Brief

A one-page explanation of how the Student Companion works, what makes it
different from a generic chatbot, and how it stays cheap to run.

---

## The 30-second pitch

The Student Companion is a mobile-first, AI-powered peer assistant for ALU
students. It answers questions about academics, campus life, policies, and
opportunities in a Swaniker-flavoured peer-companion voice. It will tell a
student "I don't know — here's where to look" rather than invent an answer.
Non-engineers maintain its knowledge through a single Google Sheet, and the
bot updates itself.

---

## How a question becomes an answer

A student asks: *"I'm stressed, where can I get help?"*

1. **Frontend** (React + TypeScript + Vite, installable PWA, deployed on
   Vercel) sends the question to the backend.
2. **Backend** (Dockerised FastAPI service, deployed on a Hugging Face Space)
   embeds the question with `all-MiniLM-L6-v2` and runs a vector search
   against **ChromaDB**.
3. ChromaDB returns the top-K most semantically similar entries from the
   ALU knowledge base — likely the Wellness Center row, even though the
   student never typed "wellness."
4. Those entries are formatted as `[Source N | title | department | url]`
   blocks and stitched into a carefully engineered system prompt.
5. The prompt is sent to the **Anthropic Claude API**.
6. Claude reasons over the retrieved context and answers in a peer voice,
   citing the official ALU URL inline.
7. The answer streams back to the student's phone.

---

## How knowledge gets in

The ALU knowledge base is a **Google Sheet** that staff edit directly — no
code, no PRs, no engineer in the loop.

```
   Google Sheet  ──(Apps Script publishes JSON)──>  Hugging Face Space
                                                          │
                                              sheet_sync.py polls
                                                          │
                                                          ▼
                                           ChromaDB vector index
                                                          │
                                              embedded once, searched
                                              by every student query
```

- The Sheet is the **source of truth**.
- An Apps Script (`backend_hf/sheet_integration/apps_script/Code.gs`) publishes
  the whole Sheet as versioned JSON at a URL.
- On boot and on a poll loop, `sheet_sync.py` downloads the JSON, embeds each
  row, and upserts it into ChromaDB. Entries are tagged `origin=sheet` so
  deletions in the Sheet remove the corresponding vectors.
- This means a staff member can edit a row at 9:00 a.m. and the bot reflects
  the new answer minutes later. No deploy. No engineer.

---

## How costs stay low

Two design choices keep this affordable:

### 1. Prompt caching (Anthropic ephemeral cache)

The system prompt has two cache blocks (`claude_engine.py`):

- **Block 1** — the long instruction prompt (Swaniker voice, anti-hallucination
  rules, formatting). Almost never changes. Stays in cache for the 5-minute
  window. Every conversation reads it at **1/10th the price** ($0.30/M tokens
  vs $3/M).
- **Block 2** — the retrieved ALU context. Changes per question, but
  overlapping retrievals (many students ask similar questions about
  admissions, deadlines, wellness) hit the cache.

Token usage is logged on every call (`input_tokens`, `output_tokens`,
`cache_read_input_tokens`, `cache_creation_input_tokens`) so cache
effectiveness is auditable in production.

### 2. The expensive parts run cheap or free

| Layer            | Service              | Cost             |
| ---------------- | -------------------- | ---------------- |
| Frontend hosting | Vercel               | Free tier        |
| Backend hosting  | Hugging Face Space   | Free tier        |
| Knowledge store  | Google Sheets        | Free             |
| Vector index     | ChromaDB (on-disk)   | Free             |
| Embedding model  | sentence-transformers (local) | Free — runs in the HF Space |
| LLM              | Anthropic Claude API | Pay per token, with prompt caching |

The only metered cost is the Claude API, and prompt caching cuts the
dominant cost (the long system prompt) by 10x.

---

## Why it won't hallucinate

The system prompt contains an explicit anti-hallucination contract:

> NEVER invent course codes, credit hours, module names, or curriculum
> structures. NEVER invent tuition amounts, fees, or scholarship dollar
> values. NEVER invent faculty names, titles, or biographies. NEVER invent
> specific deadlines, term dates, or examination schedules. When the
> context doesn't have what's needed, say so plainly and point to the
> official source.

The prompt also defines three response cases:

- **Case A:** context fully answers the question → answer + cite the URL.
- **Case B:** context doesn't answer but points to where the answer lives →
  lead with the link, not the apology.
- **Case C:** nothing relevant in context → say so honestly and route to
  the right ALU team (Registry, Student Life, Finance, Wellness).

This is the difference between a useful peer assistant and a confident liar.

---

## Voice engineering

The bot's voice is deliberately patterned on Fred Swaniker:

- Mission-driven framing for big-picture questions ("Africa's future," "our
  generation," "leadership and ownership").
- Conversational openers ("Look,", "Here's the thing,").
- Storytelling — real examples from Rwanda, Singapore, M-Pesa.
- Direct, gently provocative, ends with a call to action.
- **Calibrated by question type:**
  - simple lookup → just answer plainly
  - big-picture → full Swaniker mode
  - sensitive (mental health, harassment, finances) → drop the persona,
    be human, route to the right support

The voice is the *delivery*. The *content* must be ALU-accurate from the
retrieved context. Voice never overrides truth.

---

## Tech stack at a glance

| Layer            | Tech                                                    |
| ---------------- | ------------------------------------------------------- |
| Frontend         | React 18, TypeScript, Vite, Tailwind, shadcn/ui         |
| Mobile           | Installable PWA (manifest + service worker)             |
| Auth             | Firebase Auth (Google + Email/Password)                 |
| Hosting (FE)     | Vercel                                                  |
| Backend          | Python, FastAPI, Docker                                 |
| Hosting (BE)     | Hugging Face Space                                      |
| Embedding model  | sentence-transformers `all-MiniLM-L6-v2`                |
| Vector DB        | ChromaDB (persistent, on-disk)                          |
| Knowledge CMS    | Google Sheets + Apps Script publisher                   |
| LLM              | Anthropic Claude (Sonnet)                               |
| Cost optimisation| Anthropic prompt caching (ephemeral, two-block)         |
| Workflow         | Bun, ESLint, GitHub                                     |

---

## What is and isn't novel here

This is honest framing — important for talking to technical audiences.

**Not novel** (these are well-known patterns; we use them well):

- RAG over a vector store (paper: Lewis et al., Facebook AI, 2020)
- sentence-transformers + ChromaDB starter stack
- Google Sheets as a no-code CMS
- Anthropic prompt caching (shipped publicly Aug 2024)

**What is distinctive about this implementation:**

- **Domain specialisation done right.** Most "AI chatbot for X" projects
  end up as a thin GPT wrapper that hallucinates. This one has a real
  grounded RAG pipeline with an explicit anti-hallucination contract.
- **No-code authoring layer.** A staff member can update the bot's
  knowledge by editing a Google Sheet. No engineer in the loop.
- **Voice engineering as a feature.** The Swaniker persona + tone
  calibration by question type isn't just a prompt — it's a design choice
  that gives the product a distinctive feel.
- **Cost-aware architecture.** Two-block prompt caching means the
  dominant cost is amortised across users and queries.
- **Mobile-first delivery.** Installable PWA, bottom-tab navigation, real
  African student photography. Most university chatbots are dashboards.
- **A repeatable blueprint.** The architecture is generic — swap the
  Sheet, swap the system prompt's voice, and the same stack serves any
  African university. That's the deployment story.

---

## Open questions / next work

- Bring `sendPasswordResetEmail` into the auth flow so non-Google users
  can recover.
- Add a "Forgot password?" link on the Login page.
- Add an admin view of cache hit rate over time (data is already logged).
- Code-split the frontend bundle (currently 1.95 MB pre-gzip) for faster
  first paint on slow Rwandan mobile networks.
- Move from in-memory rate-limiting to a shared store if traffic grows.

---

*Last updated for the May 2026 academic showcase.*
