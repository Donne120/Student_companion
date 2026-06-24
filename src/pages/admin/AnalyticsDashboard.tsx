import { useCallback, useEffect, useState } from "react";
import { requireAdmin } from "@/utils/adminAuth";
import { adminFetch } from "@/config/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clipboard, Download, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Types for analytics data (derived from the backend's GET /api/admin/overview).
interface AnalyticsData {
  totalQueries: number;
  totalStudents: number;
  activeStudents7d: number;
  totalConversations: number;
  queryCategories: {name: string, count: number}[];
  topQueries: {query: string, count: number}[];
  dailyUsage: {date: string, count: number}[];
}

// Shape returned by GET /api/admin/overview (admin_routes.py: the three Aurora
// analytics views). Fields are nullable because the views may have no rows yet.
interface OverviewResponse {
  overview: {
    total_students?: number;
    active_students_7d?: number;
    total_conversations?: number;
    total_student_messages?: number;
    open_inquiries?: number;
    bookings_30d?: number;
  } | null;
  top_themes: { theme: string; question_count: number }[];
  engagement_daily: { day: string; student_messages: number }[];
}

// Map the backend overview payload onto the dashboard's view model. The Aurora
// views expose engagement by theme + day; we surface those directly rather than
// inventing metrics the backend doesn't track (response time / satisfaction are
// not in the data layer yet, so they read 0).
const toAnalytics = (data: OverviewResponse): AnalyticsData => {
  const themes = data.top_themes ?? [];
  const daily = data.engagement_daily ?? [];
  const ov = data.overview ?? {};

  return {
    totalQueries: ov.total_student_messages ?? 0,
    totalStudents: ov.total_students ?? 0,
    activeStudents7d: ov.active_students_7d ?? 0,
    totalConversations: ov.total_conversations ?? 0,
    queryCategories: themes.map((t) => ({ name: t.theme, count: t.question_count })),
    topQueries: themes.map((t) => ({ query: t.theme, count: t.question_count })),
    dailyUsage: daily.map((d) => ({
      date: new Date(d.day).toLocaleDateString(undefined, { weekday: "short" }),
      count: d.student_messages,
    })),
  };
};

// ALU brand colors
const ALU_COLORS = {
  primary: "#D4AF37", // Deep blue
  secondary: "#D4AF37", // Orange
  accent: "#D4AF37", // Gold/Yellow
  neutral: "#334155", // Slate
};

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("week");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Live Aurora analytics via the admin overview route. adminFetch attaches
      // the signed-in admin's Firebase bearer token; the backend's require_admin
      // gate rejects non-admins with 401/403.
      const response = await adminFetch("/api/admin/overview");
      if (!response.ok) {
        throw new Error(`Server responded ${response.status}`);
      }
      const data: OverviewResponse = await response.json();
      setAnalytics(toAnalytics(data));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to fetch analytics:", err);
      setError(msg);
      toast.error("Could not load analytics", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, timeRange]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#D4AF37]" />
          <p className="mt-4 text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6 flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-lg">{error ? `Failed to load analytics: ${error}` : "No analytics data available"}</p>
        <Button variant="outline" onClick={fetchAnalytics} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
        <Link to="/settings" className="text-[#D4AF37] hover:underline text-sm">Back to Settings</Link>
      </div>
    );
  }

  // For a real visualization, we would use charts from recharts
  // This is just a placeholder for now
  const maxDaily = Math.max(1, ...analytics.dailyUsage.map((d) => d.count));
  const dailyUsageChart = analytics.dailyUsage.length === 0 ? (
    <div className="h-64 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center text-muted-foreground">
      No activity recorded yet
    </div>
  ) : (
    <div className="h-64 bg-[#D4AF37]/10 rounded-lg flex items-end p-4 justify-between">
      {analytics.dailyUsage.map((day, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className="bg-[#D4AF37] w-12 rounded-t-lg"
            style={{ height: `${Math.max(2, (day.count / maxDaily) * 100)}%` }}
          ></div>
          <span className="text-xs mt-2">{day.date}</span>
        </div>
      ))}
    </div>
  );

  // Category breakdown — proportional bars from the real question themes.
  const categoryTotal = analytics.queryCategories.reduce((sum, c) => sum + c.count, 0);
  const categoryChart = analytics.queryCategories.length === 0 ? (
    <div className="h-64 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center text-muted-foreground">
      No categorized questions yet
    </div>
  ) : (
    <div className="h-64 bg-[#D4AF37]/10 rounded-lg p-4 flex flex-col justify-center gap-3">
      {analytics.queryCategories.map((cat, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{cat.name}</span>
            <span className="text-muted-foreground">{cat.count}</span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D4AF37]"
              style={{ width: `${categoryTotal ? (cat.count / categoryTotal) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link to="/settings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
            <span>Back to Settings</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#D4AF37]">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Download (coming soon)" disabled>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Student Messages</CardTitle>
            <CardDescription>Total questions asked</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.totalQueries.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Students</CardTitle>
            <CardDescription>Registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.totalStudents.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active (7 days)</CardTitle>
            <CardDescription>Students active this week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.activeStudents7d.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Total chat sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.totalConversations.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-md bg-[#D4AF37]/10 mb-6">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1A1A]"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="usage" 
            className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1A1A]"
          >
            Usage
          </TabsTrigger>
          <TabsTrigger 
            value="topics" 
            className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1A1A]"
          >
            Topics
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1A1A]"
          >
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage</CardTitle>
                <CardDescription>Number of queries per day</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyUsageChart}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Query Categories</CardTitle>
                <CardDescription>Distribution by topic</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryChart}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Question Themes</CardTitle>
                <CardDescription>Most common topics students ask about</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topQueries.length === 0 && (
                    <p className="text-center py-4 text-muted-foreground">No questions recorded yet</p>
                  )}
                  {analytics.topQueries.map((query, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{i + 1}.</span>
                        <span className="font-medium">{query.query}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{query.count} queries</span>
                        <Button variant="ghost" size="icon">
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Detailed usage data coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Usage statistics will be available soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Topic Analysis</CardTitle>
              <CardDescription>Topic breakdown coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Topic analysis will be available soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Performance metrics coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Performance metrics will be available soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const AnalyticsDashboardWithAuth = requireAdmin(AnalyticsDashboard);
export default AnalyticsDashboardWithAuth;