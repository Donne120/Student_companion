/**
 * ALU Help Center Deep Search Service
 * Provides comprehensive search across ALU knowledge base
 * "Wide and mighty" search that can find even a "dot" of information
 */

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
  lastUpdated: string;
  relevanceScore?: number;
}

interface SearchResult {
  articles: HelpArticle[];
  query: string;
  totalResults: number;
  searchTime: number;
}

// Pharmacy data for location-based search
interface Pharmacy {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  service: string;
}

const pharmacyDirectory: Pharmacy[] = [
  { id: 1, name: "TETA PHARMACY", email: "tetapharmacy@gmail.com", phone: "+250788460549", location: "KIMIRONKO", service: "Dispensing Medicines" },
  { id: 2, name: "SABANS PHARMACY (REMERA)", email: "sabans.pharmacy@yahoo.com", phone: "+250788394007", location: "REMERA", service: "Dispensing Medicines" },
  { id: 3, name: "SANA PHARMACY", email: "pharmacysana@gmail.com", phone: "+250788687992", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 4, name: "PHARMASAVE", email: "pharmasaverwanda@gmail.com", phone: "+250788421118", location: "KACYIRU", service: "Dispensing Medicines" },
  { id: 5, name: "SANOPHAR", email: "sanophar.pharmacy@gmail.com", phone: "+250788439891", location: "KIMISAGARA", service: "Dispensing Medicines" },
  { id: 6, name: "PHARMACIE IRAMIRO", email: "bizimungudavid8@gmail.com", phone: "+250788302337", location: "NYAMIRAMBO", service: "Dispensing Medicines" },
  { id: 7, name: "PHARMACIE SHEMA", email: "pharmacieshema@gmail.com", phone: "+250785740998", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 8, name: "BOVAN PHARMACY", email: "bovanltd@gmail.com", phone: "+250788358085", location: "NYABUGOGO", service: "Dispensing Medicines" },
  { id: 9, name: "LE NORMAL PHARMACY", email: "lenpharmacy@gmail.com", phone: "+250788601460", location: "GIKONDO", service: "Dispensing Medicines" },
  { id: 10, name: "SCORE PHARMACY", email: "scorepharmacy@gmail.com", phone: "+250783448585", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 11, name: "MEDIASOL PHARMACY", email: "nyarugenge@mediasolpharma.com", phone: "+250788824506", location: "REMERA", service: "Dispensing Medicines" },
  { id: 12, name: "UNIPHARMA", email: "unipharma@kiphagro.net", phone: "+250783390461", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 13, name: "LA DIVINE", email: "ladivaphar@gmail.com", phone: "+250788769907", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 14, name: "BENI PHARMACY", email: "pharmabeni@gmail.com", phone: "+250788842466", location: "KACYIRU", service: "Dispensing Medicines" },
  { id: 15, name: "ALLIANCE PHARMACY", email: "alliancepharmacy8@gmail.com", phone: "+250788795053", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 16, name: "VINE PHARMACY", email: "vinepharmacyrwkh@gmail.com", phone: "+250788523498", location: "REMERA", service: "Dispensing Medicines" },
  { id: 17, name: "UNIQUE PHARMACY", email: "pharmacieunique@yahoo.fr", phone: "+250788354212", location: "REMERA", service: "Dispensing Medicines" },
  { id: 18, name: "UMURAVA PHARMACY", email: "umuravapharmacy@yahoo.fr", phone: "+250788539713", location: "NYAMIRAMBO", service: "Dispensing Medicines" },
  { id: 19, name: "PHARMACIE REFFERENCE", email: "", phone: "+250788433705", location: "KICUKIRO", service: "Dispensing Medicines" },
  { id: 20, name: "RAINBOW PHARMACY", email: "rutigervis@yahoo.fr", phone: "+250788528059", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 21, name: "SEMU PHARMACY", email: "semupharmacy@gmail.com", phone: "+250788679787", location: "KICUKIRO", service: "Dispensing Medicines" },
  { id: 22, name: "DELIGHT PHARMACY", email: "delightpharmacy@gmail.com", phone: "+250788565194", location: "REMERA", service: "Dispensing Medicines" },
  { id: 23, name: "PHARMACIE EZA", email: "ezapharmacy2013@gmail.com", phone: "+250785022763", location: "KIYOVU", service: "Dispensing Medicines" },
  { id: 24, name: "HEALTHLINE PHARMACY", email: "healthlinepharmacyltd@gmail.com", phone: "+250784129559", location: "GASABO", service: "Dispensing Medicines" },
  { id: 25, name: "ISHYAKA PHARMACY", email: "kayibaba@yahoo.fr", phone: "+250788554512", location: "REMERA", service: "Dispensing Medicines" },
  { id: 26, name: "SUNBEAM PHARMACY", email: "sunbeampharm@gmail.com", phone: "+250788425010", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 27, name: "GALEAD PHARMACY", email: "pharmacygalead@yahoo.com", phone: "+250788566727", location: "KICUKIRO", service: "Dispensing Medicines" },
  { id: 28, name: "SPERANZA PHARMACY", email: "", phone: "+250788791642", location: "REMERA", service: "Dispensing Medicines" },
  { id: 29, name: "CARREFOUR PHARMACY", email: "gahongayiremo@yahoo.fr", phone: "+250788561497", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 30, name: "PHARMAVIE", email: "pharmavieltd18@gmail.com", phone: "+250781888165", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 31, name: "AXIS PHARMACY", email: "axispharmacy.pharmacy@gmail.com", phone: "+250783570602", location: "NYARUGENGE", service: "Dispensing Medicines" },
  { id: 32, name: "PHARMACIE NOVA", email: "novanovapharma@gmail.com", phone: "+250788457824", location: "KICUKIRO", service: "Dispensing Medicines" },
  { id: 33, name: "MASOPHAR PHARMACY", email: "nangeus2000@yahoo.fr", phone: "+250786096879", location: "MUHIMA", service: "Dispensing Medicines" },
  { id: 34, name: "THE SPECIALIST PHARMACY", email: "thespecialistpharma@gmail.com", phone: "+250785023348", location: "KIMIRONKO", service: "Dispensing Medicines" },
  { id: 35, name: "ABIRWA PHARMACY", email: "abirwapharmacy@yahoo.com", phone: "+250782553288", location: "KACYIRU", service: "Dispensing Medicines" },
  { id: 36, name: "EXODUS PHARMACY", email: "exoduspharma@yahoo.fr", phone: "+250788487708", location: "REMERA", service: "Dispensing Medicines" },
  { id: 37, name: "LYDDA PHARMACY", email: "lyddapharmacie@gmail.com", phone: "+250788511274", location: "KANOMBE", service: "Dispensing Medicines" },
  { id: 38, name: "PHARMAMED", email: "pharmacypharmamed@gmail.com", phone: "+250788650220", location: "KABEZA", service: "Dispensing Medicines" },
  { id: 39, name: "MENIPHAR PHARMACY", email: "menipharkabeza2012@gmail.com", phone: "+250788771881", location: "KABEZA", service: "Dispensing Medicines" },
  { id: 40, name: "PHARMACIE CONTINENTALLE", email: "pharma.continentale@gmail.com", phone: "+250788622221", location: "REMERA", service: "Dispensing Medicines" },
  { id: 41, name: "MARANATHA PHARMACY", email: "habyadam@yahoo.fr", phone: "+250788649553", location: "KACYIRU", service: "Dispensing Medicines" },
  { id: 42, name: "PHARMACIE ROYALE", email: "royale.pharmacy@yahoo.com", phone: "+250782961033", location: "KIMIRONKO", service: "Dispensing Medicines" },
  { id: 43, name: "GOODNESS PHARMACY", email: "7peterclaver@gmail.com", phone: "+250787555272", location: "GASABO", service: "Dispensing Medicines" },
  { id: 44, name: "TRINITY PHARMACY", email: "vidabesong@yahoo.com", phone: "+250788358068", location: "KIBAGABAGA", service: "Dispensing Medicines" },
  { id: 45, name: "PHARMACIE DU CALME", email: "munyeshyakakaeric@gmail.com", phone: "+250788346700", location: "KIBAGABAGA", service: "Dispensing Medicines" },
  { id: 46, name: "NEW HOPE PHARMACY", email: "newhope.pharmacy@gmail.com", phone: "+250783106658", location: "GASABO", service: "Dispensing Medicines" },
  { id: 47, name: "OMNICARE PHARMACY", email: "omnicarepharmacyltd@gmail.com", phone: "+250789635153", location: "GASABO", service: "Dispensing Medicines" },
  { id: 48, name: "AMAYA PHARMACY", email: "pharmacyamaya@yahoo.fr", phone: "+250788456665", location: "GISOZI", service: "Dispensing Medicines" },
  { id: 49, name: "BONITAS DEI PHARMACY", email: "bonitasdei.pharmacy@gmail.com", phone: "+250788669080", location: "KAGUGU", service: "Dispensing Medicines" },
  { id: 50, name: "YES PHARMACY", email: "yespharmacy2020@gmail.com", phone: "+250783857499", location: "KINYINYA", service: "Dispensing Medicines" },
  { id: 51, name: "MEDPOINT PHARMACY", email: "medpointpharmacyltd@gmail.com", phone: "+250783734461", location: "KICUKIRO", service: "Dispensing Medicines" },
  { id: 52, name: "PHARMABEST PHARMACY", email: "pharmabest.info@gmail.com", phone: "+250788480022", location: "REMERA", service: "Dispensing Medicines" },
  { id: 53, name: "PULSE PHARMACY LTD", email: "pulsepharma123@gmail.com", phone: "+250799366444", location: "GACURIRO", service: "Dispensing Medicines" },
  { id: 54, name: "EXPRESS PHARMACY", email: "pharmacyexpressltd@gmail.com", phone: "+250798685222", location: "NYARUTARAMA", service: "Dispensing Medicines" },
  { id: 55, name: "LA CURA PHARMACY LTD", email: "lacurapharm@gmail.com", phone: "+250787890304", location: "KIMIRONKO", service: "Dispensing Medicines" },
  { id: 56, name: "AERIS PHARMACY LTD", email: "aeris.pharmacy@gmail.com", phone: "+250788533651", location: "GISOZI", service: "Dispensing Medicines" },
  { id: 57, name: "ADVANCED PHARMACY", email: "advapharmacy@gmail.com", phone: "+250791579424", location: "GISOZI", service: "Dispensing Medicines" },
  { id: 58, name: "ALLIMED PHARMACY", email: "allimedpharmacy@gmail.com", phone: "+250795763907", location: "KIMIRONKO", service: "Dispensing Medicines" },
  // Outside Kigali
  { id: 59, name: "BONA CURATIO NGOMA", email: "ryumugabej@yahoo.fr", phone: "+250788419939", location: "NGOMA", service: "Dispensing Medicines" },
  { id: 60, name: "INITIATIVE PHARM RWAMAGANA", email: "initiativepharmaltd@gmail.com", phone: "+250788557758", location: "RWAMAGANA", service: "Dispensing Medicines" },
  { id: 61, name: "THE GUARDIAN PHARMACY", email: "theguardianpharmacy@gmail.com", phone: "+250786688057", location: "BUGESERA", service: "Dispensing Medicines" },
  { id: 62, name: "GRATIS PHARMACY", email: "gratispharmacy@yahoo.fr", phone: "+250784489941", location: "KAYONZA", service: "Dispensing Medicines" },
  { id: 63, name: "LAGO PHARMACY", email: "lagopharmacy@yahoo.fr", phone: "+250788741201", location: "RUBAVU", service: "Dispensing Medicines" },
  { id: 64, name: "PHARMACIE IRAGUHA", email: "iraguhapharmacie@gmail.com", phone: "+250783117737", location: "MUSANZE", service: "Dispensing Medicines" },
  { id: 65, name: "HIGH MAGNIFICAT PHARMACY", email: "hmagnificatpharma@gmail.com", phone: "+250788565308", location: "MUSANZE", service: "Dispensing Medicines" },
  { id: 66, name: "PHARMACIE BON SAMARITAIN", email: "lebonsamaritain98@gmail.com", phone: "+250784484324", location: "HUYE", service: "Dispensing Medicines" },
  { id: 67, name: "VIVA PHARMACY", email: "vivapharmacy11@gmail.com", phone: "+250782172937", location: "HUYE", service: "Dispensing Medicines" },
  { id: 68, name: "VICTORY PHARMACY", email: "victorypharmac@yahoo.fr", phone: "+250783043793", location: "HUYE", service: "Dispensing Medicines" },
];

