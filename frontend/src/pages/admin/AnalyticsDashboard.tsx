import { useEffect, useState } from "react";
import { requireAdmin } from "@/utils/adminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clipboard, Download, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types for analytics data
interface AnalyticsData {
  totalQueries: number;
  queryCategories: {name: string, count: number}[];
  responseTime: number;
  userSatisfaction: number;
  topQueries: {query: string, count: number}[];
  dailyUsage: {date: string, count: number}[];
}

// Mock data - to be replaced with actual API call
const mockAnalytics: AnalyticsData = {
  totalQueries: 1287,
  queryCategories: [
    {name: "Academic", count: 450},
    {name: "Administrative", count: 350},
    {name: "Technical", count: 280},
    {name: "Campus Life", count: 207}
  ],
  responseTime: 0.82,
  userSatisfaction: 0.87,
  topQueries: [
    {query: "ALU location", count: 89},
    {query: "Registration deadline", count: 76},
    {query: "Course prerequisites", count: 62},
    {query: "Grading policy", count: 58},
    {query: "Internship opportunities", count: 51}
  ],
  dailyUsage: [
    {date: "Mon", count: 145},
    {date: "Tue", count: 132},
    {date: "Wed", count: 164},
    {date: "Thu", count: 123},
    {date: "Fri", count: 132},
    {date: "Sat", count: 90},
    {date: "Sun", count: 72}
  ]
};

// ALU brand colors
const ALU_COLORS = {
  primary: "#0F4C81", // Deep blue
  secondary: "#E94E1B", // Orange
  accent: "#FFC72C", // Gold/Yellow
  neutral: "#334155", // Slate
};

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    // Replace with actual API call
    const fetchAnalytics = async () => {
      try {
        // const response = await fetch("/api/admin/analytics");
        // const data = await response.json();
        // setAnalytics(data);
        
        // Using mock data for now
        setTimeout(() => {
          setAnalytics(mockAnalytics);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#0F4C81]" />
          <p className="mt-4 text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="container mx-auto p-6 flex justify-center items-center h-screen">Failed to load analytics data</div>;
  }

  // For a real visualization, we would use charts from recharts
  // This is just a placeholder for now
  const mockBarChart = (
    <div className="h-64 bg-[#0F4C81]/10 rounded-lg flex items-end p-4 justify-between">
      {analytics.dailyUsage.map((day, i) => (
        <div key={i} className="flex flex-col items-center">
          <div 
            className="bg-[#0F4C81] w-12 rounded-t-lg" 
            style={{ height: `${(day.count / 200) * 100}%` }}
          ></div>
          <span className="text-xs mt-2">{day.date}</span>
        </div>
      ))}
    </div>
  );

  // Mock pie chart
  const mockPieChart = (
    <div className="h-64 bg-[#0F4C81]/10 rounded-lg p-4 flex items-center justify-center">
      <div className="w-40 h-40 rounded-full border-8 border-[#0F4C81] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[#E94E1B]" style={{ clipPath: 'polygon(0 0, 35% 0, 35% 100%, 0% 100%)' }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[#FFC72C]" style={{ clipPath: 'polygon(35% 0, 62% 0, 62% 100%, 35% 100%)' }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[#2E7D32]" style={{ clipPath: 'polygon(62% 0, 83% 0, 83% 100%, 62% 100%)' }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[#334155]" style={{ clipPath: 'polygon(83% 0, 100% 0, 100% 100%, 83% 100%)' }}></div>
      </div>
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
          <h1 className="text-3xl font-bold text-[#0F4C81]">Analytics Dashboard</h1>
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
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Queries</CardTitle>
            <CardDescription>All-time queries processed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.totalQueries.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Avg. Response Time</CardTitle>
            <CardDescription>In seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.responseTime}s</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>User Satisfaction</CardTitle>
            <CardDescription>Based on feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{(analytics.userSatisfaction * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Current users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">24</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-md bg-[#0F4C81]/10 mb-6">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="usage" 
            className="data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
          >
            Usage
          </TabsTrigger>
          <TabsTrigger 
            value="topics" 
            className="data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
          >
            Topics
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
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
                {mockBarChart}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Query Categories</CardTitle>
                <CardDescription>Distribution by topic</CardDescription>
              </CardHeader>
              <CardContent>
                {mockPieChart}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Queries</CardTitle>
                <CardDescription>Most common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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