import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BackendStatus } from "@/components/chat/BackendStatus";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Server,
  Database,
  BrainCircuit,
  Globe,
  Shield,
  Eye,
  EyeOff,
  Terminal,
  RefreshCw,
  LineChart,
  Calendar,
  FileText,
  Save,
  AlertCircle,
  PlayCircle,
  CheckCircle,
  BarChart4,
  Zap,
  Gauge,
  Code,
  Lock,
  Table,
  Network,
  Webhook,
  Book,
  LibrarySquare,
  Layers,
  Info,
  MessageSquare,
  ListFilter,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { isAdmin as isAdminUser, grantAdminSession, getAdminEmail, clearAdminSession } from "@/utils/adminAuth";
import { API_URL, checkBackendHealth } from "@/config/api";
import { aiService } from "@/services/aiService";
import { useAuth } from "@/contexts/AuthContext";

// Feature access levels
type AccessLevel = "public" | "beta" | "admin" | "developer";

// Feature definition
type Feature = {
  id: string;
  name: string;
  description: string;
  access: AccessLevel;
  enabled: boolean;
  beta?: boolean;
  comingSoon?: boolean;
};

// Settings section props
type SettingsSectionProps = {
  title: string | React.ReactNode;
  description: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
};

// Settings section component
const SettingsSection = ({ title, description, children, icon }: SettingsSectionProps) => (
  <Card className="mb-6 border-[#E8DDB0] shadow-none">
    <CardHeader className="space-y-0 pb-4 border-b border-[#E8DDB0]">
      <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#1A1A1A]">
        {icon && <span className="text-[#B8941F]">{icon}</span>}
        {title}
      </CardTitle>
      <CardDescription className="mt-1.5 text-[#1A1A1A]/60">{description}</CardDescription>
    </CardHeader>
    <CardContent className="pt-6">{children}</CardContent>
  </Card>
);