// Function to find pharmacies by location
export function findPharmaciesByLocation(location: string): Pharmacy[] {
  const normalizedLocation = location.toUpperCase().trim();
  return pharmacyDirectory.filter(p => 
    p.location.toUpperCase().includes(normalizedLocation) ||
    normalizedLocation.includes(p.location.toUpperCase())
  ).slice(0, 5);
}

// Function to get all unique pharmacy locations
export function getPharmacyLocations(): string[] {
  return [...new Set(pharmacyDirectory.map(p => p.location).filter(l => l))].sort();
}

// Comprehensive ALU Help Center Knowledge Base
const helpCenterArticles: HelpArticle[] = [
  // WELLNESS TEAM - REAL DATA
  {
    id: "wellness-001",
    title: "ALU Wellness Team - Counseling and Health Services",
    category: "Health & Wellness",
    content: `
      PROFILES OF THE ALU WELLNESS TEAM
      
      ═══════════════════════════════════════════════════════════════
      DR. ALPHONSE NKURUNZIZA - Student Life Counsellor
      ═══════════════════════════════════════════════════════════════
      
      📧 Email: ankurunziza1@alueducation.com
      📅 Book Appointment: https://calendar.google.com/calendar/appointments (Alive 1:1)
      
      Qualifications:
      • Ph.D. in Clinical Psychology
      • 17+ years of professional experience
      • Expert in Mental Health and Psychosocial Support (MHPSS) programs
      
      Expertise:
      • Individual and group well-being programs
      • Holistic health and sustainable wellness habits
      • Physical, mental, emotional, social, and spiritual balance
      • Crisis intervention and counseling
      
      Dr. Alphonse believes that true wellness is multidimensional and requires 
      intentional effort across all areas of life. He joined ALU because of its 
      distinctive mission to provide higher education with a higher purpose - 
      developing leaders who are academically excellent and grounded in values 
      that promote personal growth, resilience, and service to humanity.
      
      ═══════════════════════════════════════════════════════════════
      MS. BELYSE MUKAYIRANGA - Campus Nurse
      ═══════════════════════════════════════════════════════════════
      
      📧 Email: bmukayiranga@alueducation.com
      📅 Book Medical Appointment: https://calendar.google.com/calendar/appointments (Alive 1:1)
      
      Qualifications:
      • Registered Nurse with extensive clinical care experience
      • Master's Degree in Global Health Delivery from University of Global Health Equity (UGHE)
      • Specialist in community health and wellness
      
      Services:
      • Clinical consultations
      • Preventive care
      • Health education
      • First aid and emergency response
      • Health check-ups and screenings
      
      Ms. Mukayiranga believes that sustainable wellness comes from small, consistent 
      steps - whether through staying physically active, eating balanced meals, or 
      regular health check-ups. She joined ALU to support the health and well-being 
      of Africa's future ethical entrepreneurs, believing that good health is the 
      foundation of success and the greatest form of wealth.
      
      ═══════════════════════════════════════════════════════════════
      HOW TO ACCESS WELLNESS SERVICES
      ═══════════════════════════════════════════════════════════════
      
      For Counseling (Mental Health):
      1. Email Dr. Alphonse at ankurunziza1@alueducation.com
      2. Book an Alive 1:1 appointment through the calendar link
      3. Walk-in during office hours for urgent matters
      
      For Medical Services:
      1. Email Nurse Belyse at bmukayiranga@alueducation.com
      2. Book a medical appointment through the calendar link
      3. Visit the campus health clinic for immediate care
      
      All services are CONFIDENTIAL and FREE for ALU students.
    `,
    keywords: ["wellness", "counseling", "mental health", "nurse", "doctor", "alphonse", "belyse", "health", "therapy", "psychology", "clinic", "medical", "appointment", "counsellor", "nkurunziza", "mukayiranga"],
    lastUpdated: "2024-12-01"
  },
  
  // HEALTH INSURANCE - REAL DATA
  {
    id: "insurance-001",
    title: "Health Insurance at ALU Rwanda - Complete Guide",
    category: "Health & Wellness",
    content: `
      HEALTH INSURANCE AT ALU RWANDA
      
      At ALU Rwanda, we care about the health and overall well-being of our students.
      ALL students are REQUIRED to have adequate health insurance for the duration of their studies.
      
      ═══════════════════════════════════════════════════════════════
      INSURANCE PLAN OPTIONS
      ═══════════════════════════════════════════════════════════════
      
      OPTION 1: ALU-FACILITATED INSURANCE (Recommended)
      ─────────────────────────────────────────────────
      Provider: BRITAM
      Cost: 260 USD per 4 months (one academic term)
      
      Coverage Includes:
      ✅ Healthcare Coverage: Doctor visits, hospital stays, emergency care
      ✅ Wellness and Mental Health Services outside ALU
      ✅ WorkPlace Learning Coverage for Accidents (internships in Rwanda)
      
      Accident Benefits:
      • Death Benefit: Rwf 2,000,000 per student
      • Total Permanent Disability: Rwf 2,000,000 per student
      • Medical Fee Coverage: Rwf 200,000 per student
      
      OPTION 2: PRIVATE INSURANCE (Opt-Out)
      ─────────────────────────────────────────────────
      Cost: 6 USD per 4 months (administrative fee only)
      Requirement: Must provide proof of valid insurance
      
      FOR RWANDAN NATIONALS - Accepted Providers:
      • PRIME
      • RADIANT
      • SANLAM ALLIANZ
      • MUA
      • BRITAM
      • EDEN CARE
      • MMI
      • RSSB
      • MUTUELLE DE SANTE
      • GMC
      • MIS/UR
      • UAP
      • Old Mutual Rwanda
      
      FOR INTERNATIONAL STUDENTS - Accepted Providers:
      • CIGNA GLOBAL
      • ALLIANZ CARE
      • Old Mutual International
      
      Private Insurance Requirements:
      • Must be functional in Rwanda
      • Sufficient inpatient and outpatient coverage
      • Include ambulance and emergency services
      • Broad direct access to private clinics, public hospitals, specialized centers
      • No out-of-pocket payments at point of care
      
      OPTION 3: NOT COVERED
      ─────────────────────────────────────────────────
      Only available for FullRide Scholars or students not physically in Rwanda
      
      ═══════════════════════════════════════════════════════════════
      IMPORTANT INFORMATION
      ═══════════════════════════════════════════════════════════════
      
      Minimum Coverage Period: 4 months (from matriculation date)
      
      Note: Health insurance is MANDATORY for registration at ALU Rwanda.
      
      Contact Financial Aid office for questions about insurance enrollment.
    `,
    keywords: ["insurance", "health", "britam", "coverage", "medical", "hospital", "emergency", "prime", "radiant", "sanlam", "mua", "eden care", "mmi", "rssb", "mutuelle", "cigna", "allianz"],
    lastUpdated: "2024-12-01"
  },
  
  // PHARMACY DIRECTORY
  {
    id: "pharmacy-001",
    title: "Pharmacy Directory - Find Nearby Pharmacies in Rwanda",
    category: "Health & Wellness",
    content: `
      PHARMACY DIRECTORY FOR ALU STUDENTS
      
      Need medicine? Here are pharmacies near ALU Rwanda campus and across Kigali.
      Tell me your location and I'll find the closest pharmacies for you!
      
      ═══════════════════════════════════════════════════════════════
      PHARMACIES NEAR ALU CAMPUS (KIGALI)
      ═══════════════════════════════════════════════════════════════
      
      KIMIRONKO AREA:
      • TETA PHARMACY - +250788460549 - tetapharmacy@gmail.com
      • THE SPECIALIST PHARMACY - +250785023348 - thespecialistpharma@gmail.com
      • PHARMACIE ROYALE - +250782961033 - royale.pharmacy@yahoo.com
      • LA CURA PHARMACY - +250787890304 - lacurapharm@gmail.com
      • ALLIMED PHARMACY - +250795763907 - allimedpharmacy@gmail.com
      
      REMERA AREA:
      • SABANS PHARMACY - +250788394007 - sabans.pharmacy@yahoo.com
      • MEDIASOL PHARMACY - +250788824506 - nyarugenge@mediasolpharma.com
      • VINE PHARMACY - +250788523498 - vinepharmacyrwkh@gmail.com
      • UNIQUE PHARMACY - +250788354212 - pharmacieunique@yahoo.fr
      • DELIGHT PHARMACY - +250788565194 - delightpharmacy@gmail.com
      • EXODUS PHARMACY - +250788487708 - exoduspharma@yahoo.fr
      • PHARMABEST PHARMACY - +250788480022 - pharmabest.info@gmail.com
      
      KACYIRU AREA:
      • PHARMASAVE - +250788421118 - pharmasaverwanda@gmail.com
      • BENI PHARMACY - +250788842466 - pharmabeni@gmail.com
      • ABIRWA PHARMACY - +250782553288 - abirwapharmacy@yahoo.com
      • MARANATHA PHARMACY - +250788649553 - habyadam@yahoo.fr
      
      GASABO AREA:
      • HEALTHLINE PHARMACY - +250784129559 - healthlinepharmacyltd@gmail.com
      • GOODNESS PHARMACY - +250787555272 - 7peterclaver@gmail.com
      • NEW HOPE PHARMACY - +250783106658 - newhope.pharmacy@gmail.com
      • OMNICARE PHARMACY - +250789635153 - omnicarepharmacyltd@gmail.com
      
      KICUKIRO AREA:
      • PHARMACIE REFFERENCE - +250788433705
      • SEMU PHARMACY - +250788679787 - semupharmacy@gmail.com
      • GALEAD PHARMACY - +250788566727 - pharmacygalead@yahoo.com
      • PHARMACIE NOVA - +250788457824 - novanovapharma@gmail.com
      • MEDPOINT PHARMACY - +250783734461 - medpointpharmacyltd@gmail.com
      
      KIBAGABAGA AREA:
      • TRINITY PHARMACY - +250788358068 - vidabesong@yahoo.com
      • PHARMACIE DU CALME - +250788346700 - munyeshyakakaeric@gmail.com
      • PHARMACIE DIGNE - +250788461155 - pharmaciedigne@gmail.com
      • BRUCE PHARMACY - +250787673201 - Brucepharmacy2023@gmail.com
      
      GISOZI AREA:
      • AMAYA PHARMACY - +250788456665 - pharmacyamaya@yahoo.fr
      • AERIS PHARMACY - +250788533651 - aeris.pharmacy@gmail.com
      • ADVANCED PHARMACY - +250791579424 - advapharmacy@gmail.com
      
      NYARUGENGE/DOWNTOWN:
      • SANA PHARMACY - +250788687992 - pharmacysana@gmail.com
      • SCORE PHARMACY - +250783448585 - scorepharmacy@gmail.com
      • ALLIANCE PHARMACY - +250788795053 - alliancepharmacy8@gmail.com
      • SUNBEAM PHARMACY - +250788425010 - sunbeampharm@gmail.com
      
      ═══════════════════════════════════════════════════════════════
      PHARMACIES OUTSIDE KIGALI
      ═══════════════════════════════════════════════════════════════
      
      MUSANZE:
      • PHARMACIE IRAGUHA - +250783117737
      • HIGH MAGNIFICAT PHARMACY - +250788565308
      
      HUYE:
      • PHARMACIE BON SAMARITAIN - +250784484324
      • VIVA PHARMACY - +250782172937
      • VICTORY PHARMACY - +250783043793
      
      RUBAVU:
      • LAGO PHARMACY - +250788741201
      
      RWAMAGANA:
      • INITIATIVE PHARM - +250788557758
      
      BUGESERA:
      • THE GUARDIAN PHARMACY - +250786688057
      
      ═══════════════════════════════════════════════════════════════
      HOW TO USE THIS SERVICE
      ═══════════════════════════════════════════════════════════════
      
      Just tell me your location (e.g., "I'm in Kimironko" or "pharmacy near Remera")
      and I'll provide the closest pharmacies with contact information!
      
      All pharmacies listed provide: Dispensing Medicines
      Most are open: Monday-Saturday, 8AM-8PM (hours may vary)
    `,
    keywords: ["pharmacy", "medicine", "drug", "medication", "chemist", "kimironko", "remera", "kacyiru", "gasabo", "kicukiro", "nyarugenge", "gisozi", "kibagabaga", "musanze", "huye", "rubavu", "pills", "prescription"],
    lastUpdated: "2024-12-01"
  },
  
  // LIBRARY RESOURCES - REAL DATA
  {
    id: "library-001",
    title: "ALU Library Resources and Databases",
    category: "Academic Resources",
    content: `
      ALU LIBRARY - YOUR GATEWAY TO KNOWLEDGE
      
      📚 Library Homepage: https://library.alueducation.com/home
      
      ═══════════════════════════════════════════════════════════════
      E-LIBRARY DATABASES
      ═══════════════════════════════════════════════════════════════
      
      EBSCOHOST (Core Academic Database)
      • Access: Through institutional login
      • Content: Academic journals, e-books, research papers
      • User Guide: Available on library website
      
      BUKU DIGITAL TEXTBOOKS
      • URL: https://buku.app/login
      • Content: ALU e-textbooks and course-aligned resources
      • User Guide: Available on library website
      
      RESEARCH4LIFE
      • Free access to scientific research
      • User Guide Manual available
      
      LIBRARIKA (Physical Book Catalog)
      • Main Catalog: https://alu.librarika.com/
      • Search: https://alu.librarika.com/search/catalogs
      • Top Collections: https://alu.librarika.com/search/topCollections
      • New Arrivals: https://alu.librarika.com/search/newCollections
      
      ═══════════════════════════════════════════════════════════════
      FREE ACADEMIC RESOURCES
      ═══════════════════════════════════════════════════════════════
      
      • Google Scholar - scholar.google.com
      • Semantic Scholar - semanticscholar.org
      • DOAJ (Directory of Open Access Journals)
      • BASE (Bielefeld Academic Search Engine)
      • SSRN (Social Science Research Network)
      • ResearchGate
      • JSTOR Open
      • African Journals Online (AJOL)
      
      ═══════════════════════════════════════════════════════════════
      THEMATIC COLLECTIONS (Mission Pathway Kits)
      ═══════════════════════════════════════════════════════════════
      
      EDUCATION RESOURCE KIT
      • URL: https://library.alueducation.com/g-c-g-o/education
      • Content: Curated readings, videos, databases for education students
      
      HEALTH RESOURCE KIT
      • URL: https://library.alueducation.com/g-c-g-o/health
      • Content: Health texts, research databases, readings
      
      CLIMATE RESOURCE KIT
      • URL: https://library.alueducation.com/g-c-g-o/climate
      • Content: Climate, environment, sustainability literature
      
      GOVERNANCE RESOURCE KIT
      • URL: https://library.alueducation.com/g-c-g-o/governance
      • Content: Leadership, governance, public policy research
      
      ENTREPRENEURSHIP KIT
      • URL: https://library.alueducation.com/g-c-g-o
      • Content: Business, finance, entrepreneurship resources
      
      ═══════════════════════════════════════════════════════════════
      STUDENT SUCCESS TOOLS
      ═══════════════════════════════════════════════════════════════
      
      WRITING & CITATION SUPPORT
      • APA, MLA, Chicago, Harvard citation guides
      • Plagiarism tutorials
      • Citation managers
      
      RESEARCH CAPSTONES
      • Undergraduate Capstones: https://alu.librarika.com/search?publisher_id=2500038
      • Searchable repository of BEL/BSE capstones
      
      ALU PRESS
      • ALU-authored books and publications
      • Institutional outputs
      
      ═══════════════════════════════════════════════════════════════
      LIBRARY SERVICES
      ═══════════════════════════════════════════════════════════════
      
      📅 BOOK A RESEARCH OFFICE HOUR
      • 1:1 support with a librarian
      • Help with research, writing, or database use
      • Book via Google Calendar
      
      📖 BORROWING POLICY
      • Check library website for borrowing and renewal policies
      • Resource use guidelines available
      
      📆 LIBRARY EVENTS
      • Workshops
      • FireTalk sessions
      • Academic Integrity workshops
      • Literacy programs
      • Check: https://library.alueducation.com/events
      
      ═══════════════════════════════════════════════════════════════
      CONTACT THE LIBRARY
      ═══════════════════════════════════════════════════════════════
      
      • Library Homepage: https://library.alueducation.com/home
      • Contact/Team Page: https://library.alueducation.com/home/contact
      • Collections Overview: https://library.alueducation.com/what-we-provide
    `,
    keywords: ["library", "book", "database", "ebsco", "buku", "research", "journal", "article", "librarika", "capstone", "citation", "apa", "mla", "harvard", "reference", "study", "resources", "reading"],
    lastUpdated: "2024-12-01"
  },
  
  // Academic Policies
  {
    id: "academic-001",
    title: "Academic Calendar and Important Dates",
    category: "Academic Policies",
    content: `
      ALU Rwanda Academic Calendar 2024-2025:
      
      TERM 1 (September - December 2024):
      - Classes Begin: September 2, 2024
      - Add/Drop Deadline: September 13, 2024
      - Mid-term Assessments: October 14-18, 2024
      - Term Break: November 25-29, 2024 (Thanksgiving)
      - Final Assessments: December 9-13, 2024
      - Term Ends: December 13, 2024
      
      TERM 2 (January - April 2025):
      - Classes Begin: January 6, 2025
      - Add/Drop Deadline: January 17, 2025
      - Mid-term Assessments: February 17-21, 2025
      - Spring Break: March 10-14, 2025
      - Final Assessments: April 7-11, 2025
      - Term Ends: April 11, 2025
      
      TERM 3 (April - July 2025):
      - Classes Begin: April 21, 2025
      - Add/Drop Deadline: May 2, 2025
      - Mid-term Assessments: May 26-30, 2025
      - Final Assessments: July 7-11, 2025
      - Term Ends: July 11, 2025
      - Graduation Ceremony: July 18, 2025
      
      Important Registration Deadlines:
      - Course registration opens 2 weeks before term starts
      - Late registration incurs a fee of $50
      - Maximum course load: 5 courses per term
      - Minimum course load for full-time status: 3 courses
      
      Academic Standing Reviews:
      - Conducted at the end of each term
      - Students must maintain 2.0 GPA minimum
      - Academic probation triggered at GPA below 2.0
      - Academic dismissal after 2 consecutive terms on probation
    `,
    keywords: ["calendar", "dates", "schedule", "term", "semester", "registration", "deadline", "graduation", "assessment", "exam", "break", "holiday"],
    lastUpdated: "2024-08-15"
  },
  {
    id: "academic-002",
    title: "Grading System and GPA Calculation",
    category: "Academic Policies",
    content: `
      ALU Grading Scale:
      
      Letter Grade | Percentage | Grade Points | Description
      A+           | 97-100%    | 4.0          | Exceptional
      A            | 93-96%     | 4.0          | Excellent
      A-           | 90-92%     | 3.7          | Very Good
      B+           | 87-89%     | 3.3          | Good Plus
      B            | 83-86%     | 3.0          | Good
      B-           | 80-82%     | 2.7          | Above Average
      C+           | 77-79%     | 2.3          | Average Plus
      C            | 73-76%     | 2.0          | Average
      C-           | 70-72%     | 1.7          | Below Average
      D+           | 67-69%     | 1.3          | Poor Plus
      D            | 60-66%     | 1.0          | Poor
      F            | Below 60%  | 0.0          | Fail
      
      GPA Calculation Formula:
      GPA = Sum of (Grade Points × Credit Hours) / Total Credit Hours
      
      Example:
      Course A: A (4.0) × 3 credits = 12.0
      Course B: B+ (3.3) × 4 credits = 13.2
      Course C: B (3.0) × 3 credits = 9.0
      Total: 34.2 / 10 credits = 3.42 GPA
      
      Academic Standing:
      - Good Standing: GPA 2.0 or above
      - Dean's List: GPA 3.5 or above (full-time students)
      - Academic Probation: GPA below 2.0
      - Academic Dismissal: 2 consecutive terms below 2.0
      
      Grade Appeals:
      - Must be submitted within 10 business days of grade posting
      - Submit appeal form to Academic Affairs
      - Include specific grounds for appeal
      - Decision communicated within 15 business days
      
      Incomplete Grades (I):
      - Granted for documented emergencies
      - Must complete work within 30 days of next term
      - Converts to F if not completed
      
      Withdrawal (W):
      - No academic penalty
      - Must withdraw before 60% of term completed
      - Appears on transcript but not calculated in GPA
    `,
    keywords: ["grade", "gpa", "score", "percentage", "calculation", "standing", "dean's list", "probation", "appeal", "incomplete", "withdrawal", "credit"],
    lastUpdated: "2024-07-20"
  },
  {
    id: "academic-003",
    title: "Course Registration and Add/Drop Procedures",
    category: "Academic Policies",
    content: `
      Course Registration Process:
      
      1. Pre-Registration (2 weeks before term):
         - Log into Student Portal
         - Review available courses
         - Check prerequisites
         - Create tentative schedule
      
      2. Registration Period:
         - Opens based on class standing (seniors first)
         - Use Student Portal to officially register
         - Confirm course selections
         - Review tuition charges
      
      3. Add/Drop Period (first 2 weeks of term):
         - Add courses with available seats
         - Drop courses without penalty
         - No notation on transcript
         - Tuition adjustments processed
      
      Prerequisites and Corequisites:
      - System automatically checks prerequisites
      - Override requests submitted to Academic Affairs
      - Faculty advisor approval may be required
      
      Course Load:
      - Full-time: 12-18 credit hours
      - Part-time: Less than 12 credit hours
      - Overload (19+ credits): Requires Dean approval
      - Minimum for financial aid: 12 credit hours
      
      Waitlist Procedures:
      - Automatically added when course is full
      - Position maintained until registration closes
      - Notification sent when seat becomes available
      - 24 hours to accept or lose spot
      
      Late Registration:
      - Available first week of classes only
      - $50 late registration fee
      - Requires advisor approval
      
      Course Withdrawal:
      - After add/drop: Submit withdrawal form
      - Before 60% of term: W grade (no GPA impact)
      - After 60%: WF grade (counts as F in GPA)
      - Medical withdrawal: Documentation required
      
      Contact:
      - Registrar Office: registrar@alueducation.com
      - Academic Advising: advising@alueducation.com
      - Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
    `,
    keywords: ["registration", "add", "drop", "course", "enroll", "waitlist", "prerequisite", "credit", "schedule", "withdraw", "registrar"],
    lastUpdated: "2024-08-01"
  },
  
  // Financial Aid & Tuition
  {
    id: "financial-001",
    title: "Tuition, Fees, and Payment Plans",
    category: "Financial Aid",
    content: `
      ALU Rwanda Tuition and Fees 2024-2025:
      
      Undergraduate Programs:
      - Tuition per year: $9,850 USD
      - Tuition per term: $3,283 USD
      - Technology Fee: $200/year
      - Student Activity Fee: $150/year
      - Health Insurance: $400/year (required)
      
      Additional Fees:
      - Late Registration: $50
      - Late Payment: $100
      - Transcript Request: $10 (official)
      - Graduation Fee: $150
      - ID Card Replacement: $25
      
      Payment Options:
      
      1. Full Payment:
         - Pay entire year upfront
         - 5% discount applied
         - Due: August 15 (Fall) / January 5 (Spring)
      
      2. Semester Payment:
         - Pay per semester
         - Due before classes begin
         - No additional fees
      
      3. Monthly Payment Plan:
         - 10-month payment plan
         - $50 enrollment fee
         - Automatic bank debit
         - First payment due August 1
      
      Payment Methods:
      - Bank Transfer (preferred)
      - Credit/Debit Card (3% processing fee)
      - Mobile Money (MTN, Airtel)
      - Check (US banks only)
      
      Financial Holds:
      - Placed when balance exceeds $500
      - Prevents registration, transcripts, graduation
      - Removed within 48 hours of payment
      
      Refund Policy:
      - Before classes: 100% refund (minus fees)
      - Week 1: 90% refund
      - Week 2: 75% refund
      - Week 3: 50% refund
      - Week 4: 25% refund
      - After Week 4: No refund
      
      Contact:
      - Student Accounts: accounts@alueducation.com
      - Financial Aid: financialaid@alueducation.com
      - Phone: +250 788 123 456
    `,
    keywords: ["tuition", "fee", "payment", "cost", "price", "refund", "plan", "scholarship", "financial", "money", "pay", "bill", "account"],
    lastUpdated: "2024-07-15"
  },
  {
    id: "financial-002",
    title: "Scholarships and Financial Aid",
    category: "Financial Aid",
    content: `
      ALU Scholarship Programs:
      
      1. Merit Scholarships:
         - Academic Excellence Award: Up to 100% tuition
           * GPA 3.8+ required
           * Renewable annually with maintained GPA
         - Dean's Scholarship: 50% tuition
           * GPA 3.5+ required
           * Community service requirement
         - Leadership Award: 25-50% tuition
           * Demonstrated leadership experience
           * Essay and interview required
      
      2. Need-Based Aid:
         - ALU Grant: Up to 100% tuition
           * Based on family income
           * FAFSA-style application required
           * Renewable with continued need
         - Work-Study Program: $2,000-4,000/year
           * 10-15 hours/week on campus
           * Various positions available
      
      3. External Scholarships:
         - Mastercard Foundation Scholars Program
           * Full tuition, room, board
           * Leadership development
           * Career services support
         - African Development Bank Scholarship
         - Various country-specific scholarships
      
      Application Process:
      1. Complete FAFSA or ALU Financial Aid Application
      2. Submit required documents:
         - Tax returns (2 years)
         - Bank statements
         - Income verification
         - Personal statement
      3. Deadline: March 1 for following academic year
      4. Award notification: April 15
      
      Maintaining Scholarships:
      - Minimum GPA requirement (varies by scholarship)
      - Full-time enrollment
      - Satisfactory academic progress
      - Community service hours (some scholarships)
      
      Emergency Aid:
      - ALU Emergency Fund: Up to $1,000
      - For unexpected financial hardships
      - Apply through Student Affairs
      
      Contact:
      - Financial Aid Office: financialaid@alueducation.com
      - Scholarship Coordinator: scholarships@alueducation.com
      - Office Hours: Monday-Friday, 9:00 AM - 4:00 PM
    `,
    keywords: ["scholarship", "grant", "aid", "financial", "award", "merit", "need", "mastercard", "funding", "support", "money", "assistance"],
    lastUpdated: "2024-06-01"
  },
  
  // Student Life & Housing
  {
    id: "student-life-001",
    title: "Campus Housing and Accommodation",
    category: "Student Life",
    content: `
      ALU Rwanda Campus Housing:
      
      Residence Halls:
      
      1. Innovation Hall (First-Year Students):
         - Double occupancy rooms
         - Shared bathroom (4 students)
         - Study lounges on each floor
         - 24/7 security
         - Cost: $2,500/year
      
      2. Leadership Hall (Upperclassmen):
         - Single and double rooms available
         - Private bathroom (single) or shared (double)
         - Kitchen facilities
         - Cost: $3,000-3,500/year
      
      3. Graduate Housing:
         - Studio apartments
         - Full kitchen
         - Cost: $4,000/year
      
      Room Amenities:
      - Bed with mattress
      - Desk and chair
      - Wardrobe/closet
      - High-speed WiFi
      - Air conditioning
      - Laundry facilities (shared)
      
      Housing Application:
      - Opens: April 1 for returning students
      - Opens: May 1 for new students
      - Deadline: June 15
      - Deposit: $500 (applied to first payment)
      
      Roommate Selection:
      - Complete roommate questionnaire
      - Request specific roommate (mutual)
      - Random assignment if no preference
      
      Move-In Information:
      - Dates announced in August
      - Check-in at Residence Life Office
      - Bring: Bedding, toiletries, personal items
      - Provided: Furniture, WiFi, utilities
      
      Off-Campus Housing:
      - Assistance available through Student Affairs
      - Average rent: $200-500/month
      - Transportation considerations
      
      Housing Policies:
      - Quiet hours: 10 PM - 8 AM
      - Guest policy: Sign in required
      - No smoking on campus
      - Alcohol prohibited in residence halls
      
      Contact:
      - Residence Life: housing@alueducation.com
      - Emergency: +250 788 999 000
    `,
    keywords: ["housing", "dorm", "room", "accommodation", "residence", "hall", "roommate", "live", "stay", "campus", "apartment"],
    lastUpdated: "2024-05-15"
  },
  {
    id: "student-life-002",
    title: "Student Clubs and Organizations",
    category: "Student Life",
    content: `
      ALU Student Organizations:
      
      Academic & Professional:
      - Entrepreneurship Club
        * Weekly pitch sessions
        * Startup mentorship
        * Annual business plan competition
      - Tech & Innovation Society
        * Hackathons and coding workshops
        * Industry speaker series
      - Finance & Investment Club
        * Stock market simulations
        * Financial literacy workshops
      - Pre-Law Society
        * Mock trials
        * Law school preparation
      
      Cultural & Identity:
      - Pan-African Student Association
      - International Students Association
      - Women in Leadership
      - LGBTQ+ Alliance
      - Religious/Spiritual Groups
      
      Service & Advocacy:
      - Community Service Organization
        * Weekly volunteer opportunities
        * Service trips
      - Environmental Sustainability Club
      - Social Justice Coalition
      - Mental Health Awareness Group
      
      Arts & Recreation:
      - Drama & Theatre Club
      - Music Ensemble
      - Photography Club
      - Sports Clubs (Soccer, Basketball, Volleyball)
      - Dance Team
      - Chess Club
      
      Starting a New Club:
      1. Gather 10+ interested students
      2. Identify faculty/staff advisor
      3. Submit club proposal to Student Affairs
      4. Present to Student Government
      5. Approval process: 2-3 weeks
      
      Club Funding:
      - Annual budget allocation from Student Government
      - Fundraising permitted
      - Event sponsorship opportunities
      
      Leadership Opportunities:
      - President, Vice President, Treasurer, Secretary
      - Committee chairs
      - Event coordinators
      - Elections held each spring
      
      Contact:
      - Student Activities: activities@alueducation.com
      - Student Government: sga@alueducation.com
    `,
    keywords: ["club", "organization", "activity", "group", "society", "join", "volunteer", "sport", "culture", "leadership", "student government"],
    lastUpdated: "2024-04-20"
  },
  
  // Career Services
  {
    id: "career-001",
    title: "Career Development and Job Search Support",
    category: "Career Services",
    content: `
      ALU Career Development Center:
      
      Services Offered:
      
      1. Career Counseling:
         - One-on-one advising sessions
         - Career assessments (MBTI, Strong Interest)
         - Major/career exploration
         - Graduate school guidance
         - Book appointments via Student Portal
      
      2. Resume & Cover Letter Support:
         - Resume reviews (24-48 hour turnaround)
         - Cover letter templates
         - LinkedIn profile optimization
         - Portfolio development
      
      3. Interview Preparation:
         - Mock interviews (in-person/virtual)
         - Industry-specific coaching
         - Behavioral interview training
         - Salary negotiation workshops
      
      4. Job & Internship Search:
         - ALU Job Board (exclusive postings)
         - Handshake platform access
         - Company information sessions
         - Networking events
      
      Internship Program:
      - Required for graduation (minimum 8 weeks)
      - Credit-bearing option available
      - Placement assistance provided
      - Stipend information varies by company
      
      Employer Partnerships:
      - 200+ recruiting partners
      - Industries: Tech, Finance, Consulting, NGO, Government
      - On-campus recruiting events
      - Virtual career fairs
      
      Key Events:
      - Fall Career Fair: October
      - Spring Career Fair: February
      - Industry Networking Nights: Monthly
      - Alumni Panels: Quarterly
      
      Resources:
      - Career Resource Library
      - Industry guides
      - Salary databases
      - Company research tools
      
      Graduate Outcomes (Class of 2023):
      - 92% employed or in graduate school within 6 months
      - Average starting salary: $45,000
      - Top employers: Google, McKinsey, World Bank, Andela
      
      Contact:
      - Career Center: careers@alueducation.com
      - Appointments: Book via Student Portal
      - Drop-in Hours: Tuesday & Thursday, 2-4 PM
      - Location: Student Center, Room 201
    `,
    keywords: ["career", "job", "internship", "resume", "interview", "employment", "work", "hire", "recruit", "salary", "professional"],
    lastUpdated: "2024-08-10"
  },
  
  // Health & Wellness
  {
    id: "health-001",
    title: "Health Services and Counseling",
    category: "Health & Wellness",
    content: `
      ALU Health & Wellness Center:
      
      Medical Services:
      
      1. Campus Health Clinic:
         - Location: Student Center, Ground Floor
         - Hours: Monday-Friday, 8 AM - 6 PM
         - Saturday: 9 AM - 1 PM (emergencies)
         - Services:
           * General medical consultations
           * First aid and minor injuries
           * Vaccinations
           * Health screenings
           * Referrals to specialists
      
      2. Health Insurance:
         - Required for all students
         - ALU Student Health Plan: $400/year
         - Coverage includes:
           * Doctor visits
           * Emergency care
           * Prescriptions
           * Mental health services
           * Hospitalization
         - Waiver available with proof of equivalent coverage
      
      Mental Health Services:
      
      1. Counseling Center:
         - Free and confidential
         - Individual counseling
         - Group therapy sessions
         - Crisis intervention
         - Workshops on stress, anxiety, relationships
      
      2. Appointments:
         - Book via Student Portal
         - Same-day appointments for urgent needs
         - After-hours crisis line: +250 788 111 222
      
      3. Support Groups:
         - Anxiety & Stress Management
         - Grief and Loss
         - LGBTQ+ Support
         - International Student Adjustment
      
      Wellness Programs:
      - Fitness Center (free for students)
      - Yoga and meditation classes
      - Nutrition counseling
      - Sleep hygiene workshops
      - Substance abuse prevention
      
      Emergency Procedures:
      - Campus Emergency: +250 788 999 000
      - Ambulance: 912
      - Nearest Hospital: King Faisal Hospital (10 min)
      
      COVID-19 Protocols:
      - Testing available on campus
      - Vaccination encouraged
      - Isolation housing if needed
      
      Contact:
      - Health Center: health@alueducation.com
      - Counseling: counseling@alueducation.com
      - Emergency: +250 788 999 000
    `,
    keywords: ["health", "medical", "counseling", "mental", "wellness", "doctor", "clinic", "insurance", "emergency", "therapy", "stress", "anxiety"],
    lastUpdated: "2024-07-01"
  },
  
  // Technology & IT
  {
    id: "tech-001",
    title: "IT Services and Technical Support",
    category: "Technology",
    content: `
      ALU IT Services:
      
      Student Portal:
      - URL: portal.alueducation.com
      - Access: Course registration, grades, financial info
      - Mobile app available (iOS/Android)
      - Password reset: Self-service or IT Help Desk
      
      Campus WiFi:
      - Network: ALU-Student
      - Coverage: All campus buildings
      - Speed: 100 Mbps
      - Connection limit: 3 devices per student
      - Login: Student ID and password
      
      Email & Microsoft 365:
      - Email: firstname.lastname@alustudent.com
      - Full Microsoft 365 suite included
      - 1TB OneDrive storage
      - Teams for collaboration
      - Access continues 1 year after graduation
      
      Learning Management System (Canvas):
      - URL: canvas.alueducation.com
      - Course materials and assignments
      - Discussion forums
      - Grade tracking
      - Mobile app available
      
      Computer Labs:
      - Location: Library, 2nd Floor
      - Hours: 7 AM - 11 PM daily
      - 50 Windows PCs, 20 Macs
      - Printing: $0.05/page B&W, $0.25/page color
      - Software: Microsoft Office, Adobe Creative Suite, SPSS
      
      Laptop Requirements:
      - Recommended: 8GB RAM, 256GB SSD
      - Operating System: Windows 10/11 or macOS
      - Required software provided free
      - Loaner laptops available (limited)
      
      IT Help Desk:
      - Location: Library, Ground Floor
      - Hours: Monday-Friday, 8 AM - 8 PM
      - Saturday: 10 AM - 4 PM
      - Email: helpdesk@alueducation.com
      - Phone: +250 788 456 789
      - Response time: Within 24 hours
      
      Common Issues:
      - Password reset: Self-service portal
      - WiFi connection: Clear saved networks, reconnect
      - Email access: Check spam folder, verify login
      - Canvas issues: Clear browser cache
      
      Security:
      - Two-factor authentication required
      - VPN available for off-campus access
      - Report phishing: security@alueducation.com
    `,
    keywords: ["wifi", "internet", "email", "password", "computer", "laptop", "canvas", "portal", "login", "technology", "IT", "help desk", "software"],
    lastUpdated: "2024-08-05"
  }
];

