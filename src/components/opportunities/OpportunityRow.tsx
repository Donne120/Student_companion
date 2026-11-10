import { Bookmark, BookmarkCheck, MessageCircle, Trash2 } from "lucide-react";
import type { Opportunity } from "@/services/opportunitiesService";
import {
  cleanSummary,
  dateBlock,
  shortEligibility,
  shortLocation,
  workMode,
} from "@/lib/opportunityFormat";

// One opportunity, set like the career site's listing: the deadline as a
// calendar date, then the full title, organisation and place, one line of
// facts, a short clean summary, and the way out to the organisation's site.

const SERIF = "font-['Fraunces',Georgia,serif]";

const TONE: Record<string, string> = {
  soon: "text-[#B83B3B]",
  closed: "text-[#8C887F] line-through decoration-1",
  open: "text-[#1C1B19]",
  rolling: "text-[#1C1B19]",
};

interface OpportunityRowProps {
  opportunity: Opportunity;
  bookmarked?: boolean;
  onToggleBookmark?: (opp: Opportunity) => void;
  onRemove?: (opp: Opportunity) => void;
  showSummary?: boolean;
}

export const OpportunityRow = ({
  opportunity: o,
  bookmarked = false,
  onToggleBookmark,
  onRemove,
  showSummary = true,
}: OpportunityRowProps) => {
  const date = dateBlock(o.deadline);
  const place = shortLocation(o.location);
  const where = [o.organization, place].filter(Boolean).join(" · ");
  const facts = [o.category, workMode(o.remote, o.location), shortEligibility(o.eligibility)]
    .filter(Boolean)
    .join(" · ");
  const summary = showSummary ? cleanSummary(o.description) : "";

  const ask = () =>
    window.dispatchEvent(
      new CustomEvent("companion:suggest", {
        detail: `Tell me about ${o.title}${o.organization ? ` (${o.organization})` : ""}: am I eligible, when is the deadline, and how do I apply?`,
      })
    );

  return (
    <article className="grid grid-cols-[52px_minmax(0,1fr)] gap-x-3 py-4 border-b border-[#E5E3DE] last:border-b-0">
      {/* Deadline */}
      <div className="pr-2.5 border-r border-[#E5E3DE] self-stretch" title={date.title || undefined}>
        <span className="sr-only">Deadline: </span>
        <span
          className={`block leading-none ${SERIF} font-medium ${
            date.tone === "rolling" ? "text-[12.5px] pt-1" : "text-[22px]"
          } ${TONE[date.tone]}`}
        >
          {date.day}
        </span>
        <span
          className={`block mt-1.5 text-[10px] leading-tight text-[#8C887F] ${
            date.tone === "rolling" ? "" : "font-semibold uppercase tracking-[0.06em]"
          }`}
        >
          {date.month}
        </span>
        {date.left && (
          <span className={`block mt-1.5 text-[10.5px] font-semibold leading-tight ${date.tone === "soon" ? "text-[#B83B3B]" : "text-[#8C887F]"}`}>
            {date.left}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <h3 className={`flex-1 min-w-0 ${SERIF} font-medium text-[15px] leading-[1.3] text-[#1C1B19]`}>
            <a
              href={o.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline decoration-[#D4AF37] underline-offset-[3px]"
            >
              {o.title}
            </a>
          </h3>
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(o)}
              className="-mt-0.5 -mr-1 p-1 rounded hover:bg-[#F4F3F0] flex-shrink-0"
              aria-label={bookmarked ? "Remove from saved" : "Save this opportunity"}
              title={bookmarked ? "Saved" : "Save"}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-[#B8860B]" />
              ) : (
                <Bookmark className="h-4 w-4 text-[#8C887F] hover:text-[#1C1B19]" />
              )}
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(o)}
              className="-mt-0.5 -mr-1 p-1 rounded text-[#8C887F] hover:text-[#B83B3B] hover:bg-[#F4F3F0] flex-shrink-0"
              aria-label="Remove from saved"
              title="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {where && <p className="mt-1 text-[12.5px] font-medium text-[#4A4843]">{where}</p>}
        {facts && <p className="mt-0.5 text-[11.5px] text-[#8C887F]">{facts}</p>}
        {summary && <p className="mt-2 text-[12.5px] leading-relaxed text-[#4A4843] line-clamp-2">{summary}</p>}

        <div className="mt-3 flex items-center gap-3">
          <a
            href={o.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2.5 py-1 rounded-md border border-[#1C1B19] text-[12px] font-semibold text-[#1C1B19] hover:bg-[#1C1B19] hover:text-white transition-colors"
            aria-label={`View details of ${o.title} (opens in a new tab)`}
          >
            View details <span aria-hidden="true" className="ml-1">↗</span>
          </a>
          {/* Fills the chat box with a question the backend answers from the live career feed. */}
          <button
            type="button"
            onClick={ask}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#4A4843] hover:text-[#1C1B19]"
          >
            <MessageCircle className="h-3 w-3" /> Ask
          </button>
        </div>
      </div>
    </article>
  );
};
