import { useEffect, useState } from "react";
import { Bookmark, ExternalLink, Trash2, BookmarkX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  bookmarkService,
  type BookmarkedOpportunity,
} from "@/services/bookmarkService";
import { toast } from "sonner";

export const BookmarksPanel = () => {
  const { currentUser } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = bookmarkService.subscribeBookmarks(
      currentUser.uid,
      (items) => {
        setBookmarks(items);
        setLoading(false);
      }
    );
    return unsub;
  }, [currentUser]);

  const handleRemove = async (id: string, title: string) => {
    if (!currentUser) return;
    try {
      await bookmarkService.removeBookmark(currentUser.uid, id);
      toast.success(`Removed "${title}"`);
    } catch {
      toast.error("Failed to remove bookmark");
    }
  };

  if (!currentUser) {
    return (
      <div className="py-8 text-center text-sm text-[#1A1A1A]/50">
        Sign in to save opportunities.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[#E8DDB0] bg-white p-4 animate-pulse"
          >
            <div className="h-3 w-1/3 bg-[#FBF7E9] rounded mb-3" />
            <div className="h-3 w-2/3 bg-[#FBF7E9] rounded mb-2" />
            <div className="h-3 w-full bg-[#FBF7E9] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="py-10 text-center">
        <BookmarkX className="h-8 w-8 text-[#E8DDB0] mx-auto mb-3" />
        <p className="text-sm text-[#1A1A1A]/50">No saved opportunities yet.</p>
        <p className="text-xs text-[#1A1A1A]/40 mt-1">
          Click the bookmark icon on any card to save it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((opp) => (
        <div
          key={opp.id}
          className="rounded-xl border border-[#E8DDB0] bg-white p-4 hover:border-[#D4AF37] transition-all group"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FBF7E9] border border-[#E8DDB0] text-[10px] font-medium text-[#B8941F]">
              {opp.category}
            </span>
            <button
              onClick={() => handleRemove(opp.id, opp.title)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-[#1A1A1A]/40 hover:text-red-500 transition-all flex-shrink-0"
              aria-label="Remove bookmark"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <a
            href={opp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group/link"
          >
            <h3 className="text-sm font-semibold text-[#1A1A1A] leading-snug group-hover/link:text-[#B8941F] transition-colors">
              {opp.title}
            </h3>
            {opp.organization && (
              <p className="text-xs text-[#1A1A1A]/60 mt-0.5">{opp.organization}</p>
            )}
            {opp.deadline && (
              <p className="mt-1 text-[10px] text-[#B8941F] font-medium">
                Deadline: {opp.deadline}
              </p>
            )}
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#B8941F]">
              Open link <ExternalLink className="h-3 w-3" />
            </span>
          </a>
        </div>
      ))}
    </div>
  );
};
