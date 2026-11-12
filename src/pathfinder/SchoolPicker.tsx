import { useEffect, useId, useRef, useState } from "react";
import { Check, Loader, Search } from "lucide-react";
import { pathfinderService, type SchoolSuggestion } from "./pathfinderService";
import { SCHOOL_MAX } from "./questions";

/**
 * Pathfinder's school step: type, see matching schools in the student's
 * country, pick one, or keep what you typed.
 *
 * Rwanda's suggestions come from the Rwanda Schools Directory; other
 * countries build their list from the schools students type (see the
 * backend's schools.py). A school that isn't suggested is always accepted as
 * typed, so the list never blocks anyone.
 */
export interface PickedSchool {
  name: string;
  /** Set when picked from the suggestions. */
  id?: string;
  district?: string | null;
}

interface Props {
  country: string;
  value: PickedSchool | null;
  onChange: (school: PickedSchool | null) => void;
}

const where = (s: SchoolSuggestion) => [s.sector, s.district, s.province].filter(Boolean).join(", ");
const levels = (s: SchoolSuggestion) =>
  s.levels.map((l) => l.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).join(" · ");

export function SchoolPicker({ country, value, onChange }: Props) {
  const [text, setText] = useState(value?.name ?? "");
  const [results, setResults] = useState<SchoolSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  // Search as the student types, after a short pause, cancelling stale requests.
  useEffect(() => {
    const q = text.trim();
    // Nothing to search, or the text is a school just picked from the list.
    if (q.length < 2 || (value?.id && value.name === text)) {
      setResults([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      const found = await pathfinderService.searchSchools(country, q, ctrl.signal);
      if (!ctrl.signal.aborted) {
        setResults(found);
        setActive(-1);
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [text, country, value?.id, value?.name]);

  // Close the list when clicking elsewhere.
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const typed = text.trim();
  const exact = results.some((r) => r.name.toLowerCase() === typed.toLowerCase());
  // The options: matching schools, then "use what I typed" if it isn't one of them.
  const options: Array<{ kind: "school"; school: SchoolSuggestion } | { kind: "typed" }> = [
    ...results.map((school) => ({ kind: "school" as const, school })),
    ...(typed.length >= 2 && !exact ? [{ kind: "typed" as const }] : []),
  ];

  const choose = (i: number) => {
    const o = options[i];
    if (!o) return;
    if (o.kind === "school") {
      onChange({ name: o.school.name, id: o.school.id, district: o.school.district });
      setText(o.school.name);
    } else {
      onChange({ name: typed });
    }
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open && active >= 0) {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && typed.length >= 2 && (loading || options.length > 0);

  return (
    <div ref={boxRef} className="relative max-w-md">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Your school
      </label>
      <div
        className={`flex items-center gap-2 rounded-[10px] border bg-white pl-3 pr-3 focus-within:ring-2 focus-within:ring-[#D4AF37] ${
          value ? "border-[#B8941F]" : "border-[#E8DDB0]"
        }`}
      >
        <Search aria-hidden="true" className="h-4 w-4 flex-none text-[#6B6355]" />
        <input
          id={`${listId}-input`}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          value={text}
          maxLength={SCHOOL_MAX}
          placeholder={country === "Somewhere else" ? "Type your school's name" : `Start typing your school in ${country}`}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            // Typing again un-picks a chosen school; what's typed still counts.
            onChange(e.target.value.trim() ? { name: e.target.value.trim() } : null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          className="w-full py-3 text-[14px] bg-transparent focus:outline-none"
        />
        {loading && <Loader aria-hidden="true" className="h-4 w-4 flex-none animate-spin text-[#B8941F]" />}
        {!loading && value?.id && <Check aria-label="School selected" className="h-4 w-4 flex-none text-[#B8941F]" />}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1.5 w-full max-h-72 overflow-y-auto rounded-[10px] border border-[#E8DDB0] bg-white shadow-[0_12px_32px_rgba(26,26,26,0.12)] py-1"
        >
          {options.map((o, i) =>
            o.kind === "school" ? (
              <li
                key={o.school.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={active === i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                onMouseEnter={() => setActive(i)}
                className={`px-3.5 py-2.5 cursor-pointer ${active === i ? "bg-[#FBF7E9]" : ""}`}
              >
                <p className="text-[13.5px] font-medium text-[#1A1A1A]">{o.school.name}</p>
                {(where(o.school) || o.school.levels.length > 0) && (
                  <p className="text-[11.5px] text-[#6B6355] mt-0.5">
                    {[where(o.school), levels(o.school)].filter(Boolean).join(" · ")}
                  </p>
                )}
              </li>
            ) : (
              <li
                key="typed"
                id={`${listId}-${i}`}
                role="option"
                aria-selected={active === i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                onMouseEnter={() => setActive(i)}
                className={`px-3.5 py-2.5 cursor-pointer border-t border-[#F1EAD0] ${active === i ? "bg-[#FBF7E9]" : ""}`}
              >
                <p className="text-[13.5px] text-[#1A1A1A]">
                  Use “<span className="font-medium">{typed}</span>”
                </p>
                <p className="text-[11.5px] text-[#6B6355] mt-0.5">
                  {results.length ? "My school isn't in the list" : "No match yet. We'll add your school."}
                </p>
              </li>
            )
          )}
          {loading && options.length === 0 && <li className="px-3.5 py-2.5 text-[12.5px] text-[#6B6355]">Searching…</li>}
        </ul>
      )}

      {value && !value.id && typed.length >= 2 && !open && (
        <p className="mt-2 text-[12px] text-[#6B6355]">We'll use “{value.name}” as you typed it.</p>
      )}
      {value?.id && value.district && !open && (
        <p className="mt-2 text-[12px] text-[#6B6355]">
          {value.name}, {value.district}
        </p>
      )}
    </div>
  );
}
