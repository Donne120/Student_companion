import { API_URL, fetchWithTimeout, authHeader } from "@/config/api";

export type Opportunity = {
  id: string;
  title: string;
  organization?: string;
  category: "Scholarship" | "Internship" | "Fellowship" | "Competition" | "Program" | "Grant" | "Job";
  description: string;
  url: string;
  deadline?: string;
  location?: string;
};

const OPPORTUNITIES_ENDPOINT = `${API_URL}/api/opportunities`;
// The career site (career.studentcompanionai.rw) reads its opportunities live
// from the SCA Opportunities Google Sheet through this Apps Script web app.
// opportunities.json on the site is only its fallback snapshot, which goes
// stale, so the chat reads the same live feed first.
const CAREER_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbw18zxmzIiicaePtqdlds9-rioJVjBRXB5c-4wISad6qo7hGRCAnYF7hf-qp1MIeDgg/exec?action=opportunities";
const CAREER_SITE_URL = "https://career.studentcompanionai.rw/opportunities.json";
const CACHE_KEY = "ALU_OPPORTUNITIES_CACHE";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// ─── Career-site category → widget category mapping ───────────────────────
const CATEGORY_MAP: Record<string, Opportunity["category"]> = {
  Scholarships: "Scholarship",
  Fellowships: "Fellowship",
  Internships: "Internship",
  Jobs: "Job",
  Competitions: "Competition",
  Programs: "Program",
  Grants: "Grant",
};

// Shape of a raw entry from the career site's Sheet feed or opportunities.json.
// Sheet cells pass through as typed, so values are not guaranteed to be strings.
interface CareerSiteEntry {
  id?: string;
  title: string;
  organization?: string;
  category: string;
  description: string;
  apply_link: string;
  deadline?: string;
  location?: string;
  status?: string;
  date_added?: string;
}

/** Normalise a career-site entry to the widget's Opportunity type */
const text = (v: unknown): string | undefined => {
  const s = v === null || v === undefined ? "" : String(v).trim();
  return s || undefined;
};

const normaliseCareer = (e: CareerSiteEntry): Opportunity => {
  const title = text(e.title) ?? "";
  const category = text(e.category) ?? "";
  return {
    id: text(e.id) ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    organization: text(e.organization),
    category: CATEGORY_MAP[category] ?? CATEGORY_MAP[`${category}s`] ?? "Program",
    description: text(e.description) ?? "",
    url: text(e.apply_link) ?? "",
    deadline: text(e.deadline),
    location: text(e.location),
  };
};

// Curated fallback list — shown only when both the career site and backend are unreachable.
const FALLBACK: Opportunity[] = [
  {
    id: "mastercard-foundation-scholars",
    title: "Mastercard Foundation Scholars Program",
    organization: "Mastercard Foundation",
    category: "Scholarship",
    description:
      "Full scholarships for academically talented yet economically disadvantaged African students.",
    url: "https://mastercardfdn.org/all/scholars/",
    location: "Pan-African",
  },
  {
    id: "google-africa-developer",
    title: "Google Africa Developer Scholarship",
    organization: "Google",
    category: "Scholarship",
    description:
      "Free training for African developers in mobile, cloud, and machine learning tracks.",
    url: "https://developers.google.com/community/africa",
    location: "Africa",
  },
  {
    id: "mandela-washington",
    title: "Mandela Washington Fellowship",
    organization: "U.S. Department of State",
    category: "Fellowship",
    description:
      "Six-week leadership institute in the United States for young African leaders aged 25–35.",
    url: "https://yali.state.gov/mwf/",
  },
  {
    id: "rhodes-scholarship",
    title: "Rhodes Scholarship for Africa",
    organization: "Rhodes Trust",
    category: "Scholarship",
    description:
      "Fully funded postgraduate study at the University of Oxford for outstanding young leaders.",
    url: "https://www.rhodeshouse.ox.ac.uk/scholarships/",
    location: "Oxford, UK",
  },
  {
    id: "chevening",
    title: "Chevening Scholarships",
    organization: "UK Government",
    category: "Scholarship",
    description:
      "One-year fully funded master's degree at any UK university for emerging leaders.",
    url: "https://www.chevening.org/",
    location: "UK",
  },
  {
    id: "tony-elumelu",
    title: "Tony Elumelu Foundation Entrepreneurship Programme",
    organization: "Tony Elumelu Foundation",
    category: "Program",
    description:
      "$5,000 seed capital plus training and mentorship for 1,000 African entrepreneurs annually.",
    url: "https://www.tonyelumelufoundation.org/",
  },
  {
    id: "andela-fellowship",
    title: "Andela Learning Community",
    organization: "Andela",
    category: "Program",
    description:
      "Free training and pathways into tech jobs for African software engineers.",
    url: "https://andela.com/",
  },
  {
    id: "world-bank-internship",
    title: "World Bank Internship Program",
    organization: "World Bank",
    category: "Internship",
    description:
      "Paid summer and winter internships for graduate students at World Bank offices worldwide.",
    url: "https://www.worldbank.org/en/about/careers/programs-and-internships/internship",
  },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type CacheEntry = { fetchedAt: number; opportunities: Opportunity[] };

const readCache = (): Opportunity[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry.opportunities;
  } catch {
    return null;
  }
};

