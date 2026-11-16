/**
 * "View as university" for platform admins.
 *
 * A platform admin signs in to the chat and picks a university; every chat
 * request then carries X-View-As-Org, and the backend answers as that
 * university's students would be answered (its knowledge, calendar, plan
 * features and branding), even for a university not yet open to students.
 * The backend refuses the header from anyone who is not a platform admin,
 * and does not count these questions in the university's reports.
 */
import { API_URL } from "@/config/api";
import { cleanBranding, type Branding } from "@/lib/branding";

const KEY = "sc_view_as_org";

export interface PreviewOrg {
  id: string;
  name: string;
  email_domain: string;
  plan_tier: string;
  is_active: boolean;
  branding: Branding | null;
}

export function viewAsOrgId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setViewAsOrg(org: PreviewOrg | null): void {
  try {
    if (org) {
      localStorage.setItem(KEY, org.id);
      localStorage.setItem(KEY + ":branding", JSON.stringify(org.branding));
    } else {
      localStorage.removeItem(KEY);
      localStorage.removeItem(KEY + ":branding");
    }
  } catch {
    /* storage unavailable */
  }
}

/** The branding of the university being viewed as (null when none, or when
 * that university has none), or undefined when not in view-as mode. */
export function viewAsBranding(): Branding | null | undefined {
  if (!viewAsOrgId()) return undefined;
  try {
    return cleanBranding(JSON.parse(localStorage.getItem(KEY + ":branding") || "null"));
  } catch {
    return null;
  }
}

/** The universities this user may view the chat as: the list for a platform
 * admin, null for everyone else (the backend answers 403). */
export async function fetchPreviewOrgs(token: string): Promise<PreviewOrg[] | null> {
  try {
    const res = await fetch(`${API_URL}/api/db/preview/organizations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as PreviewOrg[];
    return rows.map((r) => ({ ...r, branding: cleanBranding(r.branding) }));
  } catch {
    return null;
  }
}
