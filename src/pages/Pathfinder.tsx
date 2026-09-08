/**
 * Pathfinder — free course & university guidance for high-school leavers.
 *
 * Public: no account, no login, no organization. Deliberately isolated from
 * the rest of the platform (see src/pathfinder/questions.ts for why).
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, ExternalLink, Loader, Send } from "lucide-react";
import { QUESTIONS, type Answers, type PathfinderReport } from "@/pathfinder/questions";
import { pathfinderService, PathfinderError } from "@/pathfinder/pathfinderService";

const LOGO = "/logo-icon.png";

type Phase = "form" | "loading" | "report" | "error";

const LOADING_LINES = [
  "Matching your subjects to entry requirements…",
  "Searching current programmes and intakes…",
  "Checking what these paths lead to…",
  "Building your report…",
];

export default function Pathfinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [report, setReport] = useState<PathfinderReport | null>(null);
  const [error, setError] = useState("");
  const [loadingLine, setLoadingLine] = useState(0);
  const paneRef = useRef<HTMLDivElement>(null);

  const question = QUESTIONS[step];
  const current = answers[question?.key];
  const answered = Array.isArray(current) ? current.length > 0 : !!current;

  // Scroll the question pane back to the top on each step — otherwise a long
  // question list leaves the next question scrolled halfway down.
  useEffect(() => {
    paneRef.current?.scrollTo({ top: 0 });
  }, [step, phase]);

  useEffect(() => {
    if (phase !== "loading") return;
    setLoadingLine(0);
    const id = setInterval(() => {
      setLoadingLine((n) => Math.min(n + 1, LOADING_LINES.length - 1));
    }, 1400);
    return () => clearInterval(id);
  }, [phase]);

  const pick = (option: string) => {
    setAnswers((prev) => {
      if (question.type === "multi") {
        const list = Array.isArray(prev[question.key]) ? [...(prev[question.key] as string[])] : [];
        const at = list.indexOf(option);
        if (at >= 0) list.splice(at, 1);
        else if (list.length < (question.max ?? 3)) list.push(option);
        return { ...prev, [question.key]: list };
      }
      return { ...prev, [question.key]: option };
    });
  };

  const submit = async () => {
    setPhase("loading");
    setError("");
    try {
      setReport(await pathfinderService.getRecommendations(answers));
      setPhase("report");
    } catch (e) {
      setError(
        e instanceof PathfinderError
          ? e.message
          : "Something went wrong. Please try again shortly."
      );
      setPhase("error");
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setReport(null);
    setError("");
    setPhase("form");
  };

  return (
    <div className="min-h-screen bg-[#F3EEDD] text-[#1A1A1A]">
      <div className="h-[3px] w-full bg-gradient-to-r from-[#B8941F] via-[#D4AF37] to-[#E8C35C]" />

      <header className="bg-[#FBF7E9]/90 backdrop-blur border-b border-[#E8DDB0]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
            <img src={LOGO} alt="" className="w-9 h-9 object-contain flex-shrink-0" />
            <span className="font-serif text-base md:text-lg tracking-tight truncate">
              Student Companion AI
            </span>
          </Link>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-7 md:mb-9">
          <p className="text-xs uppercase tracking-widest text-[#B8941F] font-semibold mb-2">
            Free · No account needed
          </p>
          <h1 className="font-serif text-3xl md:text-[2.75rem] leading-[1.08] tracking-tight text-balance max-w-2xl">
            Finishing school? Let's find the course that fits you.
          </h1>
          <p className="mt-3 text-[#5C5647] max-w-xl leading-relaxed">
            Answer six short questions. We'll suggest fields worth considering,
            real universities you can apply to, and where each path can lead.
          </p>
        </div>

        <div className="grid lg:grid-cols-[232px_1fr] gap-0 bg-white border border-[#E8DDB0] rounded-2xl overflow-hidden shadow-sm min-h-[560px]">
          {/* Progress rail */}
          <aside className="hidden lg:flex flex-col bg-[#1A1A1A] text-white p-6">
            <h2 className="font-serif text-xl mb-1">Pathfinder</h2>
            <p className="text-xs text-white/60 mb-6">Free guidance for school leavers</p>
            <ol className="space-y-1">
              {QUESTIONS.map((q, i) => {
                const done = i < step || phase === "report";
                const now = i === step && phase === "form";
                return (
                  <li
                    key={q.key}
                    className={`flex items-start gap-3 py-1.5 text-[12.5px] ${
                      now ? "text-white font-semibold" : done ? "text-white/80" : "text-white/45"
                    }`}
                  >
                    <span
                      className={`w-[21px] h-[21px] flex-none rounded-full grid place-items-center text-[10.5px] tabular-nums border ${
                        done
                          ? "bg-[#D4AF37] border-[#D4AF37] text-[#1A1A1A] font-bold"
                          : now
                          ? "border-[#D4AF37] text-[#D4AF37]"
                          : "border-white/25"
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span>{q.label}</span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-auto pt-4 border-t border-white/10 text-[11px] text-white/40">
              Takes about 3 minutes.
              <br />
              Nothing is saved unless you ask us to contact you.
            </p>
          </aside>

          {/* Pane. Fixed height + inner scroll so the action bar is always
              reachable no matter how many options a question has. */}
          <section className="flex flex-col min-h-0 overflow-hidden lg:h-[560px]">
            {phase === "form" && (
              <>
                <div ref={paneRef} className="flex-1 overflow-y-auto min-h-0 px-6 md:px-8 pt-7 pb-4">
                  <p className="text-[11px] uppercase tracking-[0.09em] text-[#B8941F] font-bold">
                    Question {step + 1} of {QUESTIONS.length}
                  </p>
                  <h3 className="font-serif text-2xl md:text-[1.65rem] leading-tight mt-2 mb-1.5 text-balance">
                    {question.prompt}
                  </h3>
                  <p className="text-[12.5px] text-[#6B6355] mb-5">{question.why}</p>

                  <div className="grid gap-2">
                    {question.options.map((opt) => {
                      const selected = Array.isArray(current)
                        ? current.includes(opt)
                        : current === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => pick(opt)}
                          aria-pressed={selected}
                          className={`text-left flex items-center gap-3 rounded-[10px] border px-3.5 py-3 transition-colors ${
                            selected
                              ? "border-[#B8941F] bg-[#FBF7E9]"
                              : "border-[#E8DDB0] bg-white hover:border-[#D4AF37] hover:bg-[#FFFDF6]"
                          }`}
                        >
                          <span
                            className={`w-[17px] h-[17px] flex-none rounded-[5px] border-[1.5px] grid place-items-center ${
                              selected ? "bg-[#D4AF37] border-[#D4AF37]" : "border-[#E8DDB0]"
                            }`}
                          >
                            {selected && <Check className="h-3 w-3 text-[#1A1A1A]" />}
                          </span>
                          <span className="text-[13.5px]">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-none border-t border-[#E8DDB0] bg-white px-6 md:px-8 py-3.5 flex items-center gap-2.5">
                  {step > 0 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="text-[13.5px] font-semibold px-4 py-2.5 rounded-[9px] border border-[#E8DDB0] hover:bg-[#FBF7E9]"
                    >
                      Back
                    </button>
                  )}
                  <button
                    disabled={!answered}
                    onClick={() => (step === QUESTIONS.length - 1 ? submit() : setStep((s) => s + 1))}
                    className="text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[9px] bg-[#1A1A1A] text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {step === QUESTIONS.length - 1 ? "See my options" : "Continue"}
                  </button>
                  {question.type === "multi" && (
                    <span className="ml-auto text-xs text-[#6B6355] tabular-nums">
                      {(Array.isArray(current) ? current.length : 0)} of {question.max} chosen
                    </span>
                  )}
                </div>
              </>
            )}

            {phase === "loading" && (
              <div className="flex-1 grid place-items-center px-6 text-center">
                <div>
                  <Loader className="h-6 w-6 animate-spin text-[#B8941F] mx-auto mb-4" />
                  <p className="text-[13.5px] text-[#6B6355]">{LOADING_LINES[loadingLine]}</p>
                </div>
              </div>
            )}

            {phase === "error" && (
              <div className="flex-1 grid place-items-center px-6 text-center">
                <div className="max-w-sm">
                  <h3 className="font-serif text-xl mb-2">We couldn't build your report</h3>
                  <p className="text-[13.5px] text-[#6B6355] mb-5">{error}</p>
                  <button
                    onClick={submit}
                    className="text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[9px] bg-[#1A1A1A] text-white hover:bg-black"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {phase === "report" && report && (
              <div ref={paneRef} className="flex-1 overflow-y-auto min-h-0 px-6 md:px-8 py-7">
                <Report report={report} answers={answers} onRestart={restart} />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

// ── Report ───────────────────────────────────────────────────────────────────

function Report({
  report,
  answers,
  onRestart,
}: {
  report: PathfinderReport;
  answers: Answers;
  onRestart: () => void;
}) {
  return (
    <>
      <h3 className="font-serif text-[1.45rem] leading-tight text-balance">{report.headline}</h3>
      <p className="text-[13px] text-[#6B6355] mt-1 mb-5">{report.summary}</p>

      <SectionLabel>Fields that fit you</SectionLabel>
      {report.fields.map((f, i) => (
        <div
          key={f.name}
          className={`rounded-[11px] border p-3.5 mb-2.5 ${
            i === 0 ? "border-[#E8DDB0] border-l-4 border-l-[#D4AF37] bg-[#FFFDF6]" : "border-[#E8DDB0] bg-white"
          }`}
        >
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-semibold text-[14.5px]">{f.name}</span>
            <span className="text-[11.5px] text-[#6B6355]">{f.strength}</span>
          </div>
          <p className="text-[13px] text-[#3C372E] mt-1.5 leading-relaxed">{f.reason}</p>
          {f.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {f.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11.5px] px-2.5 py-1 rounded-full bg-[#FBF7E9] border border-[#E8DDB0] text-[#4A4437]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      <SectionLabel>Where you could study</SectionLabel>
      {report.schools.map((s) => (
        <div key={`${s.name}-${s.programme}`} className="rounded-[11px] border border-[#E8DDB0] bg-white p-3.5 mb-2.5">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-semibold text-[14.5px]">{s.name}</span>
            <span className="text-[11.5px] text-[#6B6355]">
              {[s.location, s.kind].filter(Boolean).join(" · ")}
            </span>
          </div>
          <p className="text-[13px] text-[#3C372E] mt-1.5 leading-relaxed">
            <span className="font-medium">{s.programme}</span>
            {s.detail ? ` — ${s.detail}` : ""}
          </p>
          {s.url && (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#B8941F] hover:underline underline-offset-4 mt-2.5"
            >
              Open the university's page
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      ))}

      <SectionLabel>What this could make you</SectionLabel>
      <div className="rounded-[11px] border border-[#E8DDB0] bg-white p-3.5">
        <p className="text-[13px] text-[#3C372E] leading-relaxed">{report.careers.summary}</p>
        {report.careers.roles?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {report.careers.roles.map((r) => (
              <span
                key={r}
                className="text-[11.5px] px-2.5 py-1 rounded-full bg-[#FBF7E9] border border-[#E8DDB0] text-[#4A4437]"
              >
                {r}
              </span>
            ))}
          </div>
        )}
      </div>

      <LeadForm answers={answers} report={report} />

      <div className="mt-4 pt-3 border-t border-[#E8DDB0] flex items-center gap-3 flex-wrap">
        <p className="text-[11.5px] text-[#6B6355] flex-1 min-w-[240px]">
          This is guidance, not an admissions decision. Always confirm fees, deadlines and entry
          requirements on the university's own page before you apply.
        </p>
        <button onClick={onRestart} className="text-[12px] font-medium text-[#B8941F] hover:underline underline-offset-4">
          Start over
        </button>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] uppercase tracking-[0.09em] text-[#B8941F] font-bold mt-5 mb-2.5">
      {children}
    </p>
  );
}

// ── Lead form ────────────────────────────────────────────────────────────────

function LeadForm({ answers, report }: { answers: Answers; report: PathfinderReport }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErr("");
    try {
      await pathfinderService.submitLead({ name, email, phone, message }, answers, report);
      setSent(true);
    } catch (e2) {
      setErr(
        e2 instanceof PathfinderError ? e2.message : "We couldn't send that. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-5 rounded-xl border border-[#D4AF37] bg-[#FBF7E9] p-4">
        <h4 className="font-semibold text-[14.5px] mb-1 flex items-center gap-2">
          <Check className="h-4 w-4 text-[#B8941F]" />
          We've got your details
        </h4>
        <p className="text-[12.5px] text-[#6B6355]">
          Someone will get in touch to help you take the next step. Keep this report — you can
          screenshot it or leave the page open.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="mt-5 rounded-xl border border-[#D4AF37] bg-[#FBF7E9] p-4">
      <h4 className="font-semibold text-[14.5px] mb-1">Want to talk to a real person?</h4>
      <p className="text-[12.5px] text-[#6B6355] mb-3.5">
        Leave your details and we'll get back to you — to answer questions, or to connect you with
        someone from a university who can advise you properly. It's free.
      </p>

      <div className="grid sm:grid-cols-2 gap-2.5">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full text-[13.5px] px-3 py-2.5 rounded-[9px] border border-[#E8DDB0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full text-[13.5px] px-3 py-2.5 rounded-[9px] border border-[#E8DDB0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
        />
      </div>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone or WhatsApp (optional)"
        className="w-full text-[13.5px] px-3 py-2.5 rounded-[9px] border border-[#E8DDB0] bg-white mt-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        maxLength={600}
        placeholder="Anything you'd like us to know? (optional)"
        className="w-full text-[13.5px] px-3 py-2.5 rounded-[9px] border border-[#E8DDB0] bg-white mt-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
      />

      {err && <p className="text-[12.5px] text-red-700 mt-2">{err}</p>}

      <button
        type="submit"
        disabled={sending}
        className="mt-3 inline-flex items-center gap-2 text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[9px] bg-[#1A1A1A] text-white hover:bg-black disabled:opacity-50"
      >
        {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {sending ? "Sending…" : "Send my details"}
      </button>
      <p className="text-[11px] text-[#6B6355] mt-2.5">
        We use this only to contact you about your studies. Your answers are included so we can help
        properly.
      </p>
    </form>
  );
}
