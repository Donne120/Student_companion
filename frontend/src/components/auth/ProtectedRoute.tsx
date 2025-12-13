import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // TEMPORARILY DISABLED AUTHENTICATION FOR TESTING
  // const { currentUser } = useAuth();
  // const location = useLocation();

  // if (!currentUser) {
  //   // Store the attempted path to redirect back after auth
  //   localStorage.setItem("redirectAfterAuth", location.pathname);
  //   return <Navigate to="/login" replace />;
  // }

  // Bypass authentication - allow all users to access protected routes
  return <>{children}</>;
};