import React from "react";
import { Link } from "react-router-dom";

// NOTE: There is no admin-email allowlist in the client anymore.
// Admin identity is decided server-side by the backend's ADMIN_EMAILS secret
// (enforced by require_admin on every /api/admin/* route). The helpers below
// only gate what the UI *renders* — they are UX, not security. Any privileged
// data still has to pass the backend check via adminFetch, which returns
// 401/403 if the signed-in user isn't actually an admin.

const SESSION_KEY = "ADMIN_SESSION_EXPIRES";
const EMAIL_KEY = "ADMIN_EMAIL";
const ROLE_KEY = "USER_ROLE";
const SESSION_HOURS = 8;

export const isAdmin = (): boolean => {
  const expires = localStorage.getItem(SESSION_KEY);
  if (expires && new Date(expires) < new Date()) {
    clearAdminSession();
    return false;
  }
  return localStorage.getItem(ROLE_KEY) === "admin";
};

/**
 * Record a local admin session so the UI can show the admin area. This is a
 * client convenience only — it grants no real access. The backend decides
 * whether the user's Firebase token is actually an admin on each request.
 */
export const grantAdminSession = (email: string): void => {
  const expires = new Date();
  expires.setHours(expires.getHours() + SESSION_HOURS);
  localStorage.setItem(EMAIL_KEY, email.toLowerCase());
  localStorage.setItem(ROLE_KEY, "admin");
  localStorage.setItem(SESSION_KEY, expires.toISOString());
};

export const clearAdminSession = (): void => {
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(SESSION_KEY);
};

export const getAdminEmail = (): string | null => localStorage.getItem(EMAIL_KEY);

export const requireAdmin = <P extends object>(Component: React.ComponentType<P>) => {
  return function AdminProtectedComponent(props: P) {
    if (!isAdmin()) {
      return React.createElement(
        "div",
        { className: "flex flex-col items-center justify-center h-screen" },
        React.createElement("h1", { className: "text-2xl font-bold mb-4" }, "Admin Access Required"),
        React.createElement("p", { className: "text-[#1A1A1A]/50 mb-6" }, "You need admin privileges to view this page."),
        React.createElement(Link, { to: "/", className: "text-[#D4AF37] hover:underline" }, "Return to home")
      );
    }
    return React.createElement(Component, props);
  };
};
