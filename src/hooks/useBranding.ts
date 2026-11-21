import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { applyBranding, cachedBranding, fetchBranding, type Branding } from "@/lib/branding";
import { viewAsBranding } from "@/lib/viewAs";
import { cachedParent } from "@/lib/parent";
import { loadParent } from "@/hooks/useParent";

/**
 * The signed-in person's university branding (Enterprise plan), or null.
 * Students and staff: from their email domain. Parents (personal email):
 * from the university they joined with its parent code.
 * The first component to ask fetches it once per email and applies its
 * colours to the page; the others share the result.
 */
let current: { email: string; branding: Branding | null } | null = null;
let pending: Promise<void> | null = null;
const listeners = new Set<(b: Branding | null) => void>();

function publish(email: string, b: Branding | null) {
  current = { email, branding: b };
  applyBranding(b);
  listeners.forEach((l) => l(b));
}

/** Forget the branding, e.g. right after joining a university as a parent. */
export function resetBranding(): void {
  current = null;
}

export function useBranding(): Branding | null {
  const { currentUser } = useAuth();
  const email = (currentUser?.email || "").toLowerCase();
  const uid = currentUser?.uid || "";
  const [branding, setBranding] = useState<Branding | null>(() =>
    current && current.email === email
      ? current.branding
      : email
        ? cachedBranding(email) ?? (uid ? cachedParent(uid)?.branding ?? null : null)
        : null
  );

  useEffect(() => {
    listeners.add(setBranding);
    return () => {
      listeners.delete(setBranding);
    };
  }, []);

  useEffect(() => {
    if (!email) {
      if (current) publish("", null);
      return;
    }
    // A platform admin viewing as a university sees that university's look.
    const viewing = viewAsBranding();
    if (viewing !== undefined) {
      publish(email, viewing);
      return;
    }
    if (current && current.email === email) {
      setBranding(current.branding);
      return;
    }
    const cached = cachedBranding(email) ?? (uid ? cachedParent(uid)?.branding ?? null : null);
    if (cached) publish(email, cached);
    if (!pending) {
      pending = fetchBranding(email)
        // No university for this email domain: a parent's university, if any.
        .then(async (b) => b ?? (uid ? (await loadParent(uid))?.branding ?? null : null))
        .then((b) => publish(email, b))
        .finally(() => {
          pending = null;
        });
    }
  }, [email, uid]);

  return branding;
}
