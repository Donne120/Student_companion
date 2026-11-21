import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cachedParent, fetchParent, type ParentProfile } from "@/lib/parent";

/**
 * The signed-in parent's university (and its branding), or null for
 * students, staff and anyone not signed in. Asked once per account and
 * shared by every component that uses it.
 */
let current: { uid: string; profile: ParentProfile | null } | null = null;
let pending: Promise<ParentProfile | null> | null = null;
const listeners = new Set<(p: ParentProfile | null) => void>();

export function loadParent(uid: string): Promise<ParentProfile | null> {
  if (current && current.uid === uid) return Promise.resolve(current.profile);
  if (!pending) {
    pending = fetchParent()
      .then((profile) => {
        current = { uid, profile };
        listeners.forEach((l) => l(profile));
        return profile;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

/** Forget the answer, e.g. right after joining as a parent. */
export function resetParent(): void {
  current = null;
}

export function useParent(): ParentProfile | null {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid || "";
  const [profile, setProfile] = useState<ParentProfile | null>(() =>
    current && current.uid === uid ? current.profile : uid ? cachedParent(uid) ?? null : null
  );

  useEffect(() => {
    listeners.add(setProfile);
    return () => {
      listeners.delete(setProfile);
    };
  }, []);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      return;
    }
    loadParent(uid).then(setProfile);
  }, [uid]);

  return profile;
}