// Feature toggle component
const FeatureToggle = ({ 
  feature, 
  onToggle, 
  userRole, 
  onVisibilityChange 
}: { 
  feature: Feature; 
  onToggle: (id: string, enabled: boolean) => void;
  userRole: string;
  onVisibilityChange?: (id: string, access: AccessLevel) => void;
}) => {
  // Only show developer options to admin role
  const canManageVisibility = userRole === 'admin';
  const isAccessible = 
    feature.access === 'public' || 
    (feature.access === 'beta' && userRole !== 'student') ||
    (feature.access === 'admin' && userRole === 'admin') ||
    (feature.access === 'developer' && userRole === 'admin');

  if (!isAccessible && !canManageVisibility) return null;

  return (
    <div className={`flex items-center justify-between p-3 ${!isAccessible && canManageVisibility ? "opacity-60" : ""}`}>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium">{feature.name}</span>
          {feature.beta && <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">BETA</Badge>}
          {feature.comingSoon && <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">COMING SOON</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{feature.description}</p>
      </div>
      <div className="flex items-center gap-2">
        {canManageVisibility && onVisibilityChange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {feature.access === 'public' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium">Visibility Setting</h4>
                <Select 
                  value={feature.access} 
                  onValueChange={(value) => onVisibilityChange(feature.id, value as AccessLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (Everyone)</SelectItem>
                    <SelectItem value="beta">Beta (Faculty+)</SelectItem>
                    <SelectItem value="admin">Admin Only</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Control who can see and use this feature
                </p>
              </div>
            </PopoverContent>
          </Popover>
        )}
        <Switch 
          checked={feature.enabled} 
          disabled={feature.comingSoon || (!isAccessible && !canManageVisibility)} 
          onCheckedChange={(checked) => onToggle(feature.id, checked)} 
          className="data-[state=checked]:bg-[#D4AF37]"
        />
      </div>
    </div>
  );
};

// Admin authentication is centralised in @/utils/adminAuth.
// The admin allowlist lives server-side (backend ADMIN_EMAILS secret) and is
// enforced by require_admin on every /api/admin/* route. The client no longer
// ships an admin-email list: we authenticate against Firebase via the standard
// /login flow, reveal the Advanced tab, and let the backend reject non-admins
// (401/403) on the actual privileged calls.

export default function Settings() {
  const { currentUser, login } = useAuth();
  // System settings
  const [geminiKey, setGeminiKey] = useState("");
  const [useLocalBackend, setUseLocalBackend] = useState(true);
  const [backendUrl, setBackendUrl] = useState(API_URL);
  const [theme, setTheme] = useState("system");
  const [userRole, setUserRole] = useState("student");
  const [performanceMetrics, setPerformanceMetrics] = useState({
    responseTime: 0,
    tokenUsage: 0,
    successRate: 0,
    cachingEfficiency: 0
  });
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [backendTestResult, setBackendTestResult] = useState<null | boolean>(null);
  const [systemStatus, setSystemStatus] = useState<{
    backend: "operational" | "degraded" | "down" | "unknown";
    database: "operational" | "degraded" | "down" | "unknown";
    vector_store: "operational" | "degraded" | "down" | "unknown";
    api: "operational" | "degraded" | "down" | "unknown";
  }>({
    backend: "unknown",
    database: "unknown",
    vector_store: "unknown",
    api: "unknown",
  });
  const [modelParameters, setModelParameters] = useState({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1024,
    presencePenalty: 0.2,
    frequencyPenalty: 0.2,
  });
  
  // Knowledge base settings
  const [knowledgeSources, setKnowledgeSources] = useState<Record<string, boolean>>({
    financialInfo: true,
    academicPrograms: true,
    campusServices: true,
    admissions: true,
    graduation: true,
    housingInfo: false,
    facultyProfiles: false,
    courseDescriptions: false
  });
  
  // Features list with visibility controls
  const [features, setFeatures] = useState<Feature[]>([
    // Public features
    {
      id: "contextual_search",
      name: "Contextual Search",
      description: "Enhanced search with academic context awareness",
      access: "public",
      enabled: true
    },
    {
      id: "chat_history",
      name: "Conversation History",
      description: "Save and reference previous conversations",
      access: "public",
      enabled: true
    },
    {
      id: "responsive_ui",
      name: "Responsive Interface",
      description: "Adaptive design for all devices",
      access: "public",
      enabled: true
    },
    
    // Beta features
    {
      id: "semantic_search",
      name: "Semantic Search",
      description: "Advanced meaning-based search capabilities",
      access: "beta",
      enabled: true,
      beta: true
    },
    {
      id: "custom_instructions",
      name: "Custom AI Instructions",
      description: "Set persistent instructions for the AI assistant",
      access: "beta",
      enabled: false,
      beta: true
    },
    
    // Admin-only features
    {
      id: "analytics_dashboard",
      name: "Analytics Dashboard",
      description: "View detailed usage statistics and patterns",
      access: "admin",
      enabled: true
    },
    {
      id: "bulk_data_import",
      name: "Bulk Knowledge Import",
      description: "Import multiple documents to the knowledge base at once",
      access: "admin",
      enabled: true
    },
    {
      id: "system_monitoring",
      name: "System Monitoring",
      description: "Real-time performance monitoring and alerts",
      access: "admin",
      enabled: false
    },
    
    // Developer features (hidden from most users)
    {
      id: "api_access",
      name: "API Access",
      description: "Direct integration with external systems via API",
      access: "developer",
      enabled: false
    },
    {
      id: "embedding_customization",
      name: "Embedding Customization",
      description: "Configure vector embedding parameters",
      access: "developer",
      enabled: false
    },
    {
      id: "prompt_engineering",
      name: "Prompt Engineering Tools",
      description: "Advanced tools to design and test system prompts",
      access: "developer",
      enabled: false
    },
    
    // Coming soon features
    {
      id: "calendar_integration",
      name: "Calendar Integration",
      description: "Connect with academic calendars and schedules",
      access: "beta",
      enabled: false,
      comingSoon: true
    },
    {
      id: "document_analysis",
      name: "Document Analysis",
      description: "Upload and analyze academic documents",
      access: "beta",
      enabled: false,
      comingSoon: true
    },
    {
      id: "multi_modal",
      name: "Multi-modal Responses",
      description: "Get responses with images, tables, and interactive elements",
      access: "public",
      enabled: false,
      comingSoon: true,
      beta: true
    }
  ]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  // Add these states and functions to your component
  const [apiEndpoint, setApiEndpoint] = useState("/api/chat");
  const [apiMethod, setApiMethod] = useState("POST");
  const [apiPayload, setApiPayload] = useState(JSON.stringify({
    message: "Tell me about ALU's academic programs",
    history: [],
    knowledgeSources: ["academicPrograms", "admissions"]
  }, null, 2));
  const [apiResponse, setApiResponse] = useState("");
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Add this function to actually test API calls
  const testApiEndpoint = async () => {
    try {
      setIsApiLoading(true);
      setApiResponse("");
      
      const url = backendUrl + apiEndpoint;
      const options: RequestInit = {
        method: apiMethod,
        headers: { 'Content-Type': 'application/json' },
      };

      if (apiMethod !== "GET" && apiMethod !== "DELETE") {
        options.body = apiPayload;
      }
      
      const startTime = Date.now();
      const response = await fetch(url, options);
      const endTime = Date.now();
      
      const responseData = await response.json();
      
      setApiResponse(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        responseTime: `${endTime - startTime}ms`,
        data: responseData
      }, null, 2));
      
      // Record successful API call in localStorage for history
      const apiHistory = JSON.parse(localStorage.getItem("API_CALL_HISTORY") || "[]");
      apiHistory.unshift({
        endpoint: apiEndpoint,
        method: apiMethod,
        timestamp: new Date().toISOString(),
        success: response.ok
      });
      localStorage.setItem("API_CALL_HISTORY", JSON.stringify(apiHistory.slice(0, 10)));
      
    } catch (error) {
      setApiResponse(JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        info: "Connection failed. Please check the backend URL and endpoint."
      }, null, 2));
    } finally {
      setIsApiLoading(false);
    }
  };

  type QueryStat = { date: string; count: number };
  type UserStat = { date: string; count: number };
  const [analyticsData, setAnalyticsData] = useState<{
    queries: QueryStat[];
    users: UserStat[];
    sessions: unknown[];
    totalQueries: number;
    activeUsers: number;
    satisfaction: string;
  }>({
    queries: [],
    users: [],
    sessions: [],
    totalQueries: 0,
    activeUsers: 0,
    satisfaction: "0.0",
  });

  // Add this in useEffect to load real analytics data
  useEffect(() => {
    // Load analytics from localStorage or initialize with default data
    const chatHistory = JSON.parse(localStorage.getItem("CHAT_HISTORY") || "[]");
    const feedbackItems = JSON.parse(localStorage.getItem("FEEDBACK") || "[]");
    
    // Generate analytics based on real chat history
    if (chatHistory.length > 0) {
      const queryDates: string[] = chatHistory
        .filter((msg: { role: string }) => msg.role === "user")
        .map((msg: { timestamp: number }) => new Date(msg.timestamp).toISOString().split('T')[0]);

      const queryCounts: Record<string, number> = {};
      for (const date of queryDates) {
        queryCounts[date] = (queryCounts[date] || 0) + 1;
      }
      
      // Last 7 days
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      const queryStats: QueryStat[] = last7Days.map(date => ({
        date,
        count: queryCounts[date] || 0
      }));

      const positiveFeedback = feedbackItems.filter((f: { type: string }) => f.type === "positive").length;
      const feedbackRatio = feedbackItems.length > 0
        ? (positiveFeedback / feedbackItems.length) * 100
        : 0;

      setAnalyticsData({
        queries: queryStats,
        users: [
          { date: "Today", count: Math.floor((queryStats[6]?.count ?? 0) / 3) },
          { date: "Week", count: queryStats.reduce((sum, day) => sum + day.count, 0) }
        ],
        sessions: [],
        satisfaction: feedbackRatio.toFixed(1),
        totalQueries: chatHistory.filter((msg: { role: string }) => msg.role === "user").length,
        activeUsers: 0,
      });
    }
  }, []);

  type FeedbackItem = { type: "positive" | "negative"; message: string; details?: string; timestamp: number };
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [collectFeedback, setCollectFeedback] = useState(true);
  const [detailedNegativeFeedback, setDetailedNegativeFeedback] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  useEffect(() => {
    // Load feedback settings
    const savedCollectFeedback = localStorage.getItem("COLLECT_FEEDBACK") !== "false";
    const savedDetailedNegative = localStorage.getItem("DETAILED_NEGATIVE_FEEDBACK") !== "false";
    const savedWeeklyReports = localStorage.getItem("WEEKLY_FEEDBACK_REPORTS") === "true";
    
    setCollectFeedback(savedCollectFeedback);
    setDetailedNegativeFeedback(savedDetailedNegative);
    setWeeklyReports(savedWeeklyReports);
    
    // Load actual feedback items
    const storedFeedback = JSON.parse(localStorage.getItem("FEEDBACK") || "[]");
    setFeedbackItems(storedFeedback.slice(0, 5)); // Show latest 5
  }, []);

  const handleFeedbackSettingChange = (setting: "collect" | "detailed" | "weekly", value: boolean) => {
    if (setting === "collect") {
      setCollectFeedback(value);
      localStorage.setItem("COLLECT_FEEDBACK", value ? "true" : "false");
    } else if (setting === "detailed") {
      setDetailedNegativeFeedback(value);
      localStorage.setItem("DETAILED_NEGATIVE_FEEDBACK", value ? "true" : "false");
    } else if (setting === "weekly") {
      setWeeklyReports(value);
      localStorage.setItem("WEEKLY_FEEDBACK_REPORTS", value ? "true" : "false");
    }
  };

  // Add this state for tracking auto-save
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add auto-save effect
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      saveAllSettings();
    }, 2000); // 2 second delay after changes
    
    return () => clearTimeout(saveTimer);
  }, [modelParameters, knowledgeSources, features]);

  // Consolidated save function
  const saveAllSettings = () => {
    try {
      setIsSaving(true);
      
      // Save all settings
      localStorage.setItem('MODEL_PARAMETERS', JSON.stringify(modelParameters));
      localStorage.setItem('KNOWLEDGE_SOURCES', JSON.stringify(knowledgeSources));
      localStorage.setItem('FEATURES', JSON.stringify(features));
      
      // Save other settings as needed
      
      setLastSaved(new Date());
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      setIsSaving(false);
      toast.error("Error saving settings", {
        description: "There was a problem saving your preferences",
      });
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedGeminiKey = localStorage.getItem("GEMINI_API_KEY") || "";
    const savedUseLocalBackend = localStorage.getItem("USE_LOCAL_BACKEND") === "true";
    const savedBackendUrl = localStorage.getItem("BACKEND_URL") || API_URL;
    const savedTheme = localStorage.getItem("THEME") || "system";
    const savedFeatures = JSON.parse(localStorage.getItem("FEATURES") || "null");
    const savedModelParams = JSON.parse(localStorage.getItem("MODEL_PARAMETERS") || "null");
    const savedKnowledgeSources = JSON.parse(localStorage.getItem("KNOWLEDGE_SOURCES") || "null");

    if (isAdminUser()) {
      setIsLoggedIn(true);
      setUserEmail(getAdminEmail() ?? "");
      setUserRole("admin");
    } else {
      setUserRole(localStorage.getItem("USER_ROLE") || "student");
    }

    setGeminiKey(savedGeminiKey);
    setUseLocalBackend(savedUseLocalBackend);
    setBackendUrl(savedBackendUrl);
    setTheme(savedTheme);

    if (savedFeatures) setFeatures(savedFeatures);
    if (savedModelParams) setModelParameters(savedModelParams);
    if (savedKnowledgeSources) setKnowledgeSources(savedKnowledgeSources);
  }, []);

  // Poll real backend health for system status + response time
  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      const start = Date.now();
      const healthy = await checkBackendHealth();
      const elapsed = Date.now() - start;
      if (cancelled) return;
      setSystemStatus({
        backend: healthy ? "operational" : "down",
        api: healthy ? "operational" : "down",
        database: healthy ? "operational" : "unknown",
        vector_store: healthy ? "operational" : "unknown",
      });
      setPerformanceMetrics((prev) => ({
        ...prev,
        responseTime: elapsed,
        successRate: healthy ? 100 : 0,
      }));
    };
    probe();
    const id = setInterval(probe, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Toggle backend connection
  const toggleUseLocalBackend = (checked: boolean) => {
    setUseLocalBackend(checked);
  };

  // Toggle feature enablement
  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    // Find the feature
    const feature = features.find(f => f.id === featureId);
    
    if (feature && (feature.access === "admin" || feature.access === "developer")) {
      if (!isAdminUser()) {
        toast.error("Admin access required", {
          description: "You need administrator privileges to modify this setting",
        });
        return;
      }
    }
    
    // If we get here, user has permission (or it's a public feature)
    setFeatures(features.map(f => 
      f.id === featureId ? { ...f, enabled } : f
    ));
  };

  // Change feature visibility
  const changeFeatureVisibility = (id: string, access: AccessLevel) => {
    setFeatures(prev => 
      prev.map(feature => 
        feature.id === id ? {...feature, access} : feature
      )
    );
  };

  // Toggle knowledge source
  const handleKnowledgeSourceToggle = (source: string, enabled: boolean) => {
    // Restrict certain knowledge sources to admins
    const adminOnlySources = ["facultyProfiles", "courseDescriptions"];
    
    if (adminOnlySources.includes(source) && !isAdminUser()) {
      toast.error("Admin access required", {
        description: "You need administrator privileges to modify this knowledge source",
      });
      return;
    }
    
    setKnowledgeSources({
      ...knowledgeSources,
      [source]: enabled
    });
  };

  // Test backend connection
  const testBackendConnection = async () => {
    setIsTestingBackend(true);
    setBackendTestResult(null);
    
    try {
      // Test the root endpoint - Hugging Face spaces often don't have /health
      const response = await fetch(`${backendUrl}`);
      const success = response.status === 200;
      setBackendTestResult(success);
      
      if (success) {
        toast.success("Hugging Face backend connection successful", {
          description: "The system is connected to the Hugging Face model"
        });
      } else {
        toast.error("Backend connection failed", {
          description: "Could not connect to Hugging Face. Status: " + response.status
        });
      }
    } catch (error) {
      setBackendTestResult(false);
      toast.error("Backend connection failed", {
        description: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsTestingBackend(false);
    }
  };

  // Handle model parameter changes
  const handleParameterChange = (param: string, value: number | number[]) => {
    const actualValue = Array.isArray(value) ? value[0] : value;
    setModelParameters(prev => ({
      ...prev,
      [param]: actualValue
    }));
  };

  // Get current model parameters as percent for display
  const getParameterPercent = (value: number, max: number) => {
    return (value / max) * 100;
  };

  // Admin unlock: authenticate against Firebase. There is no client-side email
  // allowlist — the backend decides admin status from its ADMIN_EMAILS secret
  // and rejects non-admins with 401/403 on the actual /api/admin/* calls. The
  // local session below only reveals the admin UI; it grants no real access.
  const handleLogin = async () => {
    setLoginError("");
    if (!userEmail || !userPassword) {
      setLoginError("Email and password are required.");
      return;
    }
    try {
      // If user is not already signed in as this account, sign in.
      if (!currentUser || currentUser.email?.toLowerCase() !== userEmail.toLowerCase()) {
        await login(userEmail, userPassword);
      }
      grantAdminSession(userEmail);
      setIsLoggedIn(true);
      setUserRole("admin");
      toast.success(`Admin access granted`, { description: `Welcome, ${userEmail.split("@")[0]}` });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Authentication failed.";
      setLoginError(msg);
    }
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setIsLoggedIn(false);
    setUserRole("student");
    toast.success("Admin session cleared");
  };

  return (
    <div className="min-h-screen bg-white pb-safe-tabbar md:pb-0">
      <div className="h-1 w-full bg-[#D4AF37]" />

      <header className="border-b border-[#E8DDB0] safe-top">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 text-sm text-[#1A1A1A]/70 hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </Link>
          <div className="flex items-center gap-3">
            {isAdminUser() && (
              <>
                <Badge className="bg-[#FBF7E9] text-[#B8941F] border border-[#E8DDB0] hover:bg-[#FBF7E9]">
                  Admin · {getAdminEmail()?.split("@")[0]}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAdminLogout}
                  className="text-[#1A1A1A]/70 hover:bg-[#FBF7E9] hover:text-[#1A1A1A]"
                >
                  End session
                </Button>
              </>
            )}
            <BackendStatus />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="mb-6 md:mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] tracking-tight">Settings</h1>
          <p className="mt-2 text-sm md:text-base text-[#1A1A1A]/70">
            Configure the Companion to suit how you work.
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm">
            {isSaving ? (
              <span className="inline-flex items-center text-[#1A1A1A]/60">
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Saving…
              </span>
            ) : lastSaved ? (
              <span className="inline-flex items-center text-[#1A1A1A]/60">
                <CheckCircle2 className="h-3 w-3 mr-2 text-emerald-600" />
                Auto-saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : (
              <span className="text-[#1A1A1A]/50 text-xs">Changes save automatically.</span>
            )}
          </div>
        </div>

        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8 bg-[#FBF7E9] border border-[#E8DDB0] p-1 h-auto">
            <TabsTrigger
              value="core"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm text-[#1A1A1A]/60 py-2"
            >
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger
              value="knowledge"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm text-[#1A1A1A]/60 py-2"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Knowledge</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm text-[#1A1A1A]/60 py-2"
            >
              <BrainCircuit className="h-4 w-4" />
              <span className="hidden sm:inline">AI behavior</span>
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm text-[#1A1A1A]/60 py-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

            {/* Core Configuration Tab - Always accessible */}
            <TabsContent value="core">
              <SettingsSection
                title="API Keys & System Connection"
                description="Configure connections to AI providers and backend systems"
                icon={<Globe className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Use ALU Knowledge Base</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect to local ALU knowledge base (recommended for most users)
                      </p>
                    </div>
                    <Switch 
                      checked={useLocalBackend} 
                      onCheckedChange={toggleUseLocalBackend} 
                    />
                  </div>
                  
                  {useLocalBackend && (
                    <div className="space-y-3">
                      <Label htmlFor="backend-url">Backend URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backend-url"
                          placeholder="http://localhost:8000"
                          value={backendUrl}
                          onChange={(e) => setBackendUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          onClick={testBackendConnection}
                          disabled={isTestingBackend}
                        >
                          {isTestingBackend ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <span>Test Connection</span>
                          )}
                        </Button>
                      </div>
                      
                      {backendTestResult !== null && (
                        <Alert variant={backendTestResult ? "default" : "destructive"} className="mt-2">
                          <AlertDescription>
                            {backendTestResult 
                              ? "Connection successful. ALU Knowledge Base is accessible."
                              : "Connection failed. Please check the URL and ensure the backend server is running."
                            }
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {!useLocalBackend && (
                    <div className="space-y-3">
                      <Label htmlFor="gemini-key">Gemini API Key</Label>
                      <div className="relative">
                        <Input
                          id="gemini-key"
                          type="password"
                          placeholder="Enter your Gemini API key"
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You can get your API key from the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
                      </p>
                    </div>
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-3">System Role</h3>
                    <Select value={userRole} onValueChange={setUserRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your role determines which features and information you can access
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium mb-3">Interface Theme</h3>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SettingsSection>
              
              {userRole === 'admin' && (
                <SettingsSection
                  title="System Status"
                  description="Monitor system health and performance metrics"
                  icon={<Gauge className="h-5 w-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-base font-medium mb-4">Component Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Backend API</span>
                          <Badge variant={systemStatus.backend === "operational" ? "outline" : "destructive"} className="bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30">
                            Operational
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Database</span>
                          <Badge variant={systemStatus.database === "operational" ? "outline" : "destructive"} className="bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30">
                            Operational
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Vector Store</span>
                          <Badge variant={systemStatus.vector_store === "operational" ? "outline" : "destructive"} className="bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/30">
                            Degraded
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>External API</span>
                          <Badge variant={systemStatus.api === "operational" ? "outline" : "destructive"} className="bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30">
                            Operational
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-4">Performance Metrics</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Average Response Time</span>
                            <span className="text-sm font-medium">{performanceMetrics.responseTime.toFixed(0)}ms</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (performanceMetrics.responseTime / 1500) * 100)} 
                            className="bg-[#D4AF37]/10 [&>div]:bg-[#D4AF37]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Token Usage (last 24h)</span>
                            <span className="text-sm font-medium">{performanceMetrics.tokenUsage.toLocaleString()}</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (performanceMetrics.tokenUsage / 10000) * 100)} 
                            className="bg-[#D4AF37]/10 [&>div]:bg-[#D4AF37]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Success Rate</span>
                            <span className="text-sm font-medium">{performanceMetrics.successRate.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={performanceMetrics.successRate} 
                            className="bg-[#D4AF37]/10 [&>div]:bg-[#2E7D32]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Cache Efficiency</span>
                            <span className="text-sm font-medium">{performanceMetrics.cachingEfficiency.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={performanceMetrics.cachingEfficiency} 
                            className="bg-[#D4AF37]/10 [&>div]:bg-[#D4AF37]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </SettingsSection>
              )}
            </TabsContent>

            {/* Knowledge Base Tab - Always accessible */}
            <TabsContent value="knowledge">
              <SettingsSection
                title="Knowledge Sources"
                description="Configure which information sources are enabled for the AI assistant"
                icon={<Book className="h-5 w-5" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(knowledgeSources).map(([source, enabled]) => {
                    const isAdminOnly = ["facultyProfiles", "courseDescriptions"].includes(source);
                    
                    return (
                      <div key={source} className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{source}</h4>
                            {isAdminOnly && (
                              <Badge className="bg-red-100 text-red-800 border-red-200">Admin Only</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Description for {source}</p>
                        </div>
                        <Switch 
                          checked={enabled}
                          disabled={isAdminOnly && !isAdminUser()}
                          onCheckedChange={(checked) => handleKnowledgeSourceToggle(source, checked)}
                        />
                      </div>
                    );
                  })}
                </div>
              </SettingsSection>

              {userRole === 'admin' && (
                <SettingsSection
                  title={
                    <div className="flex items-center gap-2">
                      <span>Advanced Knowledge Management</span>
                      {!isAdminUser() && (
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Admin Only
                        </Badge>
                      )}
                    </div>
                  }
                  description="Configure detailed knowledge base settings"
                  icon={<Database className="h-5 w-5" />}
                >
                  <div className={!isAdminUser() ? "opacity-50 pointer-events-none" : ""}>
                    {/* Admin settings content */}
                  </div>
                </SettingsSection>
              )}
            </TabsContent>

            {/* AI Configuration Tab - Always accessible */}
            <TabsContent value="ai">
              <SettingsSection
                title="Model Parameters"
                description="Configure AI model behavior and response characteristics"
                icon={<BrainCircuit className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Temperature (Creativity)</Label>
                        <span className="text-sm">{modelParameters.temperature.toFixed(2)}</span>
                      </div>
                      <Slider 
                        value={[modelParameters.temperature]} 
                        min={0} 
                        max={1}
                        step={0.01}
                        onValueChange={(val) => handleParameterChange('temperature', val)}
                        className="[&>span]:bg-[#D4AF37] [&>span]:border-[#D4AF37]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower values produce more consistent, deterministic responses. Higher values produce more creative, varied responses.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Top P (Diversity)</Label>
                        <span className="text-sm">{modelParameters.topP.toFixed(2)}</span>
                      </div>
                      <Slider 
                        value={[modelParameters.topP]} 
                        min={0} 
                        max={1}
                        step={0.01}
                        onValueChange={(val) => handleParameterChange('topP', val)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls diversity of responses. Lower values focus on more likely completions.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Maximum Tokens</Label>
                        <span className="text-sm">{modelParameters.maxTokens}</span>
                      </div>
                      <Slider 
                        value={[modelParameters.maxTokens]} 
                        min={256} 
                        max={4096}
                        step={128}
                        onValueChange={(val) => handleParameterChange('maxTokens', val)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum length of generated responses. Higher values allow for longer, more detailed answers.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Presence Penalty</Label>
                        <span className="text-sm">{modelParameters.presencePenalty.toFixed(2)}</span>
                      </div>
                      <Slider 
                        value={[modelParameters.presencePenalty]} 
                        min={0} 
                        max={2}
                        step={0.1}
                        onValueChange={(val) => handleParameterChange('presencePenalty', val)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Reduces repetition of topics. Higher values discourage the model from repeating the same information.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Frequency Penalty</Label>
                        <span className="text-sm">{modelParameters.frequencyPenalty.toFixed(2)}</span>
                      </div>
                      <Slider 
                        value={[modelParameters.frequencyPenalty]} 
                        min={0} 
                        max={2}
                        step={0.1}
                        onValueChange={(val) => handleParameterChange('frequencyPenalty', val)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Reduces repetition of specific phrases. Higher values discourage the model from repeating the same words.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-base font-medium">Response Style & Format</h3>
                    
                    <div className="space-y-2">
                      <Label>Response Style</Label>
                      <Select defaultValue="balanced">
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="precise">Precise & Factual</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="creative">Creative & Conversational</SelectItem>
                          <SelectItem value="concise">Brief & Concise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label>System Instructions</Label>
                      <Textarea 
                        placeholder="Enter custom instructions for the AI assistant..."
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-muted-foreground">
                        Define how the AI should behave, what tone to use, and any specific instructions for responses.
                      </p>
                    </div>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection
                title="Feature Management"
                description="Control which AI capabilities are enabled"
                icon={<Zap className="h-5 w-5" />}
              >
                <div className="space-y-2 divide-y">
                  {features
                    .filter(feature => {
                      // For admin users, show all features
                      if (isAdminUser()) return true;
                      
                      // For regular users, only show public/beta features that are ENABLED
                      return (
                        (feature.access === "public" || 
                         (feature.access === "beta" && userRole !== "student")) && 
                        feature.enabled && 
                        !feature.comingSoon
                      );
                    })
                    .map(feature => {
                      const isAdminOnlyFeature = feature.access === "admin" || feature.access === "developer";
                      
                      return (
                        <div 
                          key={feature.id} 
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            feature.comingSoon ? 'bg-muted/50' : ''
                          } ${isAdminOnlyFeature && !isAdminUser() ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{feature.name}</h4>
                              {isAdminOnlyFeature && (
                                <Badge className="bg-red-100 text-red-800 border-red-200">Admin Only</Badge>
                              )}
                              {feature.beta && (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200">Beta</Badge>
                              )}
                              {feature.comingSoon && (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200">Coming Soon</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                          </div>
                          <Switch 
                            checked={feature.enabled}
                            disabled={
                              feature.comingSoon ||
                              (isAdminOnlyFeature && !isAdminUser())
                            }
                            onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                          />
                        </div>
                      );
                    })
                    .filter(Boolean)
                  }
                </div>
              </SettingsSection>
            </TabsContent>

            {/* Advanced Tab - Protected with login */}
            <TabsContent value="advanced">
              {!isAdminUser() ? (
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2 text-[#D4AF37]">
                      <Shield className="h-5 w-5" /> Admin Access Required
                    </CardTitle>
                    <CardDescription>
                      This section contains advanced system configurations only accessible to administrators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="admin@alueducation.com"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="border-[#D4AF37]/20 focus:border-[#D4AF37]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          className="border-[#D4AF37]/20 focus:border-[#D4AF37]"
                        />
                      </div>
                      {loginError && (
                        <Alert variant="destructive">
                          <AlertDescription>{loginError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleLogin} 
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A]"
                    >
                      Authenticate
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <>
                  <SettingsSection
                    title="Developer Features"
                    description="Advanced configuration options for developers"
                    icon={<Code className="h-5 w-5" />}
                  >
                    <Tabs defaultValue="api-console" className="w-full">
                      <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="api-console">API Console</TabsTrigger>
                        <TabsTrigger value="api-docs">API Documentation</TabsTrigger>
                        <TabsTrigger value="api-history">API History</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="api-console" className="mt-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Select value={apiMethod} onValueChange={setApiMethod}>
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Input 
                              value={apiEndpoint} 
                              onChange={e => setApiEndpoint(e.target.value)}
                              placeholder="/api/endpoint"
                              className="flex-1"
                            />
                            
                            <Button 
                              onClick={testApiEndpoint} 
                              disabled={isApiLoading}
                              className="gap-2 bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A]"
                            >
                              {isApiLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <PlayCircle className="h-4 w-4" />
                              )}
                              Send Request
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Request Payload</Label>
                              <Textarea 
                                value={apiPayload}
                                onChange={e => setApiPayload(e.target.value)}
                                className="font-mono text-xs h-[300px]"
                                placeholder="Enter JSON payload here"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Response</Label>
                              <div className="relative">
                                <Textarea 
                                  value={apiResponse}
                                  readOnly
                                  className="font-mono text-xs h-[300px] bg-gray-50"
                                  placeholder="Response will appear here"
                                />
                                {isApiLoading && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                    <RefreshCw className="h-6 w-6 animate-spin text-[#D4AF37]" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="api-docs" className="mt-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="cursor-pointer hover:border-[#D4AF37]/40 transition-colors"
                                  onClick={() => navigate("/admin/api-docs")}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium">Chat API</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">
                                  Core endpoints for the chat functionality
                                </p>
                                <div className="mt-4 flex justify-between text-xs">
                                  <Badge variant="outline" className="bg-green-50 text-green-800">GET</Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-800">POST</Badge>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="cursor-pointer hover:border-[#D4AF37]/40 transition-colors"
                                  onClick={() => navigate("/admin/api-docs")}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium">Knowledge API</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">
                                  Manage and query the knowledge base
                                </p>
                                <div className="mt-4 flex justify-between text-xs">
                                  <Badge variant="outline" className="bg-green-50 text-green-800">GET</Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-800">POST</Badge>
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800">PUT</Badge>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="cursor-pointer hover:border-[#D4AF37]/40 transition-colors"
                                  onClick={() => navigate("/admin/api-docs")}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium">Admin API</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">
                                  System administration and monitoring
                                </p>
                                <div className="mt-4 flex justify-between text-xs">
                                  <Badge variant="outline" className="bg-green-50 text-green-800">GET</Badge>
                                  <Badge variant="outline" className="bg-red-50 text-red-800">DELETE</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <Alert className="bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-700 text-sm">
                              View the complete API documentation for detailed reference and examples
                            </AlertDescription>
                          </Alert>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="api-history" className="mt-4">
                        <div className="space-y-4">
                          <h3 className="text-base font-medium">Recent API Calls</h3>
                          
                          {(() => {
                            // Get API history from localStorage
                            const apiHistory = JSON.parse(localStorage.getItem("API_CALL_HISTORY") || "[]");
                            
                            if (apiHistory.length === 0) {
                              return (
                                <div className="text-center p-8 text-muted-foreground">
                                  <Server className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                  <p>No API call history available</p>
                                  <p className="text-sm mt-1">Use the API Console to test endpoints</p>
                                </div>
                              );
                            }
                            
                            return (
                              <div className="border rounded-md divide-y">
                                {apiHistory.map((call, index) => (
                                  <div key={index} className="p-3 flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Badge 
                                          variant="outline" 
                                          className={`${
                                            call.method === "GET" 
                                              ? "bg-green-50 text-green-800" 
                                              : call.method === "POST"
                                                ? "bg-blue-50 text-blue-800"
                                                : call.method === "PUT"
                                                  ? "bg-yellow-50 text-yellow-800"
                                                  : "bg-red-50 text-red-800"
                                          }`}
                                        >
                                          {call.method}
                                        </Badge>
                                        <span className="font-mono text-sm">{call.endpoint}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {new Date(call.timestamp).toLocaleString()}
                                      </div>
                                    </div>
                                    
                                    <Badge 
                                      variant={call.success ? "outline" : "destructive"}
                                      className={`${
                                        call.success 
                                          ? "bg-green-50 text-green-800 border-green-200" 
                                          : ""
                                      }`}
                                    >
                                      {call.success ? "Success" : "Failed"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </SettingsSection>
                  
                  <SettingsSection
                    title="Analytics & Monitoring"
                    description="View system analytics and configure monitoring"
                    icon={<LineChart className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div className="border rounded-md p-5 bg-[#D4AF37]/5 border-[#D4AF37]/20">
                        <h3 className="text-base font-medium mb-4 text-[#D4AF37]">Usage Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-background p-4 rounded-md border border-[#D4AF37]/20">
                            <div className="text-sm text-muted-foreground">Total Queries</div>
                            <div className="text-2xl font-bold text-[#D4AF37]">
                              {analyticsData.totalQueries || 0}
                            </div>
                            <div className="text-xs text-[#2E7D32] flex items-center gap-1 mt-1">
                              <span>From chat history</span>
                            </div>
                          </div>
                          
                          <div className="bg-background p-4 rounded-md border border-[#D4AF37]/20">
                            <div className="text-sm text-muted-foreground">Active Users</div>
                            <div className="text-2xl font-bold text-[#D4AF37]">
                              {analyticsData.activeUsers || 0}
                            </div>
                            <div className="text-xs text-[#2E7D32] flex items-center gap-1 mt-1">
                              <span>Estimated from activity</span>
                            </div>
                          </div>
                          
                          <div className="bg-background p-4 rounded-md border border-[#D4AF37]/20">
                            <div className="text-sm text-muted-foreground">User Satisfaction</div>
                            <div className="text-2xl font-bold text-[#D4AF37]">
                              {analyticsData.satisfaction || "0.0"}%
                            </div>
                            <div className="text-xs text-[#2E7D32] flex items-center gap-1 mt-1">
                              <span>Based on feedback</span>
                            </div>
                          </div>
                        </div>
                        
                        {analyticsData.queries?.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">Queries (Last 7 Days)</h4>
                            <div className="h-40 flex items-end gap-1">
                              {analyticsData.queries.map((day, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                  <div 
                                    className="w-full bg-[#D4AF37]/80 rounded-t" 
                                    style={{ 
                                      height: `${Math.max(15, (day.count / Math.max(...analyticsData.queries.map(d => d.count))) * 100)}%` 
                                    }}
                                  ></div>
                                  <div className="text-xs mt-2 text-muted-foreground">
                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-6 text-center">
                          <Button 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => navigate("/admin/analytics")}
                          >
                            <BarChart4 className="h-4 w-4" />
                            View Detailed Analytics
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SettingsSection>

                  <SettingsSection
                    title="Feedback Management"
                    description="Review user feedback and improve the AI assistant"
                    icon={<MessageSquare className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div className="border rounded-md p-5 bg-[#D4AF37]/5 border-[#D4AF37]/20">
                        <h3 className="text-base font-medium mb-4 text-[#D4AF37]">Recent Feedback</h3>
                        
                        {(() => {
                          try {
                            const feedback = JSON.parse(localStorage.getItem('FEEDBACK') || '[]');
                            console.log("Loaded feedback:", feedback);
                            
                            if (!feedback || feedback.length === 0) {
                              return (
                                <div className="text-center p-6 bg-background rounded-md border">
                                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                                  <p className="text-muted-foreground">No feedback collected yet</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Feedback will appear here once users provide it
                                  </p>
                                </div>
                              );
                            }
                            
                            return (
                              <div className="space-y-3">
                                {feedback.slice(-5).reverse().map((item, index) => (
                                  <div 
                                    key={index} 
                                    className={`p-4 rounded-lg bg-background ${
                                      item.type === 'positive'
                                        ? 'border-green-300 border'
                                        : 'border-red-300 border'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="text-sm">Message: {item.message.substring(0, 100)}...</p>
                                        {item.details && (
                                          <p className="text-xs mt-1 text-[#1A1A1A]/50">{item.details}</p>
                                        )}
                                        <p className="text-xs text-[#1A1A1A]/50 mt-2">
                                          {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                      </div>
                                      <Badge 
                                        className={`${
                                          item.type === 'positive'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {item.type === 'positive' ? 'Positive' : 'Negative'}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          } catch (error) {
                            console.error("Error rendering feedback:", error);
                            return (
                              <div className="text-center p-4 bg-red-50 border border-red-200 rounded">
                                <p className="text-red-700">Error loading feedback data</p>
                                <Button 
                                  onClick={() => {
                                    localStorage.removeItem('FEEDBACK');
                                    alert("Feedback data reset");
                                    window.location.reload();
                                  }}
                                  className="mt-2"
                                  variant="outline"
                                >
                                  Reset Feedback Data
                                </Button>
                              </div>
                            );
                          }
                        })()}
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-base font-medium">Feedback Settings</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <div>
                              <h4 className="font-medium">Collect User Feedback</h4>
                              <p className="text-sm text-muted-foreground">Show feedback buttons after AI responses</p>
                            </div>
                            <Switch 
                              checked={collectFeedback}
                              onCheckedChange={(checked) => handleFeedbackSettingChange("collect", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <div>
                              <h4 className="font-medium">Request Details for Negative Feedback</h4>
                              <p className="text-sm text-muted-foreground">Ask for more information when users report issues</p>
                            </div>
                            <Switch 
                              checked={detailedNegativeFeedback}
                              onCheckedChange={(checked) => handleFeedbackSettingChange("detailed", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <div>
                              <h4 className="font-medium">Weekly Feedback Reports</h4>
                              <p className="text-sm text-muted-foreground">Receive email summaries of user feedback</p>
                            </div>
                            <Switch 
                              checked={weeklyReports}
                              onCheckedChange={(checked) => handleFeedbackSettingChange("weekly", checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </SettingsSection>
                </>
              )}
            </TabsContent>
        </Tabs>

        <div className="mt-12 p-4 rounded-lg bg-[#FBF7E9]/60 border border-[#E8DDB0] flex items-start gap-3">
          <Info size={16} className="text-[#B8941F] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#1A1A1A]/70">
            Settings are saved to your browser. Sign in on another device to sync them across devices in a future update.
          </p>
        </div>
      </main>
    </div>
  );
}