import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Mail, RefreshCw, Search } from "lucide-react";
import { getCurators, type Curator } from "@/services/curatorService";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function matches(curator: Curator, query: string): boolean {
  const haystack = `${curator.name} ${curator.mission_area ?? ""} ${curator.role_title ?? ""}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

/**
 * The real "book office hours" experience — a dedicated page rather than a
 * section wedged into Settings, because a university's staff directory can
 * run into the hundreds and a flat inline list stops being usable well
 * before that. Settings links here via OfficeHoursSummary.
 *
 * Data: backend_hf's GET /curators, which resolves the caller's own
 * organization server-side from their verified email — this always shows
 * only the signed-in student's own university's staff.
 */
export default function OfficeHours() {
  const [curators, setCurators] = useState<Curator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCurators(await getCurators());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load office hours.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const sorted = [...curators].sort((a, b) => a.name.localeCompare(b.name));
    if (!query.trim()) return sorted;
    return sorted.filter((c) => matches(c, query));
  }, [curators, query]);

  return (
    <div className="min-h-screen bg-white pb-safe-tabbar md:pb-0">
      <div className="h-1 w-full bg-[#D4AF37]" />

      <header className="border-b border-[#E8DDB0] safe-top">
        <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 text-sm text-[#1A1A1A]/70 hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to settings
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] tracking-tight">
            Office Hours
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#1A1A1A]/70">
            Book time with your university's Mission Curators and staff.
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or mission area…"
            className="h-11 border-[#E8DDB0] pl-9 focus-visible:ring-[#D4AF37]"
          />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-[#1A1A1A]/50">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading office hours…
          </div>
        ) : error ? (
          <div className="space-y-3 py-6">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        ) : curators.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#1A1A1A]/50">
            No one is taking office hours right now — check back later.
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#1A1A1A]/50">
            No one matches "{query}".
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs text-[#1A1A1A]/50">
              {filtered.length} of {curators.length}
            </p>
            <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-[#E8DDB0] bg-white p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FBF7E9] font-serif text-sm font-semibold text-[#B8941F]">
                    {initials(c.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1A1A1A]">{c.name}</p>
                    <p className="truncate text-xs text-[#1A1A1A]/60">
                      {c.role_title ?? c.mission_area ?? "Office hours"}
                    </p>
                  </div>

                  {c.calendar_link ? (
                    <Button asChild size="sm" variant="outline" className="shrink-0 border-[#E8DDB0]">
                      <a href={c.calendar_link} target="_blank" rel="noreferrer">
                        Book time
                      </a>
                    </Button>
                  ) : c.email ? (
                    <Button asChild size="sm" variant="outline" className="shrink-0 border-[#E8DDB0]">
                      <a href={`mailto:${c.email}`}>
                        <Mail className="mr-1.5 h-3.5 w-3.5" />
                        Email
                      </a>
                    </Button>
                  ) : (
                    <span className="shrink-0 text-xs text-[#1A1A1A]/40">Coming soon</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
