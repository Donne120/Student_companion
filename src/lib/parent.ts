/**
 * Parents and guardians (parent_access.py in the backend).
 *
 * A parent signs in with a personal email and joins their child's
 * university with its parent code (/parents). The chat can't tell their
 * university from the email domain as it does for students, so it asks the
 * backend: GET /api/parents/me answers whether this person is a parent, of
 * which university, and (Enterprise) that university's branding.
 */
import { auth } from "@/lib/firebase";
import { API_URL, fetchWithTimeout } from "@/config/api";
import { cleanBranding, type Branding } from "@/lib/branding";

export interface ParentProfile {
  university: string;
  branding: Branding | null;
}

const STORE = "sc_parent:";

/** The last answer for this account, so the page paints right away. */
export function cachedParent(uid: string): ParentProfile | null | undefined {
  try {
    const raw = localStorage.getItem(STORE + uid);
    if (raw === null) return undefined;
    const p = JSON.parse(raw) as { university?: string; branding?: unknown } | null;
    if (!p || !p.university) return null;
    return { university: p.university, branding: cleanBranding(p.branding) };
  } catch {
    return undefined;
  }
}

/** Whether the signed-in person is a parent. null: not a parent, or unknown. */
export async function fetchParent(): Promise<ParentProfile | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/parents/me`,
      { headers: { Authorization: `Bearer ${await user.getIdToken()}` } },
      8000
    );
    if (!res.ok) return cachedParent(user.uid) ?? null;
    const data = (await res.json()) as { parent?: boolean; organization_name?: string | null; branding?: unknown };
    const profile =
      data.parent && data.organization_name
        ? { university: data.organization_name, branding: cleanBranding(data.branding) }
        : null;
    try {
      localStorage.setItem(STORE + user.uid, JSON.stringify(profile));
    } catch {
      /* storage unavailable: fine */
    }
    return profile;
  } catch {
    return cachedParent(user.uid) ?? null;
  }
}
