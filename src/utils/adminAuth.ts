import React from "react";
import { Link } from "react-router-dom";

/**
 * Admin authentication utilities
 */

export const isAdmin = (): boolean => {
  const userRole = localStorage.getItem("USER_ROLE");
  const adminEmail = localStorage.getItem("ADMIN_EMAIL");
  return userRole === "admin" && adminEmail === "d.ngum@alustudent.com";
};

// Use createElement instead of JSX since this is a .ts file
export const requireAdmin = <P extends object>(Component: React.ComponentType<P>) => {
  return function AdminProtectedComponent(props: P) {
    const adminAccess = isAdmin();
    
    if (!adminAccess) {
      return React.createElement(
        "div", 
        { className: "flex flex-col items-center justify-center h-screen" },
        React.createElement("h1", { className: "text-2xl font-bold mb-4" }, "Admin Access Required"),
        React.createElement("p", { className: "text-gray-500 mb-6" }, "You need admin privileges to view this page."),
        React.createElement(Link, { to: "/", className: "text-[#0F4C81] hover:underline" }, "Return to home")
      );
    }
    
    return React.createElement(Component, props);
  };
};