import { API_URL, authHeader, fetchWithTimeout } from "@/config/api";

/**
 * "Popular with students this week": the questions most asked by students
 * of the signed-in person's own university, from the backend
 * (GET /api/trending, insights.trending). Greetings and small talk are
 * never counted, and a question shows only once several different students
 * have asked it. Nothing is stored in the browser or in Firestore.
 */
export const getTrendingTopics = async (limit = 6): Promise<string[]> => {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/trending?limit=${encodeURIComponent(String(limit))}`,
      { headers: await authHeader() },
      8000
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { questions?: unknown };
    return Array.isArray(data.questions)
      ? data.questions.filter((q): q is string => typeof q === "string" && q.trim().length > 0)
      : [];
  } catch {
    return [];
  }
};

export const trendingService = { getTrendingTopics };
