import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { applyBranding, cachedBranding, fetchBranding, type Branding } from "@/lib/branding";

/**
 * The signed-in student's university branding (Enterprise plan), or null.
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

export function useBranding(): Branding | null {
  const { currentUser } = useAuth();
  const email = (currentUser?.email || "").toLowerCase();
  const [branding, setBranding] = useState<Branding | null>(() =>
    current && current.email === email ? current.branding : email ? cachedBranding(email) : null
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
    if (current && current.email === email) {
      setBranding(current.branding);
      return;
    }
    const cached = cachedBranding(email);
    if (cached) publish(email, cached);
    if (!pending) {
      pending = fetchBranding(email)
        .then((b) => publish(email, b))
        .finally(() => {
          pending = null;
        });
    }
  }, [email]);

  return branding;
}
