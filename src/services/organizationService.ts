/**
 * organizationService.ts
 *
 * Replaces the old hardcoded "@alustudent.com / @alueducation.com" checks
 * in AuthContext.tsx and Signup.tsx with a real lookup against Aurora's
 * `organizations` table (via backend_hf's public GET /api/organizations/check).
 *
 * This is what lets a newly onboarded university's students sign up the
 * moment an admin creates their organization record — no frontend code
 * change or redeploy required, unlike the domain list this replaces.
 */
import { API_URL, fetchWithTimeout } from "@/config/api";

export interface OrganizationCheckResult {
  allowed: boolean;
  organizationName: string | null;
  // True only when the check itself couldn't be completed (network error,
  // backend unreachable, non-2xx response) — distinct from a clean "no
  // university uses this domain" answer, so the UI can say "try again" for
  // one and "use your university email" for the other, rather than
  // collapsing a service outage into the same message as a bad email.
  checkFailed: boolean;
}

/**
 * Ask the backend whether `email`'s domain belongs to an active,
 * onboarded university.
 *
 * Never throws — every outcome (allowed, not allowed, or the check itself
 * failing) resolves to a normal return value so callers don't need a
 * try/catch around this.
 */
export const checkOrganizationDomain = async (
  email: string
): Promise<OrganizationCheckResult> => {
  try {
    const url = `${API_URL}/api/organizations/check?email=${encodeURIComponent(email)}`;
    const res = await fetchWithTimeout(url, {}, 8000);
    if (!res.ok) {
      return { allowed: false, organizationName: null, checkFailed: true };
    }
    const data = (await res.json()) as { allowed: boolean; organization_name: string | null };
    return { allowed: data.allowed, organizationName: data.organization_name, checkFailed: false };
  } catch {
    return { allowed: false, organizationName: null, checkFailed: true };
  }
};
