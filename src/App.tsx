import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Settings from "./pages/settings";
import Documents from "./pages/documents";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { MiniChatbot } from "./components/mini-chatbot/MiniChatbot";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import ApiDocumentation from "./pages/admin/ApiDocumentation";
import FeedbackDashboard from "./pages/admin/FeedbackDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import { useEffect } from "react";
import "./App.css";

function App() {
  // ✅ Apply theme from settings
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('THEME') || 'system';
      
      console.log('✅ Applying theme from settings:', savedTheme);
      
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System default - check user's preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    };
    
    applyTheme();
    
    // Listen for theme changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'THEME') {
        applyTheme();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthProvider>
      <NextThemeProvider attribute="class" defaultTheme="dark">
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            {/* Add chatbot route - assuming Index is your chatbot page */}
            <Route path="/chatbot" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/api-docs" element={
              <ProtectedRoute>
                <ApiDocumentation />
              </ProtectedRoute>
            } />
            <Route path="/admin/feedback" element={
              <ProtectedRoute>
                <FeedbackDashboard />
              </ProtectedRoute>
            } />
          </Routes>
          <MiniChatbot />
          <Toaster position="top-center" richColors />
        </Router>
      </NextThemeProvider>
    </AuthProvider>
  );
}

export default App;
