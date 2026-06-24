/**
 * userService.ts
 *
 * Handles reading and writing user profile documents in Firestore.
 * Every registration path (email/password and Google) calls `upsertUserProfile`
 * so we always have a canonical record in the `users` collection.
 *
 * Document shape (users/{uid}):
 *   uid          – Firebase Auth UID
 *   email        – verified ALU email
 *   displayName  – full name
 *   photoURL     – avatar URL (may be empty string)
 *   provider     – "password" | "google.com"
 *   role         – "student" | "staff" | "admin"  (default "student")
 *   createdAt    – server timestamp on first write
 *   updatedAt    – server timestamp on every write
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
  createdAt?: unknown; // Firestore Timestamp
  updatedAt?: unknown;
}

/**
 * Derive the role from the email domain:
 *   @alustudent.com  → student
 *   @alueducation.com → staff
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
