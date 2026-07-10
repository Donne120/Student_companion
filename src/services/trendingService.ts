import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ISO week key — e.g. "2025-W28". Resets automatically each week.
const weekKey = (): string => {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
};

/** Normalise a question into a short topic slug (≤40 chars). */
const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .slice(0, 40)
    .replace(/\s+/g, "-");

const weekCol = () => collection(db, "trending_topics", weekKey(), "topics");

/** Increment the counter for a question. Anonymous — no uid stored. */
export const trackQuestion = async (questionText: string): Promise<void> => {
  if (!questionText.trim()) return;
  const slug = toSlug(questionText);
  if (!slug) return;
  try {
    const ref = doc(weekCol(), slug);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await setDoc(ref, { count: increment(1) }, { merge: true });
    } else {
      await setDoc(ref, {
        label: questionText.trim().slice(0, 80),
        slug,
        count: 1,
        createdAt: serverTimestamp(),
      });
    }
  } catch {
    // non-critical — silently ignore
  }
};

/** Fetch the top N trending topics for this week. */
export const getTrendingTopics = async (limit = 8): Promise<string[]> => {
  try {
    const snap = await getDocs(weekCol());
    const items = snap.docs
      .map((d) => ({ label: d.data().label as string, count: d.data().count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    return items.map((i) => i.label);
  } catch {
    return [];
  }
};

export const trendingService = { trackQuestion, getTrendingTopics };