// Fuzzy search helper - calculates similarity between strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Levenshtein distance for fuzzy matching
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : 1 - matrix[s1.length][s2.length] / maxLen;
}

// Multi-layer search algorithm
function searchArticles(query: string): HelpArticle[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  
  const scoredArticles = helpCenterArticles.map(article => {
    let score = 0;
    
    // Layer 1: Exact title match (highest priority)
    if (article.title.toLowerCase().includes(normalizedQuery)) {
      score += 100;
    }
    
    // Layer 2: Keyword exact match
    for (const keyword of article.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        score += 50;
      }
      // Fuzzy keyword match
      for (const word of queryWords) {
        const similarity = calculateSimilarity(word, keyword);
        if (similarity > 0.7) {
          score += similarity * 30;
        }
      }
    }
    
    // Layer 3: Content search
    const contentLower = article.content.toLowerCase();
    for (const word of queryWords) {
      const occurrences = (contentLower.match(new RegExp(word, 'g')) || []).length;
      score += occurrences * 5;
    }
    
    // Layer 4: Category match
    if (article.category.toLowerCase().includes(normalizedQuery)) {
      score += 25;
    }
    
    // Layer 5: Phrase matching
    if (contentLower.includes(normalizedQuery)) {
      score += 40;
    }
    
    // Layer 6: Semantic relevance (common question patterns)
    const questionPatterns: { [key: string]: string[] } = {
      'how': ['process', 'procedure', 'steps', 'guide'],
      'when': ['date', 'deadline', 'calendar', 'schedule'],
      'where': ['location', 'office', 'contact', 'address'],
      'cost': ['fee', 'tuition', 'payment', 'price', 'money'],
      'apply': ['application', 'submit', 'deadline', 'requirement'],
      'help': ['support', 'assistance', 'contact', 'service']
    };
    
    for (const [pattern, relatedWords] of Object.entries(questionPatterns)) {
      if (normalizedQuery.includes(pattern)) {
        for (const related of relatedWords) {
          if (contentLower.includes(related)) {
            score += 15;
          }
        }
      }
    }
    
    return { ...article, relevanceScore: score };
  });
  
  // Filter and sort by relevance
  return scoredArticles
    .filter(article => (article.relevanceScore || 0) > 10)
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, 5);
}

