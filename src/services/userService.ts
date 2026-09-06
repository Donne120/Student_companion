/**
 * userService.ts
 *
 * Handles reading and writing user profile documents in Firestore.
 * Every registration path (email/password and Google) calls `upsertUserProfile`
 * so we always have a canonical record in the `users` collection.
 *
 * Document shape (users/{uid}):
 *   uid              – Firebase Auth UID
 *   email            – verified university email
 *   displayName      – full name
 *   photoURL         – avatar URL (may be empty string)
 *   provider         – "password" | "google.com"
 *   role             – "student" | "staff" | "admin"  (default "student")
 *   organizationName – the university this email's domain resolved to at
 *                       signup (from backend_hf's organizations table, via
 *                       GET /api/organizations/check) — a display label,
 *                       not a tenant id; the backend's own Aurora lookup on
 *                       each request remains the actual authorization check.
 *   createdAt        – server timestamp on first write
 *   updatedAt        – server timestamp on every write
 */

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserRole = "student" | "staff" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: "password" | "google.com";
  role: UserRole;
  organizationName?: string | null;
  createdAt?: unknown; // Firestore Timestamp
  updatedAt?: unknown;
}

/**
 * Derive the role from the email domain.
 *
 * This is a UX default only (which nav items/copy to show), never a
 * security boundary — the backend independently re-derives and enforces
 * the caller's real organization/role from the Firebase token on every
 * request (see backend_hf/auth.py, admin_routes.py). Kept ALU-specific
 * (staff = @alueducation.com) deliberately: a second university's roles
 * aren't determined by a fixed domain suffix, so every non-ALU signup
 * defaults to "student" until a real per-org role model exists.
 */
const roleFromEmail = (email: string): UserRole => {
  if (email.endsWith("@alueducation.com")) return "staff";
  return "student";
};

/**
 * Create or update the user's Firestore document.
 * Uses `setDoc` with `{ merge: true }` so that an existing document
 * keeps fields we don't explicitly set (e.g., a future `chatCount`).
 */
export const upsertUserProfile = async (params: {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: "password" | "google.com";
  organizationName?: string | null;
}): Promise<void> => {
  const ref = doc(db, "users", params.uid);
  const existing = await getDoc(ref);

  const data: DocumentData = {
    uid: params.uid,
    email: params.email,
    displayName: params.displayName || "",
    photoURL: params.photoURL || "",
    provider: params.provider,
    updatedAt: serverTimestamp(),
  };
  if (params.organizationName) {
    data.organizationName = params.organizationName;
  }

  // Only set role and createdAt on first write so admins can promote users
  // without the client overwriting it on every login.
  if (!existing.exists()) {
    data.role = roleFromEmail(params.email);
    data.createdAt = serverTimestamp();
  }

  await setDoc(ref, data, { merge: true });
};

/**
 * Fetch the stored profile for a given UID.
 * Returns null if the document doesn't exist yet.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
};

/**
 * Update mutable fields (displayName, photoURL) after a profile edit.
 */
export const updateUserProfileFields = async (
  uid: string,
  updates: Partial<Pick<UserProfile, "displayName" | "photoURL">>
): Promise<void> => {
  await setDoc(
    doc(db, "users", uid),
    { ...updates, updatedAt: serverTimestamp() },
    { merge: true }
  );
};
