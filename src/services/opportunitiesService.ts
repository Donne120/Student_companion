import { API_URL, fetchWithTimeout, authHeader } from "@/config/api";

export type Opportunity = {
  id: string;
  title: string;
  organization?: string;
  category: "Scholarship" | "Internship" | "Fellowship" | "Competition" | "Program" | "Grant";
  description: string;
  url: string;
  deadline?: string;
  location?: string;
};

const OPPORTUNITIES_ENDPOINT = `${API_URL}/api/opportunities`;
const CACHE_KEY = "ALU_OPPORTUNITIES_CACHE";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Curated fallback list — real, verifiable programs for African / ALU students.
// Phase 2: backend at /api/opportunities will call Tavily web-search and return
// fresh results. Until then, this list seeds the widget.
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
    id: "daad-in-country",
    title: "DAAD In-Country/In-Region Scholarships",
    organization: "DAAD (Germany)",
    category: "Scholarship",
    description:
      "Master's and PhD scholarships for sub-Saharan African students at African universities.",
    url: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
  },
  {
    id: "yali-rlc",
    title: "YALI Regional Leadership Center",
    organization: "USAID",
    category: "Program",
    description:
      "Free in-person and online leadership training for young Africans aged 18–35.",
    url: "https://yali.state.gov/rlc/",
  },
  {
    id: "anzisha-prize",
    title: "Anzisha Prize",
    organization: "African Leadership Academy",
    category: "Competition",
    description:
      "Africa's largest award for young entrepreneurs aged 15–22. Up to $25,000 in prizes.",
    url: "https://www.anzishaprize.org/",
    location: "Africa",
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
    id: "obama-foundation-leaders",
    title: "Obama Foundation Leaders: Africa",
    organization: "Obama Foundation",
    category: "Fellowship",
    description:
      "Six-month leadership development program for emerging African civic leaders.",
    url: "https://www.obama.org/programs/leaders-africa/",
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
  {
    id: "unicef-internship",
    title: "UNICEF Internship Programme",
    organization: "UNICEF",
    category: "Internship",
    description:
      "Internships in 190+ countries for students and recent graduates supporting children worldwide.",
    url: "https://www.unicef.org/careers/internships",
  },
  {
    id: "un-young-professionals",
    title: "UN Young Professionals Programme",
    organization: "United Nations",
    category: "Program",
    description:
      "Recruitment programme for talented young professionals to start a career in the UN Secretariat.",
    url: "https://careers.un.org/lbw/home.aspx?viewtype=NCE",
  },
  {
    id: "afdb-young-professionals",
    title: "AfDB Young Professionals Program",
    organization: "African Development Bank",
    category: "Program",
    description:
      "Three-year rotational program for African professionals under 32 with a master's degree.",
    url: "https://www.afdb.org/en/about-us/careers/young-professionals-program",
  },
  {
    id: "ashinaga-africa",
    title: "Ashinaga Africa Initiative",
    organization: "Ashinaga",
    category: "Scholarship",
    description:
      "Full undergraduate scholarships abroad for orphaned students from sub-Saharan Africa.",
    url: "https://www.ashinaga.org/en/africa/",
  },
  {
    id: "carnegie-mellon-africa",
    title: "Carnegie Mellon University Africa Scholarships",
    organization: "CMU-Africa",
    category: "Scholarship",
    description:
      "Master's scholarships at CMU-Africa in Kigali, Rwanda for engineering and IT.",
    url: "https://www.africa.engineering.cmu.edu/admissions/financial-aid/",
    location: "Kigali, Rwanda",
  },
  {
    id: "ashoka-africa",
    title: "Ashoka Young Changemakers",
    organization: "Ashoka",
    category: "Fellowship",
    description:
      "Network and support for young people leading positive change in their communities.",
    url: "https://www.ashoka.org/en/program/ashoka-young-changemakers",
  },
  {
    id: "echoing-green",
    title: "Echoing Green Fellowship",
    organization: "Echoing Green",
    category: "Fellowship",
    description:
      "Seed funding and leadership development for early-stage social entrepreneurs worldwide.",
    url: "https://echoinggreen.org/fellowship/",
  },
  {
    id: "ibm-skillsbuild",
    title: "IBM SkillsBuild for Africa",
    organization: "IBM",
    category: "Program",
    description:
      "Free digital skills training and credentials in AI, cybersecurity, and cloud computing.",
    url: "https://skillsbuild.org/",
  },
  {
    id: "queen-elizabeth-academic",
    title: "Queen Elizabeth Commonwealth Scholarships",
    organization: "Commonwealth Scholarship Commission",
    category: "Scholarship",
    description:
      "Master's scholarships for students from low and middle income Commonwealth countries.",
    url: "https://cscuk.fcdo.gov.uk/scholarships/",
  },
  {
    id: "schwarzman-scholars",
    title: "Schwarzman Scholars",
    organization: "Tsinghua University",
    category: "Scholarship",
    description:
      "Fully funded one-year master's in global affairs at Tsinghua University in Beijing.",
    url: "https://www.schwarzmanscholars.org/",
    location: "Beijing, China",
  },
  {
    id: "gates-cambridge",
    title: "Gates Cambridge Scholarship",
    organization: "Gates Cambridge Trust",
    category: "Scholarship",
    description:
      "Full-cost postgraduate scholarships at the University of Cambridge for outstanding applicants.",
    url: "https://www.gatescambridge.org/",
    location: "Cambridge, UK",
  },
  {
    id: "yali-online",
    title: "YALI Network Online Courses",
    organization: "YALI Network",
    category: "Program",
    description:
      "Free online courses and certificates on leadership, business, and civic engagement.",
    url: "https://yali.state.gov/courses/",
  },
  {
    id: "mozilla-fellowship",
    title: "Mozilla Fellowship",
    organization: "Mozilla Foundation",
    category: "Fellowship",
    description:
      "Funded fellowships for technologists, activists and scientists working on internet health.",
    url: "https://foundation.mozilla.org/en/fellowships/",
  },
  {
    id: "africa-no-filter",
    title: "Africa No Filter Storytellers Grant",
    organization: "Africa No Filter",
    category: "Grant",
    description:
      "Grants for African storytellers, journalists, and creatives to shift narratives about Africa.",
    url: "https://africanofilter.org/grants",
  },
  {
    id: "westerwelle-young-founders",
    title: "Westerwelle Young Founders Programme",
    organization: "Westerwelle Foundation",
    category: "Program",
    description:
      "Six-month support programme for outstanding young entrepreneurs from emerging countries.",
    url: "https://westerwelle-foundation.com/programs/young-founders-program/",
  },
  {
    id: "alx-fellowship",
    title: "ALX Africa Tech Programs",
    organization: "ALX Africa",
    category: "Program",
    description:
      "Free tech training in software engineering, data science, and Salesforce for young Africans.",
    url: "https://www.alxafrica.com/",
    location: "Pan-African",
  },
  {
    id: "world-economic-forum-global-shapers",
    title: "Global Shapers Community",
    organization: "World Economic Forum",
    category: "Fellowship",
    description:
      "Network of young people aged 20–30 driving dialogue, action, and change in their cities.",
    url: "https://www.globalshapers.org/",
  },
  {
    id: "open-society-fellowship",
    title: "Open Society Youth Fellowship",
    organization: "Open Society Foundations",
    category: "Fellowship",
    description:
      "Supports young leaders working on issues of justice, equality, and democratic governance.",
    url: "https://www.opensocietyfoundations.org/grants/youth-fellowship",
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

/**
 * Returns a shuffled list of opportunities.
 *
 * Source priority:
 *  1. Backend at GET /api/opportunities (Tavily-powered, when phase-2 ships).
 *  2. localStorage cache from a recent backend call (within 30 min).
 *  3. Curated FALLBACK list bundled with the app.
 *
 * The shuffle is per-call, so different sessions / tabs see a different order
 * even when reading from the same source.
 */
export const getOpportunities = async (): Promise<Opportunity[]> => {
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

  const cached = readCache();
  if (cached && cached.length > 0) return shuffle(cached);

  return shuffle(FALLBACK);
};

export const opportunitiesService = { getOpportunities };
