import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Mail, MapPin } from "lucide-react";

const LOGO = "/logo.png";

const NAV_LINKS = [
  { id: "home",     label: "Home" },
  { id: "services", label: "Products & Services" },
  { id: "team",     label: "Team" },
  { id: "contact",  label: "Contact" },
];

const TEAM = [
  {
    name: "Andrew Steven Boima",
    role: "Founder & Project Lead",
    degree: "BSc (Hons) Entrepreneurial Leadership",
    bio: "Runs the institutional conversations. If you book a call, this is usually who picks up.",
  },
  {
    name: "Dieudonne Ngum",
    role: "Technical Development Lead",
    degree: "BSc (Hons) Software Engineering",
    bio: "Builds the retrieval side — the part that makes it cite a real document instead of inventing one.",
  },
  {
    name: "Marvin Mayonga Ogore",
    role: "Technical Supervisory Coach",
    degree: "Machine Learning Coach",
    bio: "Our ML coach. Mostly tells us when an approach won't survive contact with real data.",
  },
  {
    name: "Henry Chukwudi John",
    role: "Stakeholder Engagement Lead",
    degree: "Library & Information Services",
    bio: "Comes from library and information services, which is why we take document structure seriously.",
  },
  {
    name: "Ogbonna Ozioma Ikenna",
    role: "Customer Success & Implementation Lead",
    degree: "Customer Success",
    bio: "Handles setup once a campus signs on, and chases the documents nobody wants to hand over.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      const offsets = NAV_LINKS.map(({ id }) => {
        const el = sectionRefs.current[id];
        if (!el) return { id, top: Infinity };
        return { id, top: Math.abs(el.getBoundingClientRect().top - 80) };
      });
      const closest = offsets.reduce((a, b) => (a.top < b.top ? a : b));
      setActiveSection(closest.id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = sectionRefs.current[id];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const setRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  if (currentUser) return <Navigate to="/chat" replace />;

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans">

      {/* ── Sticky nav ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
          scrolled ? "bg-white border-b border-[#E8DDB0] shadow-sm" : "bg-white/80 backdrop-blur"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollTo("home")}
            className="flex items-center gap-2.5 group"
            aria-label="Back to top"
          >
            <img src={LOGO} alt="Student Companion AI" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-semibold text-sm tracking-tight text-[#1A1A1A]">
              Student Companion <span className="text-[#D4AF37]">AI</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === id
                    ? "text-[#1A1A1A] bg-[#F5F5F5]"
                    : "text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F5F5F5]/60"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* CTA + mobile menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:inline-flex text-sm font-medium text-[#1A1A1A]/70 hover:text-[#1A1A1A] px-3 py-1.5 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-sm font-medium bg-[#1A1A1A] hover:bg-[#333] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </button>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden ml-1 flex flex-col gap-[5px] p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-[#1A1A1A] transition-transform origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 w-5 bg-[#1A1A1A] transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-[#1A1A1A] transition-transform origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#E8DDB0] bg-white px-5 py-3">
            {NAV_LINKS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? "text-[#1A1A1A] bg-[#F5F5F5]"
                    : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                }`}
              >
                {label}
              </button>
            ))}
            <div className="mt-3 pt-3 border-t border-[#E8DDB0]">
              <button
                onClick={() => { setMenuOpen(false); navigate("/login"); }}
                className="w-full text-left px-3 py-2.5 text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HOME ── */}
      <section
        ref={setRef("home")}
        id="home"
        className="pt-32 pb-28 md:pt-40 md:pb-36 max-w-6xl mx-auto px-5 sm:px-8"
      >
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#B8941F] bg-[#FBF7E9] border border-[#E8DDB0] px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            Built at ALU · Kigali, Rwanda
          </div>
          <h1 className="text-[42px] sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] text-[#1A1A1A]">
            The answer is in{" "}
            <br className="hidden sm:block" />
            the handbook.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#1A1A1A]/60 leading-relaxed max-w-xl">
            Ask where the deferral form lives, or what your scholarship does if you drop a course.
            It reads your institution's actual policies and answers at two in the morning, when the registrar is closed.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#333] text-white text-sm font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Launch Companion
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTo("services")}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] text-sm font-medium px-6 py-3 rounded-lg border border-[#E8DDB0] transition-colors"
            >
              See how it works
            </button>
          </div>
          <p className="mt-6 text-xs text-[#1A1A1A]/40">
            In daily use by students at African Leadership University, Kigali.
          </p>
        </div>

        {/* Divider stat row */}
        <div className="mt-20 pt-10 border-t border-[#E8DDB0] grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { value: "500+", label: "Students active" },
            { value: "24 / 7", label: "Always available" },
            { value: "100%", label: "Source-cited answers" },
            { value: "< 2s", label: "Average response" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-[#1A1A1A]">{value}</div>
              <div className="mt-1 text-xs text-[#1A1A1A]/50 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS & SERVICES ── */}
      <section
        ref={setRef("services")}
        id="services"
        className="bg-[#FAFAFA] border-y border-[#E8DDB0]"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 md:py-32">
          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B8941F] mb-4">
              Products & Services
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] max-w-xl">
              Two ways we help students succeed.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Card 1 — Career Services */}
            <div className="bg-white border border-[#E8DDB0] rounded-2xl p-8 md:p-10 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center mb-7 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Career Services</h3>
              <p className="text-[#1A1A1A]/60 leading-relaxed mb-8">
                Guidance on internships, graduate opportunities, CV reviews, and career pathways — tailored to where ALU students actually end up. Connects you to real opportunities, not generic advice.
              </p>
              <ul className="space-y-3 mt-auto">
                {[
                  "Internship and job opportunity discovery",
                  "CV and cover letter guidance",
                  "Alumni network insights",
                  "Career pathway planning",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#1A1A1A]/70">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2 — Support Platform */}
            <div className="bg-[#1A1A1A] border border-[#1A1A1A] rounded-2xl p-8 md:p-10 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center mb-7 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Support Platform</h3>
              <p className="text-white/60 leading-relaxed mb-8">
                An AI assistant trained on your institution's actual documents — handbooks, academic calendars, policies. It answers from the source, cites the page, and escalates to a human when it should.
              </p>
              <ul className="space-y-3 mt-auto">
                {[
                  "Answers from your institution's own documents",
                  "Cites chapter and section for every response",
                  "Escalates edge cases to staff, never guesses",
                  "Available 24 / 7, no booking required",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10 pt-6 border-t border-white/10">
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#D4AF37] hover:text-[#F4D773] transition-colors"
                >
                  Try it now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* How it works strip */}
          <div className="mt-16 grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Connect your documents",
                body: "A handbook and an academic calendar. Setup takes about a day on our side.",
              },
              {
                step: "02",
                title: "Students ask, it answers",
                body: "Plain-language questions. Answers with the source cited, so students can verify before acting.",
              },
              {
                step: "03",
                title: "Edge cases go to humans",
                body: "Appeals, personal circumstances, anything policy can't cover — escalated, not guessed at.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-5">
                <span className="text-[11px] font-bold text-[#D4AF37] tabular-nums mt-0.5 flex-shrink-0">
                  {step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-1">{title}</p>
                  <p className="text-sm text-[#1A1A1A]/55 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section
        ref={setRef("team")}
        id="team"
        className="max-w-6xl mx-auto px-5 sm:px-8 py-24 md:py-32"
      >
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B8941F] mb-4">
            The Team
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] max-w-xl">
            Five people, most of us still enrolled.
          </h2>
          <p className="mt-4 text-[#1A1A1A]/55 max-w-lg leading-relaxed">
            We're building for a problem we had last semester, and some of us still have.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEAM.map(({ name, role, degree, bio }) => (
            <div
              key={name}
              className="group border border-[#E8DDB0] rounded-2xl p-7 hover:border-[#D4AF37]/60 hover:shadow-md transition-all duration-200 bg-white"
            >
              {/* Avatar placeholder — initials */}
              <div className="w-11 h-11 rounded-full bg-[#F5F5F5] border border-[#E8DDB0] flex items-center justify-center mb-5 flex-shrink-0">
                <span className="text-sm font-bold text-[#1A1A1A]/70">
                  {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
              </div>
              <p className="font-semibold text-[#1A1A1A] text-sm leading-snug">{name}</p>
              <p className="text-xs text-[#D4AF37] font-medium mt-1">{role}</p>
              <p className="text-xs text-[#1A1A1A]/40 mt-0.5 mb-4">{degree}</p>
              <p className="text-sm text-[#1A1A1A]/60 leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section
        ref={setRef("contact")}
        id="contact"
        className="bg-[#1A1A1A]"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20">

            {/* Left */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-4">
                Contact
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Half an hour, and you'll know if this is worth your time.
              </h2>
              <p className="mt-6 text-white/55 leading-relaxed max-w-sm">
                No slide deck. We'd rather load your handbook and let you try to break it.
              </p>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <a href="mailto:team@studentcompanionai.rw" className="hover:text-white transition-colors">
                    team@studentcompanionai.rw
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span>Kigali, Rwanda</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Book a demo session
                </button>
                <a
                  href="mailto:team@studentcompanionai.rw"
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/20 text-white text-sm font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Email the team
                </a>
              </div>
            </div>

            {/* Right — what to expect */}
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-6">
                How the call goes
              </p>
              {[
                {
                  n: "01",
                  title: "You bring the hard questions",
                  body: "The ones your front desk answers twenty times a week, and one nobody can ever find the answer to.",
                },
                {
                  n: "02",
                  title: "We point it at your documents",
                  body: "Usually a handbook and an academic calendar. This part takes about a day on our side.",
                },
                {
                  n: "03",
                  title: "You try to break it",
                  body: "If it makes something up, we want to see that happen in the demo rather than in March.",
                },
                {
                  n: "04",
                  title: "Costs, in writing",
                  body: "What it takes to run per year, what we'd need from your IT team, and what we can't do yet.",
                },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex gap-5 py-5 border-b border-white/8 last:border-0">
                  <span className="text-[11px] font-bold text-[#D4AF37] tabular-nums mt-0.5 flex-shrink-0">{n}</span>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{title}</p>
                    <p className="text-sm text-white/50 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-white/30 mt-2">
                Typically runs 30 minutes. Kigali time, but we'll work around your timezone.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img src={LOGO} alt="Student Companion AI" className="w-7 h-7 rounded-lg object-cover opacity-90" />
              <span className="text-sm text-white/50">Student Companion AI</span>
            </div>
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} Student Companion AI · Built for students.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
