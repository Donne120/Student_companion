import { useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import privacy from "@/content/legal/privacy.md?raw";
import terms from "@/content/legal/terms.md?raw";

// Public Privacy Policy and Terms of Use pages (/privacy, /terms).
// The text lives in src/content/legal/*.md so it can be updated without touching code.
const PAGES = {
  privacy: { title: "Privacy Policy", body: privacy, other: { to: "/terms", label: "Terms of Use" } },
  terms: { title: "Terms of Use", body: terms, other: { to: "/privacy", label: "Privacy Policy" } },
} as const;

export default function LegalPage({ page }: { page: keyof typeof PAGES }) {
  const { title, body, other } = PAGES[page];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="min-h-screen bg-[#FDFBF5] text-[#1A1A1A]">
      <header className="border-b border-[#E8DDB0] bg-white/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src="/logo-icon.png" alt="" className="w-9 h-9 object-contain flex-shrink-0" />
            <span className="font-semibold tracking-tight truncate">Student Companion AI</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-6">{title}</h1>
        <article
          className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:tracking-tight
            prose-h3:text-2xl prose-h3:mt-10 prose-a:text-[#B8941F] prose-a:no-underline hover:prose-a:underline
            prose-table:text-sm prose-th:bg-[#FBF7E9] prose-th:px-3 prose-td:px-3 prose-td:align-top"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <table {...props} />
                </div>
              ),
              a: ({ node, href, ...props }) => (
                <a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props} />
              ),
            }}
          >
            {body}
          </ReactMarkdown>
        </article>

        <nav className="mt-14 pt-6 border-t border-[#E8DDB0] flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to={other.to} className="text-[#B8941F] hover:underline">{other.label}</Link>
          <a href="mailto:privacy@studentcompanionai.rw" className="text-[#B8941F] hover:underline">privacy@studentcompanionai.rw</a>
        </nav>
      </main>
    </div>
  );
}
