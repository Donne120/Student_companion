/**
 * Pathfinder — free guidance for high-school leavers (course and university)
 * and for university students and recent graduates (internships, jobs,
 * scholarships, fellowships, funding and competitions). One first question
 * picks the route; see src/pathfinder/questions.ts.
 *
 * Public: no account, no login, no organization. Deliberately isolated from
 * the rest of the platform (see src/pathfinder/questions.ts for why).
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, CalendarClock, Check, ChevronDown, ExternalLink, Loader, MessageCircle, Send } from "lucide-react";
import {
  questionsFor,
  stageOf,
  isUndergradReport,
  NOTE_KEY,
  NOTE_MAX,
  type AnyReport,
  type Answers,
  type PathfinderReport,
  type UndergradReport,
} from "@/pathfinder/questions";
import { pathfinderService, PathfinderError, rememberSource, type LeadResult, type LeadLinks } from "@/pathfinder/pathfinderService";
import { SchoolPicker, type PickedSchool } from "@/pathfinder/SchoolPicker";
import { WHATSAPP_CHANNEL, reportMessage, toWhatsAppNumber, whatsAppLink } from "@/pathfinder/whatsapp";

const LOGO = "/logo-icon.png";

type Phase = "form" | "loading" | "report" | "error";

const LOADING_LINES = [
  "Matching your subjects to entry requirements…",
  "Searching current programmes and intakes…",
  "Checking what these paths lead to…",
  "Building your report…",
];
const LOADING_LINES_UNDERGRAD = [
  "Checking which opportunities are open now…",
  "Matching them to your year and field…",
  "Working out the skills that would help most…",
  "Building your report…",
];

export default function Pathfinder() {
  // Credit requests to the campaign link the student arrived from.
  useEffect(() => rememberSource(), []);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  // The school step: picked from the suggestions (with an id) or typed.
  const [school, setSchool] = useState<PickedSchool | null>(null);
  // The undergraduate route's university step, the same way.
  const [university, setUniversity] = useState<PickedSchool | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [report, setReport] = useState<AnyReport | null>(null);
  const [error, setError] = useState("");
  const [loadingLine, setLoadingLine] = useState(0);
  const paneRef = useRef<HTMLDivElement>(null);

  // The questions for the route chosen at the first question.
  const questions = questionsFor(answers);
  const undergrad = stageOf(answers) === "undergraduate";
  const loadingLines = undergrad ? LOADING_LINES_UNDERGRAD : LOADING_LINES;
  const question = questions[step];
  const current = answers[question?.key];
  const typed = question?.type === "school" || question?.type === "university";
  // The school and university steps are optional: Continue (or Skip) is always available.
  const answered = typed || (Array.isArray(current) ? current.length > 0 : !!current);
  const last = step === questions.length - 1;

  // Scroll the question pane back to the top on each step — otherwise a long
  // question list leaves the next question scrolled halfway down.
  useEffect(() => {
    paneRef.current?.scrollTo({ top: 0 });
  }, [step, phase]);

  useEffect(() => {
    if (phase !== "loading") return;
    setLoadingLine(0);
    const id = setInterval(() => {
      setLoadingLine((n) => Math.min(n + 1, LOADING_LINES_UNDERGRAD.length - 1));
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
      if (question.key === "stage" && prev.stage !== option) {
        // A different route: its questions differ, so start them afresh
        // (keeping the country, which both routes ask).
        setSchool(null);
        setUniversity(null);
        return prev.country ? { stage: option, country: prev.country } : { stage: option };
      }
      if (question.key === "country" && prev.country !== option) {
        // A different country: the school picked for the old one no longer applies.
        setSchool(null);
        setUniversity(null);
        const { school: _dropped, university: _alsoDropped, ...rest } = prev;
        return { ...rest, [question.key]: option };
      }
      return { ...prev, [question.key]: option };
    });
  };

  const pickSchool = (s: PickedSchool | null) => {
    setSchool(s);
    setAnswers((prev) => {
      const { school: _old, ...rest } = prev;
      return s ? { ...rest, school: s.name } : rest;
    });
  };

  const pickUniversity = (u: PickedSchool | null) => {
    setUniversity(u);
    setAnswers((prev) => {
      const { university: _old, ...rest } = prev;
      return u ? { ...rest, university: u.name } : rest;
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
    setSchool(null);
    setUniversity(null);
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
            Finishing high school, or already at university? Let's find your next step.
          </h1>
          <p className="mt-3 text-[#5C5647] max-w-xl leading-relaxed">
            Answer a few short questions. Finishing high school: we'll suggest courses and real
            colleges and universities you can apply to. At university or recently graduated: we'll
            match you with open internships, jobs, scholarships and fellowships.
          </p>
        </div>

        <div className="grid lg:grid-cols-[232px_1fr] gap-0 bg-white border border-[#E8DDB0] rounded-2xl overflow-hidden shadow-sm min-h-[560px]">
          {/* Progress rail */}
          <aside className="hidden lg:flex flex-col bg-[#1A1A1A] text-white p-6">
            <h2 className="font-serif text-xl mb-1">Pathfinder</h2>
            <p className="text-xs text-white/60 mb-6">Free guidance for students and graduates</p>
            <ol className="space-y-1">
              {questions.map((q, i) => {
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
                    Question {step + 1} of {questions.length}
                  </p>
                  <h3 className="font-serif text-2xl md:text-[1.65rem] leading-tight mt-2 mb-1.5 text-balance">
                    {question.prompt}
                  </h3>
                  <p className="text-[12.5px] text-[#6B6355] mb-5">{question.why}</p>

                  {question.type === "school" ? (
                    <SchoolPicker
                      country={typeof answers.country === "string" ? answers.country : "Somewhere else"}
                      value={school}
                      onChange={pickSchool}
                    />
                  ) : question.type === "university" ? (
                    <SchoolPicker
                      key="university"
                      kind="university"
                      country={typeof answers.country === "string" ? answers.country : "Somewhere else"}
                      value={university}
                      onChange={pickUniversity}
                    />
                  ) : question.type === "select" ? (
                    <div className="relative max-w-md">
                      <label htmlFor={`pathfinder-${question.key}`} className="sr-only">
                        {question.prompt}
                      </label>
                      <select
                        id={`pathfinder-${question.key}`}
                        value={typeof current === "string" ? current : ""}
                        onChange={(e) => e.target.value && pick(e.target.value)}
                        className={`w-full appearance-none rounded-[10px] border bg-white pl-3.5 pr-10 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                          current ? "border-[#B8941F] text-[#1A1A1A]" : "border-[#E8DDB0] text-[#6B6355]"
                        }`}
                      >
                        <option value="" disabled>
                          Choose your country
                        </option>
                        {question.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6355]"
                      />
                    </div>
                  ) : (
                  <div className={`grid gap-2 ${question.options.length > 10 ? "sm:grid-cols-2" : ""}`}>
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
                  )}

                  {/* On the last question, let the student say anything the
                      fixed options couldn't capture. Without this, someone
                      whose situation doesn't fit the boxes has no way to tell
                      us — and gets advice built on a poor approximation. */}
                  {last && (
                    <div className="mt-6 pt-5 border-t border-[#E8DDB0]">
                      <label
                        htmlFor="pathfinder-note"
                        className="block text-[13.5px] font-medium mb-1"
                      >
                        Anything else we should know? <span className="font-normal text-[#6B6355]">(optional)</span>
                      </label>
                      <p className="text-[12.5px] text-[#6B6355] mb-2.5">
                        If none of the options above really fit you, or there's something about your
                        situation that matters — tell us here in your own words.
                      </p>
                      <textarea
                        id="pathfinder-note"
                        value={(answers[NOTE_KEY] as string) || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [NOTE_KEY]: e.target.value.slice(0, NOTE_MAX),
                          }))
                        }
                        rows={3}
                        maxLength={NOTE_MAX}
                        placeholder={
                          undergrad
                            ? "For example: I'm switching fields, I already work part-time, I need a visa sponsor, I have a disability I need supported…"
                            : "For example: I studied a different subject combination, I'm repeating a year, I already work, I have a disability I need supported…"
                        }
                        className="w-full text-[13.5px] px-3 py-2.5 rounded-[10px] border border-[#E8DDB0] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      />
                      <p className="mt-1.5 text-[11px] text-[#6B6355] tabular-nums">
                        {((answers[NOTE_KEY] as string) || "").length} / {NOTE_MAX}
                      </p>
                    </div>
                  )}
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
                    onClick={() => (last ? submit() : setStep((s) => s + 1))}
                    className="text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[9px] bg-[#1A1A1A] text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {last
                      ? "See my options"
                      : (question.type === "school" && !school) || (question.type === "university" && !university)
                        ? "Skip"
                        : "Continue"}
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
                  <p className="text-[13.5px] text-[#6B6355]">{loadingLines[loadingLine]}</p>
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
                {isUndergradReport(report) ? (
                  <UndergradReportView report={report} answers={answers} university={university} onRestart={restart} />
                ) : (
                  <Report report={report} answers={answers} school={school} onRestart={restart} />
                )}
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
  school,
  onRestart,
}: {
  report: PathfinderReport;
  answers: Answers;
  school: PickedSchool | null;
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
          {s.scholarship && (
            <p className="mt-2.5 text-[12.5px] text-[#4A4437] rounded-[8px] bg-[#FBF7E9] border border-[#E8DDB0] px-2.5 py-2">
              <span className="font-semibold">Scholarship here:</span>{" "}
              <a
                href={s.scholarship.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8A6D12] underline underline-offset-2"
              >
                {s.scholarship.name}
              </a>
              {s.scholarship.deadline ? <span className="text-[#6B6355]"> · {s.scholarship.deadline}</span> : null}
            </p>
          )}
        </div>
      ))}

      {((report.verify?.length ?? 0) > 0 || (report.scholarships?.length ?? 0) > 0) && (
        <>
          <SectionLabel>Before you apply</SectionLabel>
          <div className="rounded-[11px] border border-[#E8DDB0] bg-white p-3.5 mb-2.5 space-y-2.5">
            {report.verify?.map((v) => (
              <p key={v.url} className="text-[13px] text-[#3C372E] leading-relaxed">
                <span className="font-medium">{v.label}:</span>{" "}
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B8941F] hover:underline underline-offset-4"
                >
                  {v.name}
                </a>
                {v.label === "Check accreditation" &&
                  " — confirm the university and the programme are accredited before you pay anything."}
              </p>
            ))}
            {report.scholarships?.map((sc) => (
              <p key={sc.url} className="text-[13px] text-[#3C372E] leading-relaxed">
                <a
                  href={sc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#B8941F] hover:underline underline-offset-4"
                >
                  {sc.name}
                </a>
                {" — "}
                {sc.detail}
              </p>
            ))}
          </div>
        </>
      )}

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

      <WhatsAppReport report={report} answers={answers} />

      <LeadForm answers={answers} report={report} school={school} />

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

