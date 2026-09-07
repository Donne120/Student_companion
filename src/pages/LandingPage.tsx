import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  GraduationCap,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const COMPANION_LOGO = "/logo-icon.png";

const HERO_IMAGE = "/news-leadership.png";
const FEATURE_IMAGE = "/news-tech.png";
const STUDY_IMAGE = "/study.png";
const CTA_IMAGE = "/news-sustainability.png";

const DEMO_MESSAGES = [
  { from: "student", text: "When is the add/drop deadline for this term?" },
  {
    from: "companion",
    text: "Add/drop closes Friday, Sept 12 at 11:59pm. After that, withdrawals go through the Registrar with a W grade.",
  },
  { from: "student", text: "Where do I submit the withdrawal form?" },
  {
    from: "companion",
    text: "Student Portal → Academic Records → Withdrawal Request. Your advisor is auto-notified once submitted.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [welcomeFading, setWelcomeFading] = useState(false);
  const [heroIn, setHeroIn] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Play the demo conversation in on load, one bubble at a time
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setVisibleMessages(DEMO_MESSAGES.length);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    DEMO_MESSAGES.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleMessages((v) => Math.max(v, i + 1)), 900 + i * 950)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Reveal-on-scroll for below-the-fold sections
  useEffect(() => {
    const targets = document.querySelectorAll("[data-reveal]");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Welcome animation: show for 2.4s then fade out
  useEffect(() => {
    const fadeTimer = setTimeout(() => setWelcomeFading(true), 2400);
    const hideTimer = setTimeout(() => setWelcomeVisible(false), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (currentUser) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">

      {/* Welcome splash animation */}
      {welcomeVisible && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A1A1A]"
          style={{
            transition: "opacity 0.6s ease",
            opacity: welcomeFading ? 0 : 1,
            pointerEvents: welcomeFading ? "none" : "auto",
          }}
        >
          <img
            src={COMPANION_LOGO}
            alt="Student Companion AI"
            className="w-16 h-16 object-contain mb-6"
            style={{
              animation: "welcomeLogo 0.6s ease forwards",
            }}
          />
          <p
            className="text-white font-serif text-2xl md:text-3xl tracking-wide"
            style={{
              animation: "welcomeText 0.8s ease 0.3s both",
            }}
          >
            Welcome to{" "}
            <span className="text-[#D4AF37]">Student Companion AI</span>
          </p>
          <style>{`
            @keyframes welcomeLogo {
              from { opacity: 0; transform: scale(0.7); }
              to   { opacity: 1; transform: scale(1); }
            }
            @keyframes welcomeText {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* Top nav */}
      <header
        className={`sticky top-0 z-40 bg-[#FBF7E9]/90 backdrop-blur transition-shadow ${
          scrolled ? "shadow-sm border-b border-[#E8DDB0]" : "border-b border-transparent"
        }`}
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-[#B8941F] via-[#D4AF37] to-[#E8C35C]" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-10 h-16 md:h-[4.5rem] flex items-center justify-between safe-top">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <img
              src={COMPANION_LOGO}
              alt="Student Companion AI logo"
              className="w-9 h-9 md:w-10 md:h-10 object-contain flex-shrink-0 transition-transform group-hover:scale-105"
            />
            <span className="font-serif text-base md:text-lg text-[#1A1A1A] tracking-tight truncate">
              Student Companion AI
            </span>
          </button>
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#1A1A1A]/80 hover:text-[#1A1A1A] hover:bg-white/60 hidden sm:inline-flex"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
            <Button
              size="sm"
              className="bg-[#1A1A1A] hover:bg-black text-white shadow-sm"
              onClick={() => navigate("/signup")}
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — lecture hall as the thesis, live product demo as the proof */}
      <section className="relative bg-[#FBF7E9] overflow-hidden">
        <div className="absolute inset-0 hero-grain pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-10 pt-10 md:pt-16 lg:pt-20 pb-16 md:pb-20 lg:pb-24">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
            {/* Copy + photo */}
            <div>
              <div
                className="hero-item inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8DDB0] text-[11px] md:text-xs font-medium text-[#B8941F] mb-6"
                style={{ transitionDelay: "80ms" }}
                data-in={heroIn}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Trained on your university's own handbook
              </div>
              <h1
                className="hero-item font-serif text-[34px] sm:text-5xl md:text-[3.4rem] lg:text-[3.8rem] leading-[1.03] tracking-tight text-[#1A1A1A] text-balance"
                style={{ transitionDelay: "180ms" }}
                data-in={heroIn}
              >
                Every deadline, policy and
                <br className="hidden lg:block" /> office hour —
                <span className="italic text-[#B8941F]"> one question away.</span>
              </h1>
              <p
                className="hero-item mt-6 text-base md:text-lg text-[#1A1A1A]/70 max-w-md leading-relaxed"
                style={{ transitionDelay: "300ms" }}
                data-in={heroIn}
              >
                Student Companion AI answers from your own university's
                handbook and records — not a guess from the open web.
              </p>
              <div
                className="hero-item mt-8 flex flex-col sm:flex-row gap-3"
                style={{ transitionDelay: "400ms" }}
                data-in={heroIn}
              >
                <Button
                  size="lg"
                  className="bg-[#1A1A1A] hover:bg-black text-white h-12 px-7 text-base font-semibold transition-transform hover:-translate-y-0.5"
                  onClick={() => navigate("/signup")}
                >
                  Get started — it's free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white border-[#E8DDB0] hover:bg-[#FBF7E9] text-[#1A1A1A] h-12 px-7 text-base transition-transform hover:-translate-y-0.5"
                  onClick={() => navigate("/login")}
                >
                  I already have an account
                </Button>
              </div>

              <div
                className="hero-item mt-10 relative rounded-2xl overflow-hidden shadow-xl"
                style={{ transitionDelay: "500ms" }}
                data-in={heroIn}
              >
                <img
                  src={HERO_IMAGE}
                  alt="A student speaking to a full lecture hall"
                  className="w-full h-56 md:h-64 object-cover object-[50%_20%]"
                  loading="eager"
                />
                <div className="absolute top-0 left-0 h-1 w-full bg-[#D4AF37]" />
              </div>
            </div>

            {/* Live product demo */}
            <div
              className="hero-item"
              style={{ transitionDelay: "260ms" }}
              data-in={heroIn}
            >
              <div className="relative rounded-2xl bg-white border border-[#E8DDB0] shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E8DDB0] bg-[#FBF7E9]">
                  <img
                    src={COMPANION_LOGO}
                    alt=""
                    className="w-6 h-6 rounded-md object-cover"
                  />
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    Student Companion AI
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 text-[11px] text-[#1A1A1A]/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
                <div className="p-4 md:p-5 space-y-3 min-h-[340px] md:min-h-[380px]">
                  {DEMO_MESSAGES.map((msg, i) => (
                    <div
                      key={i}
                      className={`demo-bubble ${msg.from === "student" ? "flex justify-end" : "flex justify-start"}`}
                      data-shown={i < visibleMessages}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.from === "student"
                            ? "bg-[#1A1A1A] text-white rounded-br-sm"
                            : "bg-[#FBF7E9] border border-[#E8DDB0] text-[#1A1A1A] rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {visibleMessages > 0 && visibleMessages < DEMO_MESSAGES.length && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-sm bg-[#FBF7E9] border border-[#E8DDB0] px-4 py-3 flex gap-1">
                        <span className="typing-dot" />
                        <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                        <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-4 md:px-5 pb-4 md:pb-5">
                  <div className="flex items-center gap-2 rounded-full border border-[#E8DDB0] bg-[#FBF7E9]/60 px-4 py-2.5 text-sm text-[#1A1A1A]/40">
                    Ask about deadlines, policies, courses…
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1) translate3d(0,0,0); }
          100% { transform: scale(1.08) translate3d(-1%,-1%,0); }
        }
        .hero-kenburns {
          animation: kenburns 18s ease-out forwards;
        }
        .hero-item {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .hero-item[data-in="true"] {
          opacity: 1;
          transform: translateY(0);
        }
        [data-reveal] {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        [data-reveal].is-revealed {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .animate-float-card {
          animation: floatCard 5s ease-in-out infinite;
        }
        .hero-grain {
          background-image: radial-gradient(#1A1A1A 0.5px, transparent 0.5px);
          background-size: 18px 18px;
          opacity: 0.04;
        }
        .demo-bubble {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .demo-bubble[data-shown="true"] {
          opacity: 1;
          transform: translateY(0);
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #B8941F;
          opacity: 0.5;
          animation: typingDot 1s ease-in-out infinite;
        }
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30%           { opacity: 1; transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-kenburns { animation: none; }
          .animate-float-card { animation: none; }
          .typing-dot { animation: none; }
          .hero-item, [data-reveal], .demo-bubble {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Stat strip */}
      <section className="border-b border-[#E8DDB0] bg-[#FBF7E9]/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "24/7", label: "Instant answers" },
            { value: "100%", label: "From your handbook" },
            { value: "0", label: "Generic web answers" },
            { value: "1", label: "Companion, your campus" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              data-reveal
              style={{ transitionDelay: `${i * 90}ms` }}
              className="transition-transform hover:-translate-y-1"
            >
              <div className="font-serif text-3xl md:text-4xl text-[#1A1A1A]">{stat.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-[#1A1A1A]/60">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-end mb-16">
          <div data-reveal>
            <p className="text-sm uppercase tracking-widest text-[#B8941F] font-medium mb-4">
              What you can do
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-[#1A1A1A] tracking-tight text-balance">
              Built around the way students actually work.
            </h2>
          </div>
          <div
            className="relative rounded-2xl overflow-hidden shadow-lg hidden lg:block"
            data-reveal
            style={{ transitionDelay: "100ms" }}
          >
            <img
              src={FEATURE_IMAGE}
              alt="Students collaborating around laptops in a study space"
              className="w-full h-40 object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: "Academic resources",
              body: "Course materials, grading policies, academic calendars and graduation pathways — answered instantly.",
            },
            {
              icon: Compass,
              title: "Campus navigation",
              body: "Find the right department, contact or service across your campus without the runaround.",
            },
            {
              icon: MessageSquare,
              title: "Quick answers",
              body: "Policies, procedures, deadlines — get clarity in seconds, with context from your conversation history.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              data-reveal
              style={{ transitionDelay: `${i * 120}ms` }}
              className="group p-8 rounded-2xl border border-[#E8DDB0] bg-white hover:border-[#D4AF37] hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FBF7E9] border border-[#E8DDB0] flex items-center justify-center mb-6 group-hover:bg-[#D4AF37] transition-colors">
                <Icon className="h-5 w-5 text-[#B8941F] group-hover:text-[#1A1A1A]" />
              </div>
              <h3 className="font-serif text-2xl text-[#1A1A1A] mb-3">{title}</h3>
              <p className="text-[#1A1A1A]/70 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Split image feature */}
      <section className="bg-[#FBF7E9]/40 border-y border-[#E8DDB0]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative" data-reveal>
            <div className="overflow-hidden rounded-3xl aspect-[5/4] shadow-xl">
              <img
                src={STUDY_IMAGE}
                alt="Students studying together on campus"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="hidden md:block absolute -bottom-6 -right-6 bg-white border border-[#E8DDB0] rounded-2xl p-5 shadow-lg max-w-xs animate-float-card">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-xs uppercase tracking-wider text-[#1A1A1A]/60 font-medium">
                  Deadlines
                </span>
              </div>
              <p className="text-sm text-[#1A1A1A]">
                "When is the registration deadline for the next term?"
              </p>
              <p className="mt-2 text-xs text-[#1A1A1A]/60">Answered in 1.2s</p>
            </div>
          </div>

          <div data-reveal style={{ transitionDelay: "120ms" }}>
            <p className="text-sm uppercase tracking-widest text-[#B8941F] font-medium mb-4">
              Always on
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-[#1A1A1A] tracking-tight leading-tight text-balance">
              Knowledge of your university's entire handbook, ready when you need it.
            </h2>
            <p className="mt-6 text-lg text-[#1A1A1A]/70 leading-relaxed">
              No more digging through PDFs or waiting for office hours. Ask in
              plain English. Get a clear, sourced answer — at 2pm or 2am.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Academic policies and graduation requirements",
                "Department contacts and campus services",
                "Course descriptions and learning resources",
                "Events, deadlines and important dates",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span className="text-[#1A1A1A]/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-24" data-reveal>
        <div className="relative overflow-hidden rounded-3xl bg-[#1A1A1A] text-white p-10 md:p-16">
          <div className="absolute inset-0 opacity-25">
            <img
              src={CTA_IMAGE}
              alt="A modern, sustainable university residence building"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/80 to-[#1A1A1A]/20" />
          <div className="absolute top-0 left-0 h-1 w-full bg-[#D4AF37]" />
          <div className="relative max-w-2xl">
            <GraduationCap className="h-10 w-10 text-[#D4AF37] mb-6" />
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight text-balance">
              Start your journey with the Companion today.
            </h2>
            <p className="mt-6 text-lg text-white/80 leading-relaxed">
              Free for every student. Sign up with your university email and
              start asking questions in under a minute.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] h-12 px-7 text-base font-medium"
                onClick={() => navigate("/signup")}
              >
                Create your account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 hover:bg-white/10 text-white h-12 px-7 text-base"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 pb-10">
          <div className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-10 md:gap-12 pb-12 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img
                  src={COMPANION_LOGO}
                  alt="Student Companion AI logo"
                  className="w-9 h-9 object-contain"
                />
                <span className="font-serif text-lg">Student Companion AI</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed max-w-xs">
                An AI companion trained on your own university's handbook —
                built to give every student a straight answer, day or night.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-white/40 font-medium mb-4">
                Product
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    onClick={() => navigate("/signup")}
                    className="text-white/70 hover:text-[#D4AF37] transition-colors"
                  >
                    Get started
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-white/70 hover:text-[#D4AF37] transition-colors"
                  >
                    Sign in
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-white/40 font-medium mb-4">
                Resources
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="/presentation.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-[#D4AF37] transition-colors"
                  >
                    Product overview
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Student Companion AI. Built for students.
            </p>
            <p className="text-xs text-white/40">
              Made for universities, one campus at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
