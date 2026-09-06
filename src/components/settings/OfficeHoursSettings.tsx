import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { getCurators, type Curator } from "@/services/curatorService";

/**
 * "Office Hours" card for the Settings page: the student's own university's
 * bookable staff, each linking out to their real calendar (Calendly, Google
 * Calendar, etc.) or a mailto: fallback when only an email is on file.
 *
 * Previously this only existed inside the mini-chatbot widget, several taps
 * deep and easy to miss. Server side: backend_hf's GET /curators
 * (admin_routes.py), populated by each university's own admin via the
 * Curators & Office Hours screen in the admin dashboard.
 */
export const OfficeHoursSettings = () => {
  const [curators, setCurators] = useState<Curator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-[#1A1A1A]/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading office hours…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 py-2">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  if (curators.length === 0) {
    return (
      <p className="py-2 text-sm text-[#1A1A1A]/50">
        No one is taking office hours right now — check back later.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[#E8DDB0]">
      {curators.map((c) => (
        <div key={c.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#1A1A1A]">{c.name}</p>
            <p className="truncate text-xs text-[#1A1A1A]/60">
              {c.role_title ?? c.mission_area ?? "Office hours"}
            </p>
          </div>
          {c.calendar_link ? (
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <a href={c.calendar_link} target="_blank" rel="noreferrer">
                Book time
              </a>
            </Button>
          ) : c.email ? (
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <a href={`mailto:${c.email}`}>
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                Email
              </a>
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
};