function LeadForm({
  answers,
  report,
  school,
}: {
  answers: Answers;
  report: PathfinderReport;
  school: PickedSchool | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<LeadResult | null>(null);
  const [err, setErr] = useState("");
  // Universities from the report the student can send their enquiry to.
  // Nothing is ticked for them: sharing their details is their choice.
  // One row per university: the report can suggest two programmes at the
  // same one, and the request goes to its admissions office once.
  const contactable = report.schools
    .filter((s) => s.contactable)
    .filter((s, i, all) => all.findIndex((t) => t.url === s.url || t.name === s.name) === i)
    .slice(0, 6);
  const [chosen, setChosen] = useState<string[]>([]);
  // Unticked: hearing from us again is the student's choice.
  const [consent, setConsent] = useState(false);
  // The saved request's one-click links (undefined until saved; null if
  // the backend couldn't be reached).
  const [tracked, setTracked] = useState<LeadLinks | null | undefined>(undefined);
  const toggle = (url: string) =>
    setChosen((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : prev.length < 3 ? [...prev, url] : prev
    );

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const country = typeof answers.country === "string" ? answers.country : undefined;
    // A WhatsApp number, when given, is stored in international form.
    const wa = toWhatsAppNumber(phone, country);
    const contact = { name, email: email.trim(), phone: wa ? `+${wa}` : phone, message };
    setSending(true);
    setErr("");
    try {
      // Saved once, even if the email step has to be retried, so a retry
      // doesn't count the request twice.
      let links = tracked;
      if (links === undefined) {
        links = await pathfinderService.trackLead({
          details: contact,
          answers,
          report,
          chosen,
          consentMarketing: consent,
          school,
        });
        setTracked(links);
      }
      const result = await pathfinderService.submitLead(
        contact,
        answers,
        report,
        chosen,
        links
      );
      setSent(result);
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
          Your request has been sent
        </h4>
        <p className="text-[12.5px] text-[#6B6355]">
          An adviser from Student Companion AI will be in touch soon. You can close this page now.
        </p>
        {(!!sent.sentTo?.length || !!sent.passedOn?.length) && (
          <p className="text-[12.5px] text-[#4A4437] mt-2">
            Your request is also going to{" "}
            <strong>{[...(sent.sentTo ?? []), ...(sent.passedOn ?? [])].join(", ")}</strong>. Their
            admissions team can reply to you by email.
          </p>
        )}
        {sent.referrals?.map((r) => (
          <p key={r.url} className="text-[12.5px] text-[#4A4437] mt-2">
            Interested in {r.name}? Register your interest through our link so their admissions
            team can follow up with you:{" "}
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#8A6D12] underline underline-offset-2"
            >
              Register with {r.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        ))}
        <p className="text-[12px] text-[#6B6355] mt-2">
          Look out for an email from <strong>info@studentcompanionai.rw</strong> over the next few
          days, and check your spam folder too. Questions in the meantime? Write to us at{" "}
          <a href="mailto:info@studentcompanionai.rw" className="underline underline-offset-2">
            info@studentcompanionai.rw
          </a>
          . You can come back to Pathfinder any time to see your options again.
        </p>
        <ChannelButton />
      </div>
    );
  }

  return (
    <form onSubmit={send} className="mt-5 rounded-xl border border-[#D4AF37] bg-[#FBF7E9] p-4">
      <h4 className="font-semibold text-[14.5px] mb-1">
        Still not sure which course is right for you?
      </h4>
      <p className="text-[12.5px] text-[#6B6355] mb-2.5">
        Get free advice from a real adviser — someone who can talk you through:
      </p>
      <ul className="text-[12.5px] text-[#4A4437] mb-3.5 space-y-1">
        {[
          "Which course actually fits you, and why",
          "How to apply, and what the entry requirements mean",
          "Scholarships and how to pay for your studies",
          "What happens after you graduate",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[7px] w-1 h-1 rounded-full bg-[#D4AF37] flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="text-[12.5px] text-[#6B6355] mb-3.5">
        Leave your details below and we'll reach out. It costs nothing.
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
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="WhatsApp number (optional)"
        className="w-full text-[13.5px] px-3 py-2.5 rounded-[9px] border border-[#E8DDB0] bg-white mt-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        maxLength={600}
        placeholder="What would you like advice on? (optional)"
        className="w-full text-[13.5px] px-3 py-2.5 rounded-[9px] border border-[#E8DDB0] bg-white mt-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
      />

      {contactable.length > 0 && (
        <fieldset className="mt-3.5 rounded-[10px] border border-[#E8DDB0] bg-white p-3">
          <legend className="px-1 text-[13px] font-semibold">
            Also send your request to universities <span className="font-normal text-[#6B6355]">(optional, up to 3)</span>
          </legend>
          <p className="text-[12px] text-[#6B6355] mb-2">
            Their admissions team gets your name, email, phone, question and your answers above, and
            can reply to you directly.
          </p>
          <div className="space-y-1.5">
            {contactable.map((s) => {
              const on = chosen.includes(s.url);
              const full = !on && chosen.length >= 3;
              return (
                <label
                  key={s.url}
                  className={`flex items-start gap-2.5 text-[13px] ${full ? "opacity-50" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={full}
                    onChange={() => toggle(s.url)}
                    className="mt-0.5 h-4 w-4 accent-[#B8941F]"
                  />
                  <span>
                    {s.name}
                    {s.programme && <span className="text-[#6B6355]"> · {s.programme}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <label className="mt-3 flex items-start gap-2.5 text-[12.5px] text-[#4A4437] cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#B8941F] flex-shrink-0"
        />
        <span>
          Keep me updated about scholarships, opportunities and news from Student Companion AI. You
          can unsubscribe at any time.
        </span>
      </label>

      {err && <p className="text-[12.5px] text-red-700 mt-2">{err}</p>}

      <button
        type="submit"
        disabled={sending}
        className="mt-3 inline-flex items-center gap-2 text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[9px] bg-[#1A1A1A] text-white hover:bg-black disabled:opacity-50"
      >
        {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {sending
          ? "Sending…"
          : chosen.length
            ? `Ask for advice and send to ${chosen.length} ${chosen.length === 1 ? "university" : "universities"}`
            : "Ask for free advice"}
      </button>
      <p className="text-[11px] text-[#6B6355] mt-2.5">
        We use this to advise you about your studies, and keep it for two years. Your answers are
        included so we can help properly{chosen.length ? ", and go only to the universities you ticked" : ""}.
        {chosen.length
          ? " We'll check in by email a few times to ask how your applications went (you can stop that in one click)."
          : ""}{" "}
        To have your details removed sooner, email info@studentcompanionai.rw.
      </p>
    </form>
  );
}

// ── Undergraduate report ─────────────────────────────────────────────────────

/** "10 Dec 2026 · in 5 days" for a date deadline; the Sheet's text otherwise. */
function deadlineText(deadline: string, iso: string | null): string {
  if (!iso) return deadline;
  const d = new Date(`${iso}T00:00:00`);
  const days = Math.round((d.getTime() - new Date(new Date().toDateString()).getTime()) / 86_400_000);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  if (days === 0) return `${date} · today`;
  if (days > 0 && days <= 30) return `${date} · in ${days} day${days === 1 ? "" : "s"}`;
  return date;
}

function Chips({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {items.map((t) => (
        <span key={t} className="text-[11.5px] px-2.5 py-1 rounded-full bg-[#FBF7E9] border border-[#E8DDB0] text-[#4A4437]">
          {t}
        </span>
      ))}
    </div>
  );
}

function UndergradReportView({
  report,
  answers,
  university,
  onRestart,
}: {
  report: UndergradReport;
  answers: Answers;
  university: PickedSchool | null;
  onRestart: () => void;
}) {
  const main = report.opportunities.filter((o) => !o.also);
  const also = report.opportunities.filter((o) => o.also);
  const card = (o: UndergradReport["opportunities"][number]) => (
    <div key={o.id} className="rounded-[11px] border border-[#E8DDB0] bg-white p-3.5 mb-2.5">
      <div className="flex items-baseline gap-2.5 flex-wrap">
        <span className="font-semibold text-[14.5px]">{o.title}</span>
        <span className="text-[11.5px] text-[#6B6355]">{[o.organization, o.category].filter(Boolean).join(" · ")}</span>
      </div>
      <p className="mt-1.5 text-[12px] text-[#4A4437] flex items-center gap-1.5 flex-wrap">
        <CalendarClock aria-hidden="true" className="h-3.5 w-3.5 text-[#B8941F]" />
        <span>Deadline: {deadlineText(o.deadline, o.deadline_date)}</span>
        {o.location && <span className="text-[#6B6355]">· {o.location}</span>}
      </p>
      {o.why && <p className="text-[13px] text-[#3C372E] mt-1.5 leading-relaxed">{o.why}</p>}
      {(o.eligibility_year || o.eligibility_nationality) && (
        <p className="text-[11.5px] text-[#6B6355] mt-1.5">
          Who can apply: {[o.eligibility_year, o.eligibility_nationality].filter(Boolean).join(" · ")}
        </p>
      )}
      <Chips items={o.tags} />
      <a
        href={o.apply_link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#B8941F] hover:underline underline-offset-4 mt-2.5"
      >
        Open the application page
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );

  return (
    <>
      <h3 className="font-serif text-[1.45rem] leading-tight text-balance">{report.headline}</h3>
      {report.summary && <p className="text-[13px] text-[#6B6355] mt-1 mb-5">{report.summary}</p>}

      <SectionLabel>Open opportunities for you</SectionLabel>
      {main.length ? (
        main.map(card)
      ) : (
        <div className="rounded-[11px] border border-[#E8DDB0] bg-white p-3.5 mb-2.5 text-[13px] text-[#3C372E] leading-relaxed">
          Nothing open right now matches exactly what you asked for. New opportunities are added every week, so check
          back soon, or browse everything that's open on the{" "}
          <a href={report.browse} target="_blank" rel="noopener noreferrer" className="text-[#B8941F] hover:underline underline-offset-4">
            SCA career site
          </a>
          .
        </div>
      )}
      {also.length > 0 && (
        <>
          <SectionLabel>Also worth a look</SectionLabel>
          {also.map(card)}
        </>
      )}
      <p className="text-[12px] text-[#6B6355] mb-1">
        Browse every open opportunity on the{" "}
        <a href={report.browse} target="_blank" rel="noopener noreferrer" className="text-[#B8941F] hover:underline underline-offset-4">
          SCA career site
        </a>
        .
      </p>

      {report.directions.length > 0 && (
        <>
          <SectionLabel>Directions that fit you</SectionLabel>
          {report.directions.map((f, i) => (
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
              <Chips items={f.tags} />
            </div>
          ))}
        </>
      )}

      {report.skills.length > 0 && (
        <>
          <SectionLabel>Skills to build next</SectionLabel>
          <div className="rounded-[11px] border border-[#E8DDB0] bg-white p-3.5 mb-2.5 space-y-3">
            {report.skills.map((k) => (
              <div key={k.name}>
                <p className="font-semibold text-[13.5px]">{k.name}</p>
                {k.why && <p className="text-[13px] text-[#3C372E] mt-0.5 leading-relaxed">{k.why}</p>}
                {k.how && (
                  <p className="text-[12.5px] text-[#6B6355] mt-0.5 leading-relaxed">
                    <span className="font-medium text-[#4A4437]">How: </span>
                    {k.how}
                  </p>
                )}
              </div>
            ))}
            <p className="text-[12px] text-[#6B6355]">
              Free courses to get started:{" "}
              <a
                href="https://career.studentcompanionai.rw/courses.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B8941F] hover:underline underline-offset-4"
              >
                SCA free courses
              </a>
            </p>
          </div>
        </>
      )}

      {(report.careers.summary || report.careers.roles.length > 0) && (
        <>
          <SectionLabel>Where this can lead</SectionLabel>
          <div className="rounded-[11px] border border-[#E8DDB0] bg-white p-3.5">
            {report.careers.summary && <p className="text-[13px] text-[#3C372E] leading-relaxed">{report.careers.summary}</p>}
            <Chips items={report.careers.roles} />
          </div>
        </>
      )}

      <WhatsAppReport report={report} answers={answers} />

      <UndergradLeadForm answers={answers} report={report} university={university} />

      <div className="mt-4 pt-3 border-t border-[#E8DDB0] flex items-center gap-3 flex-wrap">
        <p className="text-[11.5px] text-[#6B6355] flex-1 min-w-[240px]">
          This is guidance. Always check eligibility, deadlines and requirements on the opportunity's own page before you
          apply, and never pay to apply for an internship or job.
        </p>
        <button onClick={onRestart} className="text-[12px] font-medium text-[#B8941F] hover:underline underline-offset-4">
          Start over
        </button>
      </div>
    </>
  );
}

const MAX_TRACKED = 5;

function UndergradLeadForm({
  answers,
  report,
  university,
}: {
  answers: Answers;
  report: UndergradReport;
  university: PickedSchool | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  // Nothing ticked for them: what they track, and hearing from us, is their choice.
  const [chosen, setChosen] = useState<string[]>([]);
  const [remind, setRemind] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [tracked, setTracked] = useState<LeadLinks | null | undefined>(undefined);
  const withDates = report.opportunities.filter((o) => chosen.includes(o.id) && o.deadline_date);
  const toggle = (id: string) =>
    setChosen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_TRACKED ? [...prev, id] : prev
    );

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const country = typeof answers.country === "string" ? answers.country : undefined;
    // A WhatsApp number, when given, is stored in international form.
    const wa = toWhatsAppNumber(phone, country);
    const contact = { name, email: email.trim(), phone: wa ? `+${wa}` : phone, message };
    setSending(true);
    setErr("");
    try {
      let links = tracked;
      if (links === undefined) {
        links = await pathfinderService.trackLead({
          details: contact,
          answers,
          report,
          chosen: [],
          consentMarketing: consent,
          university,
          opportunities: chosen.map((id) => ({ id, remind })),
        });
        setTracked(links);
      }
      await pathfinderService.submitLead(contact, answers, report, [], links, chosen);
      setSent(true);
    } catch (e2) {
      setErr(e2 instanceof PathfinderError ? e2.message : "We couldn't send that. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-5 rounded-xl border border-[#D4AF37] bg-[#FBF7E9] p-4">
        <h4 className="font-semibold text-[14.5px] mb-1 flex items-center gap-2">
          <Check className="h-4 w-4 text-[#B8941F]" />
          {chosen.length ? "Saved. We'll keep track with you" : "Your request has been sent"}
        </h4>
        <p className="text-[12.5px] text-[#6B6355]">
          {chosen.length
            ? `We'll check in by email to ask how your ${chosen.length === 1 ? "application" : "applications"} went${
                remind && withDates.length ? ", and remind you 5 days before each deadline" : ""
              }. You can stop the emails in one click.`
            : "An adviser from Student Companion AI will be in touch soon."}
        </p>
        <p className="text-[12px] text-[#6B6355] mt-2">
          Look out for emails from <strong>info@studentcompanionai.rw</strong>, and check your spam folder too. Questions?
          Write to{" "}
          <a href="mailto:info@studentcompanionai.rw" className="underline underline-offset-2">
            info@studentcompanionai.rw
          </a>
          .
        </p>
        <ChannelButton />
      </div>
    );
  }

  const input =
    "w-full text-[13.5px] px-3 py-2.5 rounded-[9px] border border-[#E8DDB0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]";
  return (
    <form onSubmit={send} className="mt-5 rounded-xl border border-[#D4AF37] bg-[#FBF7E9] p-4">
      <h4 className="font-semibold text-[14.5px] mb-1">Keep track, and get free advice</h4>
      <p className="text-[12.5px] text-[#6B6355] mb-3.5">
        Tick the opportunities you plan to apply for. We'll check in to ask how it went, and can remind you before each
        deadline. You can also ask an adviser about your CV, applications or next steps. It costs nothing.
      </p>

      {report.opportunities.length > 0 && (
        <fieldset className="mb-3 rounded-[10px] border border-[#E8DDB0] bg-white p-3">
          <legend className="px-1 text-[13px] font-semibold">
            Opportunities to track <span className="font-normal text-[#6B6355]">(optional, up to {MAX_TRACKED})</span>
          </legend>
          <div className="space-y-1.5">
            {report.opportunities.map((o) => {
              const on = chosen.includes(o.id);
              const full = !on && chosen.length >= MAX_TRACKED;
              return (
                <label key={o.id} className={`flex items-start gap-2.5 text-[13px] ${full ? "opacity-50" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={full}
                    onChange={() => toggle(o.id)}
                    className="mt-0.5 h-4 w-4 accent-[#B8941F]"
                  />
                  <span>
                    {o.title}
                    <span className="text-[#6B6355]"> · {deadlineText(o.deadline, o.deadline_date)}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {chosen.length > 0 && (
            <label className="mt-3 pt-2.5 border-t border-[#F1EAD0] flex items-start gap-2.5 text-[12.5px] text-[#4A4437] cursor-pointer">
              <input
                type="checkbox"
                checked={remind}
                onChange={(e) => setRemind(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#B8941F] flex-shrink-0"
              />
              <span className="flex items-start gap-1.5">
                <Bell aria-hidden="true" className="h-3.5 w-3.5 mt-0.5 text-[#B8941F] flex-none" />
                <span>
                  Email me 5 days before each deadline
                  {withDates.length < chosen.length && (
                    <span className="text-[#6B6355]"> (only for those with a fixed date)</span>
                  )}
                </span>
              </span>
            </label>
          )}
        </fieldset>
      )}

      <div className="grid sm:grid-cols-2 gap-2.5">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={input} />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className={input}
        />
      </div>
      <input
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="WhatsApp number (optional)"
        className={`${input} mt-2.5`}
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        maxLength={600}
        placeholder="What would you like advice on? (optional) For example: my CV, an application, choosing between offers"
        className={`${input} mt-2.5 resize-none`}
      />

      <label className="mt-3 flex items-start gap-2.5 text-[12.5px] text-[#4A4437] cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#B8941F] flex-shrink-0"
        />
        <span>
          Keep me updated about new opportunities, scholarships and news from Student Companion AI. You can unsubscribe
          at any time.
        </span>
      </label>

      {err && <p className="text-[12.5px] text-red-700 mt-2">{err}</p>}

      <button
        type="submit"
        disabled={sending}
        className="mt-3 inline-flex items-center gap-2 text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[9px] bg-[#1A1A1A] text-white hover:bg-black disabled:opacity-50"
      >
        {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {sending
          ? "Sending…"
          : chosen.length
            ? `Track ${chosen.length} ${chosen.length === 1 ? "opportunity" : "opportunities"}`
            : "Ask for free advice"}
      </button>
      <p className="text-[11px] text-[#6B6355] mt-2.5">
        We use this to advise you and follow up on the opportunities you ticked, and keep it for two years. Your details
        are not shared with the organisations.
        {chosen.length ? " We'll check in by email a few times (you can stop that in one click)." : ""} To have your
        details removed sooner, email info@studentcompanionai.rw.
      </p>
    </form>
  );
}

// ── WhatsApp ─────────────────────────────────────────────────────────────────

function ChannelButton() {
  return (
    <a
      href={WHATSAPP_CHANNEL}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2 rounded-[9px] border border-[#1A1A1A] text-[#1A1A1A] hover:bg-white"
    >
      <MessageCircle className="h-4 w-4" />
      Follow our WhatsApp channel
    </a>
  );
}

/**
 * Send the report to the student's own WhatsApp: WhatsApp opens their chat
 * with themselves with the report typed in, and they tap send. Many
 * high-school students have WhatsApp but no email.
 */
function WhatsAppReport({ report, answers }: { report: AnyReport; answers: Answers }) {
  const [number, setNumber] = useState("");
  const country = typeof answers.country === "string" ? answers.country : undefined;
  const wa = toWhatsAppNumber(number, country);
  const href = wa ? whatsAppLink(wa, reportMessage(report)) : undefined;
  return (
    <div className="mt-5 rounded-xl border border-[#E8DDB0] bg-white p-4">
      <h4 className="font-semibold text-[14.5px] mb-1 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-[#B8941F]" />
        Keep your report on WhatsApp
      </h4>
      <p className="text-[12.5px] text-[#6B6355] mb-3">
        Type your WhatsApp number. WhatsApp opens with your report ready to send to yourself, so you can come back
        to it any time. Then follow our channel for new scholarships and opportunities.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="pf-wa" className="sr-only">
          Your WhatsApp number
        </label>
        <input
          id="pf-wa"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder={country === "Rwanda" ? "e.g. 0788 123 456" : "Your WhatsApp number, e.g. +250 788 123 456"}
          className="flex-1 min-w-0 text-[13.5px] px-3 py-2.5 rounded-[9px] border border-[#E8DDB0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
        />
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!href}
          onClick={(e) => !href && e.preventDefault()}
          className={`inline-flex items-center justify-center gap-2 text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[9px] text-white ${
            href ? "bg-[#1A1A1A] hover:bg-black" : "bg-[#1A1A1A]/40 cursor-not-allowed"
          }`}
        >
          <Send className="h-4 w-4" />
          Send to my WhatsApp
        </a>
      </div>
      {number.trim().length > 3 && !wa && (
        <p className="text-[12px] text-red-700 mt-1.5">Check the number. Include your country code if you are abroad.</p>
      )}
      <ChannelButton />
      <p className="text-[11px] text-[#6B6355] mt-2">
        Optional. This only opens WhatsApp on your phone: we don't send or keep anything here.
      </p>
    </div>
  );
}
