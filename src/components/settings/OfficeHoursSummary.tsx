import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { getCurators } from "@/services/curatorService";

/**
 * Compact "Office Hours" summary card for the Settings page — replaces
 * rendering every curator inline (which stopped being usable the moment a
 * university has more than a handful of staff). Just enough to orient: how
 * many curators are available, then a link to the real, searchable list at
 * /office-hours.
 */
export const OfficeHoursSummary = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurators()
      .then((curators) => {
        if (!cancelled) setCount(curators.length);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <p className="text-sm text-[#1A1A1A]/70">
        {count === null ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Checking availability…
          </span>
        ) : count === 0 ? (
          "No one is taking office hours right now."
        ) : (
          <>
            <span className="font-medium text-[#1A1A1A]">{count}</span>{" "}
            {count === 1 ? "curator is" : "curators are"} available to book.
          </>
        )}
      </p>
      <Button asChild size="sm" className="shrink-0 bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90">
        <Link to="/office-hours">
          Browse
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
};