// Extract relevant snippets from content
function extractRelevantSnippet(content: string, query: string, maxLength: number = 500): string {
  const normalizedQuery = query.toLowerCase();
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  const lines = content.split('\n').filter(line => line.trim());
  
  // Find most relevant lines
  const scoredLines = lines.map(line => {
    let score = 0;
    const lineLower = line.toLowerCase();
    
    for (const word of queryWords) {
      if (lineLower.includes(word)) {
        score += 10;
      }
    }
    
    return { line, score };
  });
  
  // Get top relevant lines
  const relevantLines = scoredLines
    .filter(l => l.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(l => l.line.trim());
  
  if (relevantLines.length === 0) {
    // Return first meaningful content
    return lines.slice(0, 5).join('\n').substring(0, maxLength);
  }
  
  return relevantLines.join('\n').substring(0, maxLength);
}

// Main search function
export async function search(query: string): Promise<SearchResult> {
  const startTime = performance.now();
  
  const results = searchArticles(query);
  
  const endTime = performance.now();
  
  return {
    articles: results,
    query,
    totalResults: results.length,
    searchTime: Math.round(endTime - startTime)
  };
}

// Get article by ID
export function getArticleById(id: string): HelpArticle | undefined {
  return helpCenterArticles.find(article => article.id === id);
}

// Get all categories
export function getCategories(): string[] {
  return [...new Set(helpCenterArticles.map(article => article.category))];
}

// Get articles by category
export function getArticlesByCategory(category: string): HelpArticle[] {
  return helpCenterArticles.filter(
    article => article.category.toLowerCase() === category.toLowerCase()
  );
}

// Format search results for chat response
export function formatSearchResultsForChat(results: SearchResult): string {
  if (results.totalResults === 0) {
    return '';
  }
  
  let response = '';
  
  for (const article of results.articles.slice(0, 3)) {
    const snippet = extractRelevantSnippet(article.content, results.query, 300);
    response += `\n\n**${article.title}**\n${snippet}`;
  }
  
  return response;
}

// Check if query is help center related
export function isHelpCenterQuery(query: string): boolean {
  const helpKeywords = [
    'tuition', 'fee', 'payment', 'scholarship', 'financial aid',
    'registration', 'course', 'grade', 'gpa', 'calendar', 'deadline',
    'housing', 'dorm', 'room', 'accommodation',
    'career', 'job', 'internship', 'resume',
    'health', 'counseling', 'clinic', 'insurance',
    'wifi', 'email', 'password', 'portal', 'canvas',
    'club', 'organization', 'activity',
    'policy', 'procedure', 'how to', 'where is', 'when is'
  ];
  
  const queryLower = query.toLowerCase();
  return helpKeywords.some(keyword => queryLower.includes(keyword));
}

export const helpCenterService = {
  search,
  getArticleById,
  getCategories,
  getArticlesByCategory,
  formatSearchResultsForChat,
  isHelpCenterQuery
};

export default helpCenterService;

