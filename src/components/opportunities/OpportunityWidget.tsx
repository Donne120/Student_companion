import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { opportunitiesService, type Opportunity } from "@/services/opportunitiesService";
import { bookmarkService } from "@/services/bookmarkService";
import { BookmarksPanel } from "./BookmarksPanel";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ROTATE_MS = 8000;
const VISIBLE_COUNT = 3;

type Category = Opportunity["category"] | "All";
type PanelTab = "browse" | "saved";

const FILTERS: Category[] = [
  "All",
  "Scholarship",
  "Internship",
  "Fellowship",
  "Competition",
  "Program",
  "Job",
  "Grant",
];

interface OpportunityWidgetProps {
  compact?: boolean;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  compact: boolean;
  bookmarked: boolean;
  onToggleBookmark: (opp: Opportunity) => void;
}

const OpportunityCard = ({
  opportunity,
  compact,
  bookmarked,
  onToggleBookmark,
}: OpportunityCardProps) => (
  <div className="group/card rounded-xl border border-[#E8DDB0] bg-white p-4 hover:border-[#D4AF37] hover:shadow-sm transition-all">
    <div className="flex items-center justify-between mb-2">
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FBF7E9] border border-[#E8DDB0] text-[10px] font-medium text-[#B8941F]">
        {opportunity.category}
      </span>
      <div className="flex items-center gap-1">
        {opportunity.location && (
          <span className="text-[10px] text-[#1A1A1A]/50 truncate max-w-[80px]">
            {opportunity.location}
          </span>
        )}
        <button
          onClick={() => onToggleBookmark(opportunity)}
          className="p-1 rounded hover:bg-[#FBF7E9] transition-colors flex-shrink-0"
          aria-label={bookmarked ? "Remove bookmark" : "Save opportunity"}
          title={bookmarked ? "Remove from saved" : "Save for later"}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
          ) : (
            <Bookmark className="h-3.5 w-3.5 text-[#1A1A1A]/30 group-hover/card:text-[#1A1A1A]/60" />
          )}
        </button>
      </div>
    </div>
    <a
      href={opportunity.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group/link"
    >
      <h3
        className={`font-semibold text-[#1A1A1A] leading-snug group-hover/link:text-[#B8941F] transition-colors ${
          compact ? "text-sm" : "text-[15px]"
        }`}
      >
        {opportunity.title}
      </h3>
      {opportunity.organization && (
        <p className="text-xs text-[#1A1A1A]/60 mt-0.5">{opportunity.organization}</p>
      )}
      <p
        className={`text-[#1A1A1A]/75 mt-2 leading-relaxed line-clamp-3 ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {opportunity.description}
      </p>
      {opportunity.deadline && (
        <p className="mt-1.5 text-[10px] text-[#B8941F] font-medium">
          Deadline: {opportunity.deadline}
        </p>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#B8941F]">
        Learn more <ExternalLink className="h-3 w-3" />
      </span>
    </a>
  </div>
);

const SkeletonCard = () => (
  <div className="rounded-xl border border-[#E8DDB0] bg-white p-4">
    <div className="h-3 w-1/3 bg-[#FBF7E9] rounded animate-pulse mb-3" />
    <div className="space-y-2">
      <div className="h-3 w-2/3 bg-[#FBF7E9] rounded animate-pulse" />
      <div className="h-3 w-full bg-[#FBF7E9] rounded animate-pulse" />
      <div className="h-3 w-4/5 bg-[#FBF7E9] rounded animate-pulse" />
    </div>
  </div>
);

export const OpportunityWidget = ({ compact = false }: OpportunityWidgetProps) => {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<PanelTab>("browse");
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<Category>("All");
  const [startIndex, setStartIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [paused, setPaused] = useState(false);

  // Load opportunities
  useEffect(() => {
    let cancelled = false;
    opportunitiesService.getOpportunities().then((list) => {
      if (!cancelled) setAllOpportunities(list);
    });
    return () => { cancelled = true; };
  }, []);

  // Subscribe to bookmarks for the current user
  useEffect(() => {
    if (!currentUser) return;
    const unsub = bookmarkService.subscribeBookmarks(currentUser.uid, (items) => {
      setBookmarkedIds(new Set(items.map((b) => b.id)));
    });
    return unsub;
  }, [currentUser]);

  const handleToggleBookmark = async (opp: Opportunity) => {
    if (!currentUser) {
      toast.error("Sign in to save opportunities");
      return;
    }
    try {
      if (bookmarkedIds.has(opp.id)) {
        await bookmarkService.removeBookmark(currentUser.uid, opp.id);
        toast.success("Removed from saved");
      } else {
        await bookmarkService.addBookmark(currentUser.uid, opp);
        toast.success("Saved to your bookmarks");
      }
    } catch {
      toast.error("Could not update bookmark");
    }
  };

  // Only show filters that have data
  const availableFilters = useMemo(() => {
    const present = new Set(allOpportunities.map((o) => o.category));
    return FILTERS.filter((f) => f === "All" || present.has(f as Opportunity["category"]));
  }, [allOpportunities]);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return allOpportunities;
    return allOpportunities.filter((o) => o.category === activeFilter);
  }, [allOpportunities, activeFilter]);

  const handleFilter = (cat: Category) => {
    setIsFading(true);
    setTimeout(() => {
      setActiveFilter(cat);
      setStartIndex(0);
      setIsFading(false);
    }, 150);
  };

  // Auto-rotate within filtered list
  useEffect(() => {
    if (tab !== "browse" || paused || filtered.length <= VISIBLE_COUNT) return;
    const id = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setStartIndex((i) => (i + VISIBLE_COUNT) % filtered.length);
        setIsFading(false);
      }, 240);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [tab, paused, filtered.length, activeFilter]);

  const advance = (direction: 1 | -1) => {
    if (filtered.length === 0) return;
    setIsFading(true);
    setTimeout(() => {
      setStartIndex((i) => {
        const len = filtered.length;
        return ((i + direction * VISIBLE_COUNT) % len + len) % len;
      });
      setIsFading(false);
    }, 200);
  };

  if (allOpportunities.length === 0 && tab === "browse") {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const visible: Opportunity[] = [];
  for (let i = 0; i < Math.min(VISIBLE_COUNT, filtered.length); i++) {
    visible.push(filtered[(startIndex + i) % filtered.length]);
  }
  const totalPages = Math.max(1, Math.ceil(filtered.length / VISIBLE_COUNT));
  const currentPage = Math.floor(startIndex / VISIBLE_COUNT) % totalPages;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 bg-[#FBF7E9] rounded-lg p-0.5">
          <button
            onClick={() => setTab("browse")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              tab === "browse"
                ? "bg-white shadow-sm text-[#1A1A1A]"
                : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
            }`}
          >
            <Sparkles className="h-3 w-3 text-[#D4AF37]" />
            Browse
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              tab === "saved"
                ? "bg-white shadow-sm text-[#1A1A1A]"
                : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
            }`}
          >
            <BookmarkCheck className="h-3 w-3" />
            Saved
            {bookmarkedIds.size > 0 && (
              <span className="bg-[#D4AF37] text-[#1A1A1A] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {bookmarkedIds.size}
              </span>
            )}
          </button>
        </div>

        {tab === "browse" && (
          <div className="flex items-center gap-2">
            <a
              href="https://career.studentcompanionai.rw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#B8941F] hover:underline font-medium flex items-center gap-0.5"
            >
              SCA Careers <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <button
              onClick={() => advance(-1)}
              className="p-1 rounded hover:bg-[#FBF7E9] text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
              aria-label="Previous opportunities"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => advance(1)}
              className="p-1 rounded hover:bg-[#FBF7E9] text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
              aria-label="Next opportunities"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Saved panel */}
      {tab === "saved" && <BookmarksPanel />}

      {/* Browse panel */}
      {tab === "browse" && (
        <>
          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {availableFilters.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                  activeFilter === cat
                    ? "bg-[#D4AF37] border-[#D4AF37] text-[#1A1A1A]"
                    : "bg-white border-[#E8DDB0] text-[#1A1A1A]/60 hover:border-[#D4AF37] hover:text-[#B8941F]"
                }`}
              >
                {cat}
                {cat !== "All" && (
                  <span className="ml-1 opacity-60">
                    ({allOpportunities.filter((o) => o.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-[#E8DDB0] bg-[#FBF7E9]/50 p-6 text-center">
              <p className="text-sm text-[#1A1A1A]/50">
                No {activeFilter.toLowerCase()} opportunities right now.
              </p>
              <button
                onClick={() => handleFilter("All")}
                className="mt-2 text-xs text-[#B8941F] hover:underline"
              >
                Show all
              </button>
            </div>
          ) : (
            <div
              className={`space-y-3 transition-opacity duration-200 ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            >
              {visible.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  compact={compact}
                  bookmarked={bookmarkedIds.has(opp.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          )}

          {/* Pagination dots */}
          {totalPages > 1 && filtered.length > 0 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentPage % 5 ? "w-4 bg-[#D4AF37]" : "w-1 bg-[#E8DDB0]"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Footer link */}
          <a
            href="https://career.studentcompanionai.rw"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-[#E8DDB0] text-xs text-[#B8941F] font-medium hover:bg-[#FBF7E9] hover:border-[#D4AF37] transition-all"
          >
            Browse all on SCA Careers
            <ExternalLink className="h-3 w-3" />
          </a>
        </>
      )}
    </div>
  );
};
