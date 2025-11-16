import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
  // Initialize with null and handle localStorage in useEffect to avoid hydration issues
  const [theme, setTheme] = useState<Theme | null>(null);

  // Handle initial load and localStorage
  useEffect(() => {
    // Initialize from localStorage or default to system
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    setTheme(savedTheme || "system");
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (theme === null) return;
    
    const root = window.document.documentElement;
    
    // Track system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const applyTheme = () => {
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      const effectiveTheme = theme === "system" ? systemTheme : theme;
      
      root.classList.remove("light", "dark");
      root.classList.add(effectiveTheme);
    };
    
    // Apply immediately
    applyTheme();
    
    // Listen for system theme changes
    const listener = () => applyTheme();
    mediaQuery.addEventListener("change", listener);
    
    // Save to storage
    localStorage.setItem("theme", theme);
    
    // Cleanup
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  return { 
    theme: theme || "system", 
    setTheme 
  };
}
