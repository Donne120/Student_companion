import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart, CheckCircle, Filter, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { requireAdmin } from "@/utils/adminAuth";

// Define feedback interface
interface Feedback {
  id: string;
  type: 'positive' | 'negative';
  message: string;
  userQuery: string;
  aiResponse: string;
  timestamp: string;
  category: string;
}

// Raw shape of an entry in the localStorage "FEEDBACK" array, as written by the
// chat feedback flow. Fields beyond `type`/`message`/`timestamp` are optional
// because older entries may not have them.
interface StoredFeedback {
  type?: 'positive' | 'negative';
  message?: string;
  details?: string;
  userQuery?: string;
  aiResponse?: string;
  category?: string;
  timestamp?: number | string;
}

// Load real feedback from localStorage (the same "FEEDBACK" store the chat UI
// and Settings page use) and normalize it to the dashboard's Feedback shape.
const loadFeedback = (): Feedback[] => {
  try {
    const raw = JSON.parse(localStorage.getItem("FEEDBACK") || "[]") as StoredFeedback[];
    if (!Array.isArray(raw)) return [];
    return raw.map((item, i) => ({
      id: `fb-${i}`,
      type: item.type === "positive" ? "positive" : "negative",
      message: item.message ?? "(no message)",
      userQuery: item.userQuery ?? "",
      aiResponse: item.aiResponse ?? item.details ?? "",
      timestamp: new Date(item.timestamp ?? Date.now()).toISOString(),
      category: item.category ?? "general",
    }));
  } catch (error) {
    console.error("Failed to load feedback from storage:", error);
    return [];
  }
};

const FeedbackDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('all');
  const [feedbackType, setFeedbackType] = useState('all');

  // Real feedback from localStorage, loaded once per mount.
  const allFeedback = useMemo(() => loadFeedback(), []);

  // Filter feedback based on search term and filters
  const filteredFeedback = allFeedback.filter(feedback => {
    const matchesSearch = 
      searchTerm === '' || 
      feedback.userQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      feedbackCategory === 'all' || 
      feedback.category === feedbackCategory;
    
    const matchesType = 
      feedbackType === 'all' || 
      feedback.type === feedbackType;
    
    return matchesSearch && matchesCategory && matchesType;
  });
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-8">
        <Link to="/settings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mr-4">
          <ArrowLeft size={20} />
          <span>Back to Settings</span>
        </Link>
        <h1 className="text-3xl font-bold text-[#D4AF37]">Feedback Management</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              Positive Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{allFeedback.filter(f => f.type === 'positive').length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              Negative Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{allFeedback.filter(f => f.type === 'negative').length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-[#D4AF37]" />
              Satisfaction Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {allFeedback.length === 0
                ? "0"
                : Math.round((allFeedback.filter(f => f.type === 'positive').length / allFeedback.length) * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Feedback Analysis</CardTitle>
          <CardDescription>Review and analyze user feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                  <SelectItem value="knowledge">Knowledge</SelectItem>
                  <SelectItem value="specificity">Specificity</SelectItem>
                  <SelectItem value="helpfulness">Helpfulness</SelectItem>
                  <SelectItem value="clarity">Clarity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 max-w-[400px] bg-[#D4AF37]/10 mb-6">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1A1A]"
              >
                All Feedback
              </TabsTrigger>
              <TabsTrigger 
                value="positive" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                Positive
              </TabsTrigger>
              <TabsTrigger 
                value="negative" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Negative
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="space-y-4">
                {filteredFeedback.map(feedback => (
                  <FeedbackItem key={feedback.id} feedback={feedback} />
                ))}
                
                {filteredFeedback.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No feedback matching your search criteria
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="positive">
              <div className="space-y-4">
                {filteredFeedback
                  .filter(f => f.type === 'positive')
                  .map(feedback => (
                    <FeedbackItem key={feedback.id} feedback={feedback} />
                  ))
                }
                
                {filteredFeedback.filter(f => f.type === 'positive').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No positive feedback matching your search criteria
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="negative">
              <div className="space-y-4">
                {filteredFeedback
                  .filter(f => f.type === 'negative')
                  .map(feedback => (
                    <FeedbackItem key={feedback.id} feedback={feedback} />
                  ))
                }
                
                {filteredFeedback.filter(f => f.type === 'negative').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No negative feedback matching your search criteria
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Feedback Actions</CardTitle>
          <CardDescription>Apply insights from user feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="gap-2 justify-start">
              <CheckCircle className="h-4 w-4" />
              Mark All as Reviewed
            </Button>
            
            <Button variant="outline" className="gap-2 justify-start">
              <BarChart className="h-4 w-4" />
              Generate Insights Report
            </Button>
            
            <Button variant="outline" className="gap-2 justify-start">
              <Filter className="h-4 w-4" />
              Set Up Filtering Rules
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual feedback item component
const FeedbackItem = ({ feedback }: { feedback: Feedback }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {feedback.type === 'positive' ? (
            <ThumbsUp className="h-5 w-5 text-green-600" />
          ) : (
            <ThumbsDown className="h-5 w-5 text-red-600" />
          )}
          <Badge 
            variant="outline" 
            className={feedback.type === 'positive' 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-red-50 text-red-700 border-red-200"
            }
          >
            {feedback.type === 'positive' ? 'Positive' : 'Negative'}
          </Badge>
          <Badge variant="outline">{feedback.category}</Badge>
        </div>
        <span className="text-sm text-muted-foreground">{formatDate(feedback.timestamp)}</span>
      </div>
      
      <div className="mb-3">
        <h3 className="font-medium">Feedback:</h3>
        <p className="text-sm mt-1">{feedback.message}</p>
      </div>
      
      <div className="bg-[#D4AF37]/5 rounded-md p-3 mb-3">
        <h3 className="font-medium text-sm">User Query:</h3>
        <p className="text-sm mt-1">{feedback.userQuery}</p>
      </div>
      
      <div className="bg-[#D4AF37]/5 rounded-md p-3">
        <h3 className="font-medium text-sm">AI Response:</h3>
        <p className="text-sm mt-1">{feedback.aiResponse}</p>
      </div>
    </div>
  );
};

// Name the wrapped component for Fast Refresh
const AdminFeedbackDashboard = requireAdmin(FeedbackDashboard);
export default AdminFeedbackDashboard;