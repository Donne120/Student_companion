import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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

  return <>{children}</>;
};