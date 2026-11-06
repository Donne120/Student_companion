import { useEffect, useState } from "react";

/**
 * Shown in place of an answer until its first words arrive. The backend's
 * own progress ("Searching your university's resources", "Writing your
 * answer") comes first; while the wait goes on, friendlier lines take turns
 * so the student can see the Companion is still working.
 */
const PHRASES = [
  "Thinking",
  "Doing the hard work",
  "Hold tight, explorer",
  "Checking the details",
  "Putting your answer together",
];

export const ThinkingIndicator = ({ status }: { status?: string }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2600);
    return () => window.clearInterval(id);
  }, []);

  // The server's latest status for the first beat, then the rotating lines.
  const lines = status ? [status, ...PHRASES] : PHRASES;
  const line = lines[tick % lines.length];

  return (
    <div className="flex items-center gap-2.5 h-7" role="status" aria-live="polite">
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-[#9C978C] animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#9C978C] animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#9C978C] animate-bounce" />
      </span>
      <span key={line} className="text-[14px] text-[#6B6862] animate-in fade-in duration-300">
        {line}…
      </span>
    </div>
  );
};
