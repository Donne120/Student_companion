/**
 * curatorService.ts
 *
 * Fetches the signed-in student's own university's bookable curators
 * (Mission Curators / office-hours staff) from backend_hf's GET /curators.
 * Server-side, the route resolves the caller's organization from their own
 * verified email — a student only ever sees their own university's list,
 * the same guarantee every other student-facing route in this app has.
 */
import { API_URL, authHeader } from "@/config/api";

export interface Curator {
  id: string;
  name: string;
  mission_area: string | null;
  role_title: string | null;
  email: string | null;
  calendar_link: string | null;
}

export const getCurators = async (): Promise<Curator[]> => {
  const res = await fetch(`${API_URL}/curators`, {
    headers: await authHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to load office hours (${res.status})`);
  }
  return (await res.json()) as Curator[];
};
