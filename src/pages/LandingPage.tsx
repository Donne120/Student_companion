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

const COMPANION_LOGO = "/logo.png";

const HERO_IMAGE = "/campus.png";
const STUDY_IMAGE = "/study.png";
const CTA_IMAGE = "/news-sustainability.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [welcomeFading, setWelcomeFading] = useState(false);
  const [heroIn, setHeroIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 80);
    return () => clearTimeout(t);
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
            className="w-20 h-20 rounded-2xl object-cover mb-6"
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
        className={`sticky top-0 z-40 transition-all ${
          scrolled
            ? "bg-white/90 backdrop-blur border-b border-[#E8DDB0]"
            : "bg-transparent"
        }`}
      >
        <div className="h-1 w-full bg-[#D4AF37]" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-10 h-14 md:h-16 flex items-center justify-between safe-top">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={COMPANION_LOGO}
              alt="Student Companion AI logo"
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover flex-shrink-0"
            />
            <span className="font-semibold tracking-tight text-sm md:text-base truncate">
              Student Companion AI
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#1A1A1A] hover:bg-[#FBF7E9] hidden sm:inline-flex"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
            <Button
              size="sm"
              className="bg-[#1A1A1A] hover:bg-black text-white"
              onClick={() => navigate("/signup")}
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — full-bleed panorama as the thesis, copy composed over it */}
      <section className="relative overflow-hidden">
        <div className="relative h-[58vh] min-h-[480px] max-h-[660px] w-full">
          <img
            src={HERO_IMAGE}
            alt="Students walking across campus at golden hour"
            className="hero-kenburns absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B08] via-[#0D0B08]/45 to-[#0D0B08]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0B08]/70 via-[#0D0B08]/10 to-transparent" />

          <div className="relative h-full max-w-6xl mx-auto px-4 md:px-6 lg:px-10 flex flex-col justify-end pb-12 md:pb-14 lg:pb-16">
            <div className="max-w-2xl">
              <div
                className="hero-item inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[11px] md:text-xs font-medium text-[#F3E2B3] mb-5 md:mb-7"
                style={{ transitionDelay: "80ms" }}
                data-in={heroIn}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Trained on your university's own handbook, not the open web
              </div>
              <h1
                className="hero-item font-serif italic font-medium text-[34px] sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[0.98] tracking-tight text-white text-balance"
                style={{ transitionDelay: "180ms" }}
                data-in={heroIn}
              >
                Smarter learning,
                <br />
                <span className="not-italic font-black text-[#D4AF37]">
                  starts here.
                </span>
              </h1>
              <p
                className="hero-item mt-5 md:mt-6 text-base md:text-xl text-white/85 max-w-lg leading-relaxed"
                style={{ transitionDelay: "300ms" }}
                data-in={heroIn}
              >
                Your AI companion for every step of your university journey —
                from academics and campus life to graduation and beyond.
              </p>
              <div
                className="hero-item mt-7 md:mt-8 flex flex-col sm:flex-row gap-3"
                style={{ transitionDelay: "400ms" }}
                data-in={heroIn}
              >
                <Button
                  size="lg"
                  className="bg-[#D4AF37] hover:bg-[#E8C35C] text-[#1A1A1A] h-12 px-7 text-base font-semibold transition-transform hover:-translate-y-0.5"
                  onClick={() => navigate("/signup")}
                >
                  Get started — it's free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/5 backdrop-blur-sm border-white/30 hover:bg-white/15 text-white h-12 px-7 text-base transition-transform hover:-translate-y-0.5"
                  onClick={() => navigate("/login")}
                >
                  I already have an account
                </Button>
              </div>
              <p
                className="hero-item mt-5 md:mt-6 text-xs md:text-sm text-white/60"
                style={{ transitionDelay: "480ms" }}
                data-in={heroIn}
              >
                For students and staff with a verified university email.
              </p>
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
        @media (prefers-reduced-motion: reduce) {
          .hero-kenburns { animation: none; }
          .animate-float-card { animation: none; }
          .hero-item, [data-reveal] {
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
        <div className="max-w-2xl mb-16" data-reveal>
          <p className="text-sm uppercase tracking-widest text-[#B8941F] font-medium mb-4">
            What you can do
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-[#1A1A1A] tracking-tight text-balance">
            Built around the way students actually learn.
          </h2>
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
      <footer className="border-t border-[#E8DDB0]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/60">
            <img src={COMPANION_LOGO} alt="Student Companion AI" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
            <span>Student Companion AI</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/presentation.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[#1A1A1A]/60 hover:text-[#B8941F] transition-colors underline-offset-4 hover:underline"
            >
              Doc
            </a>
            <p className="text-xs text-[#1A1A1A]/50">
              © {new Date().getFullYear()} Student Companion AI. Built for students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
