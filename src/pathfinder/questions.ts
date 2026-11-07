/**
 * Pathfinder — the question set and shared types.
 *
 * Pathfinder is deliberately ISOLATED from the rest of Student Companion AI:
 * no auth, no organization scoping, no curators, no ChromaDB. It is a free,
 * public tool for high-school leavers who have no account and never will.
 * The only thing it shares with the platform is the brand.
 *
 * The question set is fixed and closed-choice on purpose. A blank "how can I
 * help?" box asks an anxious 18-year-old to already know the answer; a short
 * ordered sequence they can complete produces usable input instead. It also
 * means no free-text from the public reaches the model, which removes a whole
 * class of prompt-injection and abuse risk.
 */

/** "select": one choice from a long list, shown as a dropdown. */
export type QuestionType = "choice" | "multi" | "select";

export interface Question {
  key: string;
  /** Short label for the progress rail. */
  label: string;
  prompt: string;
  /** Shown to the student — being open about why we ask builds trust. */
  why: string;
  type: QuestionType;
  /** Only meaningful for `multi`. */
  max?: number;
  options: string[];
}

export const QUESTIONS: Question[] = [
  {
    key: "country",
    label: "Where you are",
    prompt: "Where are you finishing high school?",
    why: "This decides which national system, entry rules and scholarships actually apply to you.",
    type: "select",
    options: [
      "Rwanda",
      "Kenya",
      "Uganda",
      "Tanzania",
      "Burundi",
      "DR Congo",
      "Ethiopia",
      "South Sudan",
      "Nigeria",
      "Ghana",
      "Senegal",
      "Côte d'Ivoire",
      "Cameroon",
      "Sierra Leone",
      "Liberia",
      "The Gambia",
      "South Africa",
      "Zambia",
      "Zimbabwe",
      "Malawi",
      "Botswana",
      "Namibia",
      "Mozambique",
      "Mauritius",
      "Egypt",
      "Morocco",
      "Tunisia",
      "Somewhere else",
    ],
  },
  {
    key: "track",
    label: "What you studied",
    prompt: "What did you study for your final exams?",
    why: "Your subjects decide which programmes you are already eligible for. Pick the closest match for your country's system.",
    type: "choice",
    options: [
      "Sciences with Maths & Physics (e.g. MPC, PCM)",
      "Sciences with Biology & Chemistry (e.g. PCB, MCB)",
      "Maths with Economics or Business (e.g. MEG, Commerce)",
      "Humanities & social sciences (e.g. HEG, History, Geography)",
      "Languages & literature",
      "Arts, music or design",
      "TVET or technical school",
      "Something else",
    ],
  },
  {
    key: "strengths",
    label: "Where you do well",
    prompt: "Which of these do you genuinely do well in?",
    why: "What you are actually good at predicts whether you will finish a course better than grades alone.",
    type: "multi",
    max: 3,
    options: [
      "Solving maths problems",
      "Writing and explaining",
      "Building or fixing things",
      "Persuading and organising people",
      "Caring for people",
      "Drawing, design or music",
      "Working with computers",
      "Experiments and lab work",
    ],
  },
  {
    key: "interests",
    label: "What pulls you",
    prompt: "What would you happily spend a free Saturday doing?",
    why: "Asking about interest without the word “career” surfaces motivation that a subject list hides.",
    type: "multi",
    max: 3,
    options: [
      "Taking apart a device to see how it works",
      "Helping a neighbour who is unwell",
      "Running a small business or side hustle",
      "Coding or making something on a computer",
      "Farming, animals or the environment",
      "Filming, editing, telling a story",
      "Debating an issue that matters",
      "Teaching a younger student",
    ],
  },
  {
    key: "constraint",
    label: "What's realistic",
    prompt: "What matters most in your decision right now?",
    why: "Advice that ignores money or distance is useless. We would rather ask plainly than guess.",
    type: "choice",
    options: [
      "I need a scholarship or very low fees",
      "I need to stay close to home",
      "I want to study abroad if I can",
      "I want the fastest route to earning",
      "Cost is not my main worry",
    ],
  },
  {
    key: "horizon",
    label: "How far ahead",
    prompt: "When do you want to start?",
    why: "This decides whether we show open intakes now, or next-cycle preparation and bridging options.",
    type: "choice",
    options: ["This coming intake", "Next year", "I'm still deciding — just exploring"],
  },
];

/**
 * Key for the optional free-text note.
 *
 * Deliberately separate from QUESTIONS: those are a closed allowlist, and
 * keeping this apart means the strict validation of the fixed answers is
 * unchanged. This one field is length-capped and stripped server-side, and
 * the model is told to treat it as information about the student, never as
 * instructions.
 */
export const NOTE_KEY = "note";
export const NOTE_MAX = 400;

/** A completed answer set. `multi` questions hold an array. */
export type Answers = Record<string, string | string[]>;

// ── The shape the API returns ────────────────────────────────────────────────

export interface FieldSuggestion {
  name: string;
  /** "Strong match" | "Good match" | "Worth exploring" */
  strength: string;
  reason: string;
  tags: string[];
}

export interface SchoolSuggestion {
  name: string;
  location: string;
  kind: string;
  programme: string;
  detail: string;
  /** A real, clickable URL from live search — never invented. */
  url: string;
  /** The student can send their enquiry to this university (the server
   *  has a confirmed admissions address for it). */
  contactable?: boolean;
}

export interface CareerOutlook {
  summary: string;
  roles: string[];
}

/** A link the server adds (never the model): accreditation body or
 *  national application portal for the student's country. */
export interface VerifyLink {
  label: string;
  name: string;
  url: string;
}

export interface ScholarshipLink {
  name: string;
  detail: string;
  url: string;
}

export interface PathfinderReport {
  headline: string;
  summary: string;
  fields: FieldSuggestion[];
  schools: SchoolSuggestion[];
  careers: CareerOutlook;
  verify?: VerifyLink[];
  scholarships?: ScholarshipLink[];
}

/**
 * Turns the answer set into a compact, human-readable brief. Used both for the
 * search query and as the model's input, so what the student answered and what
 * the model reasons over can never drift apart.
 */
export function summariseAnswers(answers: Answers): string {
  return QUESTIONS.map((q) => {
    const v = answers[q.key];
    const text = Array.isArray(v) ? v.join(", ") : v;
    return text ? `${q.label}: ${text}` : null;
  })
    .filter(Boolean)
    .join("\n");
}
