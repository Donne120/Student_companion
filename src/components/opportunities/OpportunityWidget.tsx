import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { opportunitiesService, type Opportunity } from "@/services/opportunitiesService";
import { bookmarkService } from "@/services/bookmarkService";
import { BookmarksPanel } from "./BookmarksPanel";
import { OpportunityRow } from "./OpportunityRow";
import { dateBlock } from "@/lib/opportunityFormat";
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

const SkeletonCard = () => (
  <div className="border-b border-[#E5E3DE] py-4">
    <div className="h-3 w-1/3 bg-[#F4F3F0] rounded animate-pulse mb-3" />
    <div className="space-y-2">
      <div className="h-3 w-2/3 bg-[#F4F3F0] rounded animate-pulse" />
      <div className="h-3 w-full bg-[#F4F3F0] rounded animate-pulse" />
      <div className="h-3 w-4/5 bg-[#F4F3F0] rounded animate-pulse" />
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
      // Like the career site ("Hide closed" is on by default), only what
      // a student can still apply to.
      if (!cancelled) setAllOpportunities(list.filter((o) => dateBlock(o.deadline).tone !== "closed"));
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
        <div className="flex items-center gap-4 text-[13px]">
          <button
            onClick={() => setTab("browse")}
            className={`pb-1 border-b-2 transition-colors ${
              tab === "browse"
                ? "border-[#1C1B19] text-[#1C1B19] font-medium"
                : "border-transparent text-[#8C887F] hover:text-[#1C1B19]"
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`pb-1 border-b-2 transition-colors ${
              tab === "saved"
                ? "border-[#1C1B19] text-[#1C1B19] font-medium"
                : "border-transparent text-[#8C887F] hover:text-[#1C1B19]"
            }`}
          >
            Saved{bookmarkedIds.size > 0 ? ` (${bookmarkedIds.size})` : ""}
          </button>
        </div>

        {tab === "browse" && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => advance(-1)}
              className="p-1 rounded hover:bg-[#F4F3F0] text-[#1C1B19]/50 hover:text-[#1C1B19] transition-colors"
              aria-label="Previous opportunities"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => advance(1)}
              className="p-1 rounded hover:bg-[#F4F3F0] text-[#1C1B19]/50 hover:text-[#1C1B19] transition-colors"
              aria-label="Next opportunities"
            >
              <ChevronRight className="h-4 w-4" />
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
          <div className="flex flex-wrap gap-1 mb-3">
            {availableFilters.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-2 py-0.5 rounded text-[12px] transition-colors ${
                  activeFilter === cat
                    ? "bg-[#1C1B19] text-white"
                    : "text-[#4A4843] hover:bg-[#F4F3F0] hover:text-[#1C1B19]"
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
            <div className="rounded-xl border border-[#E5E3DE] bg-[#F4F3F0]/50 p-6 text-center">
              <p className="text-sm text-[#1C1B19]/50">
                No {activeFilter.toLowerCase()} opportunities right now.
              </p>
              <button
                onClick={() => handleFilter("All")}
                className="mt-2 text-xs text-[#8A6A16] hover:underline"
              >
                Show all
              </button>
            </div>
          ) : (
            <div
              className={`border-t border-[#1C1B19] transition-opacity duration-200 ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            >
              {visible.map((opp) => (
                <OpportunityRow
                  key={opp.id}
                  opportunity={opp}
                  showSummary={!compact}
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
                    i === currentPage % 5 ? "w-4 bg-[#6B6862]" : "w-1 bg-[#E5E3DE]"
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
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 text-[13px] text-[#1C1B19] font-medium hover:underline underline-offset-2"
          >
            See all opportunities
            <ExternalLink className="h-3 w-3" />
          </a>
        </>
      )}
    </div>
  );
};
