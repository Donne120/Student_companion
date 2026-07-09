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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Server,
  Globe,
  Shield,
  RefreshCw,
  PlayCircle,
  BarChart4,
  Code,
  Info,
  MessageSquare,
  Mail,
  Accessibility,
  LineChart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { isAdmin as isAdminUser, grantAdminSession, getAdminEmail, clearAdminSession } from "@/utils/adminAuth";
import { API_URL, checkBackendHealth } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { EmailBriefingSettings } from "@/components/settings/EmailBriefingSettings";

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

// Admin authentication is centralised in @/utils/adminAuth.
// The admin allowlist lives server-side (backend ADMIN_EMAILS secret) and is
// enforced by require_admin on every /api/admin/* route. The client no longer
// ships an admin-email list: we authenticate against Firebase via the standard
// /login flow, reveal the Advanced tab, and let the backend reject non-admins
// (401/403) on the actual privileged calls.

type FeedbackItem = {
  type: "positive" | "negative";
  message: string;
  details?: string;
  timestamp: number;
};

export default function Settings() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();

  // ---------------------------------------------------------------------
  // Chat preferences — each of these keys is read by the chat UI:
  //   ACCESSIBILITY_MODE          -> ChatContainer (larger text/line height)
  //   COLLECT_FEEDBACK            -> ChatFeedback (show 👍/👎 buttons)
  //   DETAILED_NEGATIVE_FEEDBACK  -> ChatFeedback (ask why on 👎)
  // ---------------------------------------------------------------------
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [collectFeedback, setCollectFeedback] = useState(true);
  const [detailedNegativeFeedback, setDetailedNegativeFeedback] = useState(true);

  useEffect(() => {
    setAccessibilityMode(localStorage.getItem("ACCESSIBILITY_MODE") === "true");
    setCollectFeedback(localStorage.getItem("COLLECT_FEEDBACK") !== "false");
    setDetailedNegativeFeedback(localStorage.getItem("DETAILED_NEGATIVE_FEEDBACK") !== "false");
  }, []);

  const updateChatPref = (key: string, value: boolean, apply: (v: boolean) => void) => {
    apply(value);
    localStorage.setItem(key, value ? "true" : "false");
    toast.success("Saved", { description: "Takes effect next time you open the chat." });
  };

  // ---------------------------------------------------------------------
  // Backend connection (read-only URL + live test)
  // ---------------------------------------------------------------------
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [backendTestResult, setBackendTestResult] = useState<null | boolean>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const testBackendConnection = async () => {
    setIsTestingBackend(true);
    setBackendTestResult(null);
    const start = Date.now();
    try {
      const healthy = await checkBackendHealth();
      setResponseTime(Date.now() - start);
      setBackendTestResult(healthy);
      if (healthy) {
        toast.success("Backend connection successful");
      } else {
        toast.error("Backend connection failed", {
          description: "The Companion backend did not respond.",
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

  // ---------------------------------------------------------------------
  // Admin session (Advanced tab)
  // ---------------------------------------------------------------------
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (isAdminUser()) {
      setIsLoggedIn(true);
      setUserEmail(getAdminEmail() ?? "");
    }
  }, []);

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
      if (!currentUser || currentUser.email?.toLowerCase() !== userEmail.toLowerCase()) {
        await login(userEmail, userPassword);
      }
      grantAdminSession(userEmail);
      setIsLoggedIn(true);
      toast.success(`Admin access granted`, { description: `Welcome, ${userEmail.split("@")[0]}` });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Authentication failed.";
      setLoginError(msg);
    }
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setIsLoggedIn(false);
    toast.success("Admin session cleared");
  };

  // ---------------------------------------------------------------------
  // Admin: live system status (real health probe, no invented metrics)
  // ---------------------------------------------------------------------
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [probeTime, setProbeTime] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    const probe = async () => {
      const start = Date.now();
      const healthy = await checkBackendHealth();
      if (cancelled) return;
      setBackendHealthy(healthy);
      setProbeTime(Date.now() - start);
    };
    probe();
    const id = setInterval(probe, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isLoggedIn]);

  // ---------------------------------------------------------------------
  // Admin: API console (sends real requests to the backend)
  // ---------------------------------------------------------------------
  const [apiEndpoint, setApiEndpoint] = useState("/api/chat");
  const [apiMethod, setApiMethod] = useState("POST");
  const [apiPayload, setApiPayload] = useState(
    JSON.stringify({ message: "Tell me about ALU's academic programs", history: [] }, null, 2)
  );
  const [apiResponse, setApiResponse] = useState("");
  const [isApiLoading, setIsApiLoading] = useState(false);

  const testApiEndpoint = async () => {
    try {
      setIsApiLoading(true);
      setApiResponse("");

      const url = API_URL + apiEndpoint;
      const options: RequestInit = {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
      };
      if (apiMethod !== "GET" && apiMethod !== "DELETE") {
        options.body = apiPayload;
      }

      const startTime = Date.now();
      const response = await fetch(url, options);
      const endTime = Date.now();
      const responseData = await response.json();

      setApiResponse(
        JSON.stringify(
          {
            status: response.status,
            statusText: response.statusText,
            responseTime: `${endTime - startTime}ms`,
            data: responseData,
          },
          null,
          2
        )
      );

      const apiHistory = JSON.parse(localStorage.getItem("API_CALL_HISTORY") || "[]");
      apiHistory.unshift({
        endpoint: apiEndpoint,
        method: apiMethod,
        timestamp: new Date().toISOString(),
        success: response.ok,
      });
      localStorage.setItem("API_CALL_HISTORY", JSON.stringify(apiHistory.slice(0, 10)));
    } catch (error) {
      setApiResponse(
        JSON.stringify(
          {
            error: error instanceof Error ? error.message : String(error),
            info: "Connection failed. Please check the backend URL and endpoint.",
          },
          null,
          2
        )
      );
    } finally {
      setIsApiLoading(false);
    }
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
            Configure the Companion to suit how you work. Changes save automatically.
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8 bg-[#FBF7E9] border border-[#E8DDB0] p-1 h-auto">
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm text-[#1A1A1A]/60 py-2"
            >
              <Server className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm text-[#1A1A1A]/60 py-2"
            >
              <Shield className="h-4 w-4" />
              <span>Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* ------------------------------------------------------------ */}
          {/* General tab                                                   */}
          {/* ------------------------------------------------------------ */}
          <TabsContent value="general">
            <SettingsSection
              title={
                <div className="flex items-center gap-2">
                  <span>Email Briefing</span>
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                    BETA
                  </Badge>
                </div>
              }
              description="Connect your ALU email and let the Companion greet you with what's new — assignments, congratulations, upcoming classes and more"
              icon={<Mail className="h-5 w-5" />}
            >
              <EmailBriefingSettings />
            </SettingsSection>

            <SettingsSection
              title="Chat Preferences"
              description="How the chat looks and what it asks you"
              icon={<MessageSquare className="h-5 w-5" />}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <Accessibility className="h-4 w-4 text-[#B8941F]" />
                      Accessibility mode
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Larger text and relaxed line spacing in the chat
                    </p>
                  </div>
                  <Switch
                    checked={accessibilityMode}
                    onCheckedChange={(v) => updateChatPref("ACCESSIBILITY_MODE", v, setAccessibilityMode)}
                    className="data-[state=checked]:bg-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <h4 className="font-medium">Feedback buttons</h4>
                    <p className="text-sm text-muted-foreground">
                      Show 👍 / 👎 after each Companion answer
                    </p>
                  </div>
                  <Switch
                    checked={collectFeedback}
                    onCheckedChange={(v) => updateChatPref("COLLECT_FEEDBACK", v, setCollectFeedback)}
                    className="data-[state=checked]:bg-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <h4 className="font-medium">Ask for details on negative feedback</h4>
                    <p className="text-sm text-muted-foreground">
                      When you report a bad answer, ask what went wrong
                    </p>
                  </div>
                  <Switch
                    checked={detailedNegativeFeedback}
                    onCheckedChange={(v) =>
                      updateChatPref("DETAILED_NEGATIVE_FEEDBACK", v, setDetailedNegativeFeedback)
                    }
                    className="data-[state=checked]:bg-[#D4AF37]"
                  />
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Connection"
              description="The Companion backend this app talks to"
              icon={<Globe className="h-5 w-5" />}
            >
              <div className="space-y-3">
                <Label>Backend</Label>
                <div className="flex gap-2 items-center">
                  <code className="flex-1 text-sm bg-[#FBF7E9]/60 border border-[#E8DDB0] rounded-md px-3 py-2 truncate">
                    {API_URL}
                  </code>
                  <Button variant="outline" onClick={testBackendConnection} disabled={isTestingBackend}>
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
                        ? `Connection successful${responseTime !== null ? ` (${responseTime}ms)` : ""}. The Companion backend is reachable.`
                        : "Connection failed. The backend may be waking up — try again in a minute."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </SettingsSection>
          </TabsContent>

          {/* ------------------------------------------------------------ */}
          {/* Advanced tab — admin only                                     */}
          {/* ------------------------------------------------------------ */}
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
                  title="System Status"
                  description="Live health of the Companion backend"
                  icon={<LineChart className="h-5 w-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="text-sm text-muted-foreground">Backend API</div>
                      <div className="mt-2">
                        {backendHealthy === null ? (
                          <Badge variant="outline">Checking…</Badge>
                        ) : backendHealthy ? (
                          <Badge variant="outline" className="bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30">
                            Operational
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Down</Badge>
                        )}
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="text-sm text-muted-foreground">Response Time</div>
                      <div className="text-2xl font-bold text-[#D4AF37] mt-1">
                        {probeTime !== null ? `${probeTime}ms` : "—"}
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="text-sm text-muted-foreground">Checked every</div>
                      <div className="text-2xl font-bold text-[#D4AF37] mt-1">30s</div>
                    </div>
                  </div>
                </SettingsSection>

                <SettingsSection
                  title="Dashboards"
                  description="Detailed analytics and feedback review"
                  icon={<BarChart4 className="h-5 w-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/analytics")}>
                      <BarChart4 className="h-4 w-4" /> Analytics
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/feedback")}>
                      <MessageSquare className="h-4 w-4" /> Feedback
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/api-docs")}>
                      <Code className="h-4 w-4" /> API Docs
                    </Button>
                  </div>
                </SettingsSection>

                <SettingsSection
                  title="API Console"
                  description="Send real requests to the backend for testing"
                  icon={<Code className="h-5 w-5" />}
                >
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
                        onChange={(e) => setApiEndpoint(e.target.value)}
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
                          onChange={(e) => setApiPayload(e.target.value)}
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

                    {/* Recent API calls (from the console above) */}
                    {(() => {
                      const apiHistory = JSON.parse(localStorage.getItem("API_CALL_HISTORY") || "[]");
                      if (apiHistory.length === 0) return null;
                      return (
                        <div className="border rounded-md divide-y">
                          {apiHistory.map(
                            (
                              call: { method: string; endpoint: string; timestamp: string; success: boolean },
                              index: number
                            ) => (
                              <div key={index} className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={
                                      call.method === "GET"
                                        ? "bg-green-50 text-green-800"
                                        : call.method === "POST"
                                          ? "bg-blue-50 text-blue-800"
                                          : call.method === "PUT"
                                            ? "bg-yellow-50 text-yellow-800"
                                            : "bg-red-50 text-red-800"
                                    }
                                  >
                                    {call.method}
                                  </Badge>
                                  <span className="font-mono text-sm">{call.endpoint}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(call.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <Badge
                                  variant={call.success ? "outline" : "destructive"}
                                  className={call.success ? "bg-green-50 text-green-800 border-green-200" : ""}
                                >
                                  {call.success ? "Success" : "Failed"}
                                </Badge>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </SettingsSection>

                <SettingsSection
                  title="Recent Feedback"
                  description="The latest 👍 / 👎 responses students left on answers"
                  icon={<MessageSquare className="h-5 w-5" />}
                >
                  {(() => {
                    const feedback: FeedbackItem[] = JSON.parse(localStorage.getItem("FEEDBACK") || "[]");
                    if (!feedback.length) {
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
                        {feedback
                          .slice(-5)
                          .reverse()
                          .map((item, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg bg-background border ${
                                item.type === "positive" ? "border-green-300" : "border-red-300"
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
                                  className={
                                    item.type === "positive"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {item.type === "positive" ? "Positive" : "Negative"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    );
                  })()}
                </SettingsSection>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-12 p-4 rounded-lg bg-[#FBF7E9]/60 border border-[#E8DDB0] flex items-start gap-3">
          <Info size={16} className="text-[#B8941F] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#1A1A1A]/70">
            Chat preferences are saved to this browser. Your email briefing settings are saved to your
            account and follow you across devices.
          </p>
        </div>
      </main>
    </div>
  );
}
