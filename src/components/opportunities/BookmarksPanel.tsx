import { useEffect, useState } from "react";
import { BookmarkX } from "lucide-react";
import { OpportunityRow } from "./OpportunityRow";
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
      <div className="py-8 text-center text-sm text-[#1C1B19]/50">
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
            className="rounded-xl border border-[#E5E3DE] bg-white p-4 animate-pulse"
          >
            <div className="h-3 w-1/3 bg-[#F4F3F0] rounded mb-3" />
            <div className="h-3 w-2/3 bg-[#F4F3F0] rounded mb-2" />
            <div className="h-3 w-full bg-[#F4F3F0] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="py-10 text-center">
        <BookmarkX className="h-8 w-8 text-[#E5E3DE] mx-auto mb-3" />
        <p className="text-sm text-[#1C1B19]/50">No saved opportunities yet.</p>
        <p className="text-xs text-[#1C1B19]/40 mt-1">
          Click the bookmark icon on any card to save it here.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-[#1C1B19]">
      {bookmarks.map((opp) => (
        <OpportunityRow
          key={opp.id}
          opportunity={opp}
          onRemove={() => handleRemove(opp.id, opp.title)}
        />
      ))}
    </div>
  );
};
