import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Opportunity } from "./opportunitiesService";

export interface BookmarkedOpportunity extends Opportunity {
  savedAt: number; // millis for local sorting; Firestore also stores serverTimestamp
}

const bookmarksCol = (uid: string) =>
  collection(db, "users", uid, "bookmarks");

const bookmarkDoc = (uid: string, opportunityId: string) =>
  doc(db, "users", uid, "bookmarks", opportunityId);

/** Add a bookmark. Idempotent — safe to call if already saved. */
export const addBookmark = async (
  uid: string,
  opportunity: Opportunity
): Promise<void> => {
  await setDoc(bookmarkDoc(uid, opportunity.id), {
    ...opportunity,
    savedAt: serverTimestamp(),
  });
};

/** Remove a bookmark. */
export const removeBookmark = async (
  uid: string,
  opportunityId: string
): Promise<void> => {
  await deleteDoc(bookmarkDoc(uid, opportunityId));
};

/** Fetch all bookmarks once (for initial load). */
export const getBookmarks = async (
  uid: string
): Promise<BookmarkedOpportunity[]> => {
  const snap = await getDocs(
    query(bookmarksCol(uid), orderBy("savedAt", "desc"))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...(data as Opportunity),
      savedAt: data.savedAt?.toMillis?.() ?? Date.now(),
    };
  });
};

/** Real-time listener — returns an unsubscribe function. */
export const subscribeBookmarks = (
  uid: string,
  onChange: (bookmarks: BookmarkedOpportunity[]) => void
): Unsubscribe => {
  return onSnapshot(
    query(bookmarksCol(uid), orderBy("savedAt", "desc")),
    (snap) => {
      const items: BookmarkedOpportunity[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as Opportunity),
          savedAt: data.savedAt?.toMillis?.() ?? Date.now(),
        };
      });
      onChange(items);
    },
    () => {
      // silently ignore listener errors (e.g. permission denied when signed out)
    }
  );
};

export const bookmarkService = {
  addBookmark,
  removeBookmark,
  getBookmarks,
  subscribeBookmarks,
};
