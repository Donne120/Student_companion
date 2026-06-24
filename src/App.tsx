import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { MiniChatbot } from "./components/mini-chatbot/MiniChatbot";
import { MobileTabBar } from "./components/mobile/MobileTabBar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import "./App.css";

// ── Route-level code splitting ────────────────────────────────────────────────
// Each page is loaded only when the user navigates to it, slashing the initial
// bundle from ~1.95 MB down to the critical path.
const Index            = lazy(() => import("./pages/Index"));
const Login            = lazy(() => import("./pages/Login"));
const Signup           = lazy(() => import("./pages/Signup"));
const ForgotPassword   = lazy(() => import("./pages/ForgotPassword"));
const Profile          = lazy(() => import("./pages/Profile"));
const Settings         = lazy(() => import("./pages/settings"));
const Documents        = lazy(() => import("./pages/documents"));
const News             = lazy(() => import("./pages/News"));
const Opportunities    = lazy(() => import("./pages/Opportunities"));
const LandingPage      = lazy(() => import("./pages/LandingPage"));
const AnalyticsDashboard  = lazy(() => import("./pages/admin/AnalyticsDashboard"));
const ApiDocumentation    = lazy(() => import("./pages/admin/ApiDocumentation"));
const FeedbackDashboard   = lazy(() => import("./pages/admin/FeedbackDashboard"));

// ── Page title map ────────────────────────────────────────────────────────────
const TITLE_MAP: Record<string, string> = {
  "/":                   "ALU Student Companion",
  "/login":              "Sign in — ALU Student Companion",
  "/signup":             "Create account — ALU Student Companion",
  "/forgot-password":    "Reset password — ALU Student Companion",
  "/chat":               "Chat — ALU Student Companion",
  "/news":               "News — ALU Student Companion",
  "/opportunities":      "Opportunities — ALU Student Companion",
  "/documents":          "Documents — ALU Student Companion",
  "/profile":            "Profile — ALU Student Companion",
  "/settings":           "Settings — ALU Student Companion",
  "/admin/analytics":    "Analytics — ALU Admin",
  "/admin/api-docs":     "API Docs — ALU Admin",
  "/admin/feedback":     "Feedback — ALU Admin",
};

// ── Thin fallback spinner shown while a lazy chunk loads ──────────────────────
const PageSpinner = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <svg
      className="h-7 w-7 animate-spin text-[#D4AF37]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>
);

// ── Per-route chrome (tab bar, floating chatbot, page title) ──────────────────
const APP_ROUTES = ["/chat", "/news", "/opportunities", "/documents", "/profile", "/settings"];

const Chrome = () => {
  const { pathname } = useLocation();

  // Update the document title on every navigation
  const titleKey = Object.keys(TITLE_MAP)
    .sort((a, b) => b.length - a.length) // most specific first
    .find((k) => pathname === k || pathname.startsWith(k + "/"));
  document.title = titleKey ? TITLE_MAP[titleKey] : "ALU Student Companion";

  const showTabs = APP_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const onChatPage = pathname === "/chat" || pathname.startsWith("/chat/");

  return (
    <>
      {!onChatPage && <MiniChatbot />}
      {showTabs && <MobileTabBar />}
    </>
  );
};

// ── Root component ────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <NextThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Router>
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              {/* Public */}
              <Route path="/"                element={<LandingPage />} />
              <Route path="/landing"         element={<Navigate to="/" replace />} />
              <Route path="/login"           element={<Login />} />
              <Route path="/signup"          element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected app */}
              <Route path="/chat" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/chatbot" element={<Navigate to="/chat" replace />} />
              <Route path="/news"          element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
              <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings"      element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/documents"     element={<ProtectedRoute><Documents /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
              <Route path="/admin/api-docs"  element={<ProtectedRoute><ApiDocumentation /></ProtectedRoute>} />
              <Route path="/admin/feedback"  element={<ProtectedRoute><FeedbackDashboard /></ProtectedRoute>} />
            </Routes>
          </Suspense>
          <Chrome />
          <Toaster position="top-center" richColors />
        </Router>
      </NextThemeProvider>
    </AuthProvider>
  );
}

export default App;