const writeCache = (opportunities: Opportunity[]) => {
  try {
    const entry: CacheEntry = { fetchedAt: Date.now(), opportunities };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage full or disabled — non-fatal
  }
};

/** Live entries from one career-site source, or null if it fails or is empty. */
const fetchCareerEntries = async (url: string, timeoutMs: number): Promise<Opportunity[] | null> => {
  try {
    const res = await fetchWithTimeout(url, {}, timeoutMs);
    if (!res.ok) return null;
    const data = (await res.json()) as { opportunities?: CareerSiteEntry[] } | CareerSiteEntry[];
    const entries = Array.isArray(data) ? data : data.opportunities;
    if (!Array.isArray(entries) || entries.length === 0) return null;
    const live = entries
      .filter((e) => text(e.title) && (text(e.status) ?? "live").toLowerCase() === "live")
      .map(normaliseCareer)
      .filter((o) => o.url);
    return live.length > 0 ? live : null;
  } catch {
    return null;
  }
};

/**
 * Fetch live opportunities the way career.studentcompanionai.rw does: the
 * Google Sheet feed first (Apps Script can take a few seconds to wake), then
 * the site's opportunities.json snapshot.
 */
const fetchFromCareerSite = async (): Promise<Opportunity[] | null> =>
  (await fetchCareerEntries(CAREER_SHEET_URL, 10000)) ??
  (await fetchCareerEntries(CAREER_SITE_URL, 5000));

/**
 * Returns a shuffled list of opportunities.
 *
 * Source priority:
 *  1. The career site's live Google Sheet feed, then its opportunities.json snapshot
 *  2. Backend at GET /api/opportunities (Tavily-powered)
 *  3. localStorage cache from a recent fetch (within 30 min)
 *  4. Curated FALLBACK list bundled with the app
 */
export const getOpportunities = async (): Promise<Opportunity[]> => {
  // 1. Try career site first (primary live source)
  const careerData = await fetchFromCareerSite();
  if (careerData && careerData.length > 0) {
    writeCache(careerData);
    return shuffle(careerData);
  }

  // 2. Try backend
  try {
    const res = await fetchWithTimeout(
      OPPORTUNITIES_ENDPOINT,
      { method: "GET", headers: { ...(await authHeader()) } },
      4000
    );
    if (res.ok) {
      const data = (await res.json()) as { opportunities?: Opportunity[] };
      if (Array.isArray(data.opportunities) && data.opportunities.length > 0) {
        writeCache(data.opportunities);
        return shuffle(data.opportunities);
      }
    }
  } catch {
    // Backend unavailable — fall through.
  }

  // 3. Cache
  const cached = readCache();
  if (cached && cached.length > 0) return shuffle(cached);

  // 4. Built-in fallback
  return shuffle(FALLBACK);
};

export const opportunitiesService = { getOpportunities };
