/**
 * A vetted starting directory for Pathfinder: established universities across
 * Africa with their official websites, each country's higher-education
 * regulator (where a student can check that a university and programme are
 * accredited) and, where there is one, the national application portal.
 *
 * Why it exists: the report used to rely on a single web search, so the
 * universities it suggested were whatever ranked that day, blogs included.
 * The model now gets this directory alongside live search results, may only
 * link to a school whose website is in one or the other, and every link is
 * checked before it is shown (see recommend.ts).
 *
 * Keep entries to institutions whose official domain is certain. A wrong or
 * stale entry is caught by the link check and simply not shown, but it is
 * better not to add one. The underscore keeps Vercel from treating this file
 * as an API route.
 */

export interface DirectoryUniversity {
  name: string;
  city: string;
  kind: "Public" | "Private";
  url: string;
}

export interface CountryDirectory {
  universities: DirectoryUniversity[];
  /** The body that accredits universities and programmes. */
  regulator?: { name: string; url: string };
  /** Central application system, where admission goes through one. */
  applyVia?: { name: string; url: string };
}

const u = (name: string, city: string, kind: "Public" | "Private", url: string): DirectoryUniversity => ({
  name,
  city,
  kind,
  url,
});

export const DIRECTORY: Record<string, CountryDirectory> = {
  // ── East Africa ────────────────────────────────────────────────────────
  Rwanda: {
    universities: [
      u("University of Rwanda", "Kigali and other campuses", "Public", "https://ur.ac.rw"),
      u("Rwanda Polytechnic", "Kigali and regional colleges", "Public", "https://www.rp.ac.rw"),
      u("African Leadership University", "Kigali", "Private", "https://www.alueducation.com"),
      u("Carnegie Mellon University Africa", "Kigali", "Private", "https://www.africa.engineering.cmu.edu"),
      u("University of Global Health Equity", "Butaro", "Private", "https://ughe.org"),
      u("Adventist University of Central Africa", "Kigali", "Private", "https://www.auca.ac.rw"),
      u("INES-Ruhengeri", "Musanze", "Private", "https://www.ines.ac.rw"),
      u("University of Kigali", "Kigali", "Private", "https://uok.ac.rw"),
      u("Kepler College", "Kigali", "Private", "https://kepler.org"),
      u("Independent University of Kigali (ULK)", "Kigali and Gisenyi", "Private", "https://www.ulk.ac.rw"),
      u("Catholic University of Rwanda", "Huye", "Private", "https://www.cur.ac.rw"),
      u("Protestant Institute of Arts and Social Sciences (PIASS)", "Huye", "Private", "https://www.piass.ac.rw"),
      u("University of Tourism, Technology and Business Studies (UTB)", "Kigali", "Private", "https://www.utb.ac.rw"),
      u("University of Technology and Arts of Byumba (UTAB)", "Gicumbi", "Private", "https://www.utab.ac.rw"),
      u("East African University Rwanda", "Nyagatare", "Private", "https://www.eaur.ac.rw"),
      u("Rwanda Institute for Conservation Agriculture (RICA)", "Bugesera", "Private", "https://www.rica.rw"),
      u("Vatel School Rwanda", "Kigali", "Private", "https://www.vatel.rw"),
    ],
    regulator: { name: "Higher Education Council (HEC)", url: "https://hec.gov.rw" },
  },
  Kenya: {
    universities: [
      u("University of Nairobi", "Nairobi", "Public", "https://www.uonbi.ac.ke"),
      u("Kenyatta University", "Nairobi", "Public", "https://www.ku.ac.ke"),
      u("Jomo Kenyatta University of Agriculture and Technology", "Juja", "Public", "https://www.jkuat.ac.ke"),
      u("Moi University", "Eldoret", "Public", "https://www.mu.ac.ke"),
      u("Egerton University", "Njoro", "Public", "https://www.egerton.ac.ke"),
      u("Strathmore University", "Nairobi", "Private", "https://strathmore.edu"),
      u("United States International University–Africa", "Nairobi", "Private", "https://www.usiu.ac.ke"),
    ],
    regulator: { name: "Commission for University Education (CUE)", url: "https://www.cue.or.ke" },
    applyVia: { name: "KUCCPS (government-sponsored placement)", url: "https://www.kuccps.ac.ke" },
  },
  Uganda: {
    universities: [
      u("Makerere University", "Kampala", "Public", "https://www.mak.ac.ug"),
      u("Kyambogo University", "Kampala", "Public", "https://kyu.ac.ug"),
      u("Mbarara University of Science and Technology", "Mbarara", "Public", "https://www.must.ac.ug"),
      u("Gulu University", "Gulu", "Public", "https://gu.ac.ug"),
      u("Uganda Christian University", "Mukono", "Private", "https://ucu.ac.ug"),
    ],
    regulator: { name: "National Council for Higher Education (NCHE)", url: "https://unche.or.ug" },
  },
  Tanzania: {
    universities: [
      u("University of Dar es Salaam", "Dar es Salaam", "Public", "https://www.udsm.ac.tz"),
      u("University of Dodoma", "Dodoma", "Public", "https://www.udom.ac.tz"),
      u("Sokoine University of Agriculture", "Morogoro", "Public", "https://www.sua.ac.tz"),
      u("Muhimbili University of Health and Allied Sciences", "Dar es Salaam", "Public", "https://www.muhas.ac.tz"),
    ],
    regulator: { name: "Tanzania Commission for Universities (TCU)", url: "https://www.tcu.go.tz" },
  },
  Burundi: {
    universities: [u("Université du Burundi", "Bujumbura", "Public", "https://ub.edu.bi")],
  },
  "DR Congo": {
    universities: [
      u("Université de Kinshasa", "Kinshasa", "Public", "https://unikin.ac.cd"),
      u("Université de Lubumbashi", "Lubumbashi", "Public", "https://unilu.ac.cd"),
    ],
  },
  Ethiopia: {
    universities: [
      u("Addis Ababa University", "Addis Ababa", "Public", "https://www.aau.edu.et"),
      u("Bahir Dar University", "Bahir Dar", "Public", "https://www.bdu.edu.et"),
      u("Jimma University", "Jimma", "Public", "https://ju.edu.et"),
    ],
  },
  "South Sudan": { universities: [] },

  // ── West Africa ────────────────────────────────────────────────────────
  Nigeria: {
    universities: [
      u("University of Lagos", "Lagos", "Public", "https://unilag.edu.ng"),
      u("University of Ibadan", "Ibadan", "Public", "https://www.ui.edu.ng"),
      u("Obafemi Awolowo University", "Ile-Ife", "Public", "https://oauife.edu.ng"),
      u("Ahmadu Bello University", "Zaria", "Public", "https://abu.edu.ng"),
      u("University of Nigeria, Nsukka", "Nsukka", "Public", "https://www.unn.edu.ng"),
      u("Covenant University", "Ota", "Private", "https://covenantuniversity.edu.ng"),
    ],
    regulator: { name: "National Universities Commission (NUC)", url: "https://www.nuc.edu.ng" },
    applyVia: { name: "JAMB (UTME and admissions)", url: "https://www.jamb.gov.ng" },
  },
  Ghana: {
    universities: [
      u("University of Ghana", "Accra", "Public", "https://www.ug.edu.gh"),
      u("Kwame Nkrumah University of Science and Technology", "Kumasi", "Public", "https://www.knust.edu.gh"),
      u("University of Cape Coast", "Cape Coast", "Public", "https://ucc.edu.gh"),
      u("Ashesi University", "Berekuso", "Private", "https://www.ashesi.edu.gh"),
    ],
    regulator: { name: "Ghana Tertiary Education Commission (GTEC)", url: "https://gtec.edu.gh" },
  },
  Senegal: {
    universities: [
      u("Université Cheikh Anta Diop", "Dakar", "Public", "https://www.ucad.sn"),
      u("Université Gaston Berger", "Saint-Louis", "Public", "https://www.ugb.sn"),
    ],
  },
  "Côte d'Ivoire": {
    universities: [
      u("Université Félix Houphouët-Boigny", "Abidjan", "Public", "https://www.univ-fhb.edu.ci"),
      u("Institut National Polytechnique Félix Houphouët-Boigny", "Yamoussoukro", "Public", "https://www.inphb.ci"),
    ],
  },
  Cameroon: {
    universities: [
      u("University of Buea", "Buea", "Public", "https://www.ubuea.cm"),
      u("Université de Yaoundé I", "Yaoundé", "Public", "https://www.uy1.uninet.cm"),
    ],
  },
  "Sierra Leone": {
    universities: [u("University of Sierra Leone", "Freetown", "Public", "https://usl.edu.sl")],
  },
  Liberia: {
    universities: [u("University of Liberia", "Monrovia", "Public", "https://www.ul.edu.lr")],
  },
  "The Gambia": {
    universities: [u("University of The Gambia", "Serrekunda", "Public", "https://www.utg.edu.gm")],
  },

  // ── Southern Africa ───────────────────────────────────────────────────
  "South Africa": {
    universities: [
      u("University of Cape Town", "Cape Town", "Public", "https://www.uct.ac.za"),
      u("University of the Witwatersrand", "Johannesburg", "Public", "https://www.wits.ac.za"),
      u("Stellenbosch University", "Stellenbosch", "Public", "https://www.sun.ac.za"),
      u("University of Pretoria", "Pretoria", "Public", "https://www.up.ac.za"),
      u("University of Johannesburg", "Johannesburg", "Public", "https://www.uj.ac.za"),
      u("University of KwaZulu-Natal", "Durban", "Public", "https://ukzn.ac.za"),
      u("University of South Africa (distance learning)", "Online / Pretoria", "Public", "https://www.unisa.ac.za"),
    ],
    regulator: { name: "Council on Higher Education (CHE)", url: "https://www.che.ac.za" },
  },
  Zambia: {
    universities: [
      u("University of Zambia", "Lusaka", "Public", "https://www.unza.zm"),
      u("Copperbelt University", "Kitwe", "Public", "https://www.cbu.ac.zm"),
    ],
    regulator: { name: "Higher Education Authority (HEA)", url: "https://www.hea.org.zm" },
  },
  Zimbabwe: {
    universities: [
      u("University of Zimbabwe", "Harare", "Public", "https://www.uz.ac.zw"),
      u("National University of Science and Technology", "Bulawayo", "Public", "https://www.nust.ac.zw"),
    ],
    regulator: { name: "Zimbabwe Council for Higher Education (ZIMCHE)", url: "https://www.zimche.ac.zw" },
  },
  Malawi: {
    universities: [
      u("University of Malawi", "Zomba", "Public", "https://www.unima.ac.mw"),
      u("Lilongwe University of Agriculture and Natural Resources", "Lilongwe", "Public", "https://www.luanar.ac.mw"),
    ],
  },
  Botswana: {
    universities: [
      u("University of Botswana", "Gaborone", "Public", "https://www.ub.bw"),
      u("Botswana International University of Science and Technology", "Palapye", "Public", "https://www.biust.ac.bw"),
    ],
  },
  Namibia: {
    universities: [
      u("University of Namibia", "Windhoek", "Public", "https://www.unam.edu.na"),
      u("Namibia University of Science and Technology", "Windhoek", "Public", "https://www.nust.na"),
    ],
  },
  Mozambique: {
    universities: [u("Universidade Eduardo Mondlane", "Maputo", "Public", "https://www.uem.mz")],
  },
  Mauritius: {
    universities: [
      u("University of Mauritius", "Réduit", "Public", "https://www.uom.ac.mu"),
      u("African Leadership University", "Pamplemousses", "Private", "https://www.alueducation.com"),
    ],
    regulator: { name: "Higher Education Commission (HEC)", url: "https://www.hec.mu" },
  },

  // ── North Africa ──────────────────────────────────────────────────────
  Egypt: {
    universities: [
      u("Cairo University", "Giza", "Public", "https://cu.edu.eg"),
      u("Ain Shams University", "Cairo", "Public", "https://www.asu.edu.eg"),
      u("The American University in Cairo", "New Cairo", "Private", "https://www.aucegypt.edu"),
    ],
  },
  Morocco: {
    universities: [
      u("Mohammed V University", "Rabat", "Public", "https://www.um5.ac.ma"),
      u("Al Akhawayn University", "Ifrane", "Private", "https://www.aui.ma"),
      u("Mohammed VI Polytechnic University", "Ben Guerir", "Private", "https://www.um6p.ma"),
    ],
  },
  Tunisia: {
    universities: [u("Université de Tunis El Manar", "Tunis", "Public", "https://www.utm.rnu.tn")],
  },
};

