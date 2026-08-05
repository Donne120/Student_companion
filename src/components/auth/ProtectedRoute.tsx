import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VerifyEmailGate } from "./VerifyEmailGate";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Store the attempted path to redirect back after auth
    localStorage.setItem("redirectAfterAuth", location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Password signups must click their verification link before entering —
  // otherwise any invented @alustudent.com address would get in. Google
  // sign-ins skip this: Google has already verified the mailbox.
  const isPasswordAccount = currentUser.providerData.some(
    (p) => p.providerId === "password"
  );
  if (isPasswordAccount && !currentUser.emailVerified) {
    return <VerifyEmailGate />;
  }

  return <>{children}</>;
};