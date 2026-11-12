/**
 * Pathfinder — the question sets and shared types.
 *
 * Pathfinder is deliberately ISOLATED from the rest of Student Companion AI:
 * no auth, no organization scoping, no curators, no ChromaDB. It is a free,
 * public tool for students who have no account and never will. The only
 * thing it shares with the platform is the brand.
 *
 * Two routes behind one first question ("Where are you right now?"):
 * - high school: finishing secondary school, choosing a course and
 *   university (HIGH_SCHOOL_QUESTIONS);
 * - undergraduate: at university or graduated in the last two years,
 *   looking for internships, jobs, scholarships, fellowships, funding or
 *   competitions (UNDERGRAD_QUESTIONS). Matches come from the SCA
 *   Opportunities Sheet through the backend, never from the model.
 *
 * The question set is fixed and closed-choice on purpose. A blank "how can I
 * help?" box asks an anxious 18-year-old to already know the answer; a short
 * ordered sequence they can complete produces usable input instead. It also
 * means no free-text from the public reaches the model, which removes a whole
 * class of prompt-injection and abuse risk.
 */

/** "select": one choice from a long list, shown as a dropdown.
 *  "school": the student's school, typed with suggestions (optional).
 *  "university": the same, for the student's university (optional). */
export type QuestionType = "choice" | "multi" | "select" | "school" | "university";

export type Stage = "high_school" | "undergraduate";

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

/** The first question: which route the student takes. */
export const STAGE_QUESTION: Question = {
  key: "stage",
  label: "Your stage",
  prompt: "Where are you right now?",
  why: "Pathfinder helps at both steps: choosing a university, and finding your first opportunities once you're there.",
  type: "choice",
  options: ["Finishing high school or secondary school", "At university", "Graduated in the last 2 years"],
};

/** The undergraduate route: at university, or graduated in the last 2 years. */
export function stageOf(answers: Answers): Stage {
  const s = answers.stage;
  return s === "At university" || s === "Graduated in the last 2 years" ? "undergraduate" : "high_school";
}

const COUNTRY: Question = {
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
};

export const HIGH_SCHOOL_QUESTIONS: Question[] = [
  COUNTRY,
  {
    key: "school",
    label: "Your school",
    prompt: "Which school are you at, or did you finish at?",
    why: "Start typing and pick your school, or type its full name if it isn't listed. It helps us understand where students come from. You can skip this.",
    type: "school",
    options: [],
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

export const UNDERGRAD_QUESTIONS: Question[] = [
  {
    ...COUNTRY,
    prompt: "Where are you studying, or where did you study?",
    why: "This decides which opportunities you are eligible for and which are close enough to be realistic.",
  },
  {
    key: "university",
    label: "Your university",
    prompt: "Which university are you at, or did you graduate from?",
    why: "Start typing and pick your university, or type its full name if it isn't listed. You can skip this.",
    type: "university",
    options: [],
  },
  {
    key: "field",
    label: "What you study",
    prompt: "What are you studying, or what did you study?",
    why: "Many opportunities are for particular fields. Pick the closest match.",
    type: "choice",
    options: [
      "Computing, IT or software",
      "Engineering",
      "Business, economics or finance",
      "Health sciences",
      "Agriculture or environment",
      "Law, social sciences or policy",
      "Education",
      "Arts, media or design",
      "Natural sciences or maths",
      "Something else",
    ],
  },
  {
    key: "year",
    label: "Your year",
    prompt: "Where are you in your studies?",
    why: "Internships, scholarships and jobs are often only open to certain years, so we only show what you can apply for.",
    type: "choice",
    options: [
      "1st year",
      "2nd year",
      "3rd year",
      "Final year",
      "Graduated less than a year ago",
      "Graduated 1–2 years ago",
    ],
  },
  {
    key: "goals",
    label: "What you're looking for",
    prompt: "What are you looking for next?",
    why: "Pick up to two. We'll put these first.",
    type: "multi",
    max: 2,
    options: [
      "An internship",
      "My first job",
      "A scholarship or master's",
      "A fellowship or leadership programme",
      "Funding to start a business",
      "Competitions or hackathons",
    ],
  },
  {
    key: "skills",
    label: "Where you do well",
    prompt: "Which of these do you genuinely do well?",
    why: "What you're good at matters as much as your degree when choosing where to apply.",
    type: "multi",
    max: 3,
    options: [
      "Analysing data",
      "Writing and communicating",
      "Building software",
      "Leading and organising people",
      "Research",
      "Design and creative work",
      "Selling and negotiating",
      "Teaching or caring for people",
    ],
  },
  {
    key: "needs",
    label: "What's realistic",
    prompt: "What matters most right now?",
    why: "An opportunity you can't afford to take, or can't fit around your life, isn't really an opportunity.",
    type: "choice",
    options: [
      "I need paid work or a stipend",
      "Remote or close to home",
      "Open to moving abroad",
      "It must fit around my classes",
      "None of these",
    ],
  },
  {
    key: "when",
    label: "How soon",
    prompt: "When do you want to start?",
    why: "This decides whether we put deadlines coming up soon first.",
    type: "choice",
    options: ["In the next 3 months", "This year", "Just exploring"],
  },
];

/** The questions for the route the student chose (the stage question first). */
export function questionsFor(answers: Answers): Question[] {
  return [
    STAGE_QUESTION,
    ...(stageOf(answers) === "undergraduate"
      ? UNDERGRAD_QUESTIONS
      : HIGH_SCHOOL_QUESTIONS.map((q) => (q.key === "country" ? { ...q, prompt: "Where are you finishing high school?" } : q))),
  ];
}

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
export const SCHOOL_KEY = "school";
export const UNIVERSITY_KEY = "university";
export const SCHOOL_MAX = 120;
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
  kind?: "high_school";
  headline: string;
  summary: string;
  fields: FieldSuggestion[];
  schools: SchoolSuggestion[];
  careers: CareerOutlook;
  verify?: VerifyLink[];
  scholarships?: ScholarshipLink[];
}

/** An open opportunity from the SCA Opportunities Sheet, matched by the
 *  backend; `why` is the report's explanation of the fit. */
export interface OpportunityMatch {
  id: string;
  title: string;
  organization: string;
  category: string;
  deadline: string;
  deadline_date: string | null;
  location: string;
  remote: string;
  field: string;
  tags: string[];
  eligibility_year: string;
  eligibility_nationality: string;
  description: string;
  apply_link: string;
  /** Not in the categories the student asked for, but a good fit. */
  also: boolean;
  why?: string;
}

export interface SkillToBuild {
  name: string;
  why: string;
  how: string;
}

export interface UndergradReport {
  kind: "undergraduate";
  headline: string;
  summary: string;
  directions: FieldSuggestion[];
  opportunities: OpportunityMatch[];
  skills: SkillToBuild[];
  careers: CareerOutlook;
  /** Where to browse every open opportunity. */
  browse: string;
}

export type AnyReport = PathfinderReport | UndergradReport;

export const isUndergradReport = (r: AnyReport): r is UndergradReport => r.kind === "undergraduate";

/**
 * Turns the answer set into a compact, human-readable brief. Used both for the
 * search query and as the model's input, so what the student answered and what
 * the model reasons over can never drift apart.
 */
export function summariseAnswers(answers: Answers): string {
  return questionsFor(answers).map((q) => {
    const v = answers[q.key];
    const text = Array.isArray(v) ? v.join(", ") : v;
    return text ? `${q.label}: ${text}` : null;
  })
    .filter(Boolean)
    .join("\n");
}