/** For students who want to study elsewhere in Africa: a spread of strong
 *  universities in different regions. */
export const PAN_AFRICAN = [
  "South Africa",
  "Ghana",
  "Kenya",
  "Rwanda",
  "Uganda",
  "Nigeria",
  "Morocco",
  "Egypt",
].flatMap((c) => (DIRECTORY[c]?.universities ?? []).slice(0, 2).map((x) => ({ ...x, country: c })));

/** Undergraduate scholarship programmes open to students across Africa. */
export const SCHOLARSHIPS = [
  {
    name: "Mastercard Foundation Scholars Program",
    detail: "Full scholarships at partner universities in Africa and abroad, for academically strong students facing financial barriers.",
    url: "https://mastercardfdn.org",
  },
  {
    name: "DAAD scholarships (Germany)",
    detail: "Includes in-country and in-region scholarships for study at African universities; check which apply to undergraduates in your country.",
    url: "https://www.daad.de/en/",
  },
];

/** Academic web domains across Africa, used to steer the live search toward
 *  official university and regulator pages and away from blogs. */
export const PREFERRED_DOMAINS = [
  "ac.rw", "hec.gov.rw", "ac.ke", "cue.or.ke", "ac.ug", "ac.tz", "edu.bi", "ac.cd", "edu.et",
  "edu.ng", "nuc.edu.ng", "edu.gh", "ac.za", "ac.zm", "ac.zw", "ac.mw", "ac.bw", "edu.na",
  "ac.mu", "edu.eg", "ac.ma", "edu.sl", "edu.lr", "edu.gm", "alueducation.com",
];

/** The countries students can pick, grouped by region (shown in this order). */
export const COUNTRIES = [
  "Rwanda", "Kenya", "Uganda", "Tanzania", "Burundi", "DR Congo", "Ethiopia", "South Sudan",
  "Nigeria", "Ghana", "Senegal", "Côte d'Ivoire", "Cameroon", "Sierra Leone", "Liberia", "The Gambia",
  "South Africa", "Zambia", "Zimbabwe", "Malawi", "Botswana", "Namibia", "Mozambique", "Mauritius",
  "Egypt", "Morocco", "Tunisia",
];
