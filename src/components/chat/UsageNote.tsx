import { useEffect, useState } from "react";
import { API_URL, authHeader } from "@/config/api";

type Usage = { limit: number; used: number; remaining: number; resets_at: string };

/**
 * Questions left today (backend usage_limits.py), shown under the message
 * box only when few are left. Questions about the student's own university
 * never count, so it says so.
 */
export const UsageNote = () => {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/usage`, { headers: { ...(await authHeader()) } });
        if (!res.ok) return;
        const data = (await res.json()) as Usage;
        if (!cancelled && typeof data.remaining === "number") setUsage(data);
      } catch {
        /* not signed in or offline: show nothing */
      }
    };
    load();
    window.addEventListener("sc-usage-changed", load);
    return () => {
      cancelled = true;
      window.removeEventListener("sc-usage-changed", load);
    };
  }, []);

  if (!usage || usage.remaining > 5) return null;
  const text =
    usage.remaining === 0
      ? "You've used today's questions. Questions about your university are still answered; the rest resets at midnight (Kigali time)."
      : `${usage.remaining} question${usage.remaining === 1 ? "" : "s"} left today. Questions about your university don't count.`;
  return (
    <p className={`text-center text-[12px] mt-2 ${usage.remaining === 0 ? "text-[#9A3412]" : "text-[#6B6559]"}`}>{text}</p>
  );
};
