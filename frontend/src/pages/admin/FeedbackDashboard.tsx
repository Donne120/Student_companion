import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart, CheckCircle, Filter, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Create requireAdmin function directly in this file for now
const requireAdmin = <P extends object>(Component: React.ComponentType<P>) => {
  const AdminProtectedComponent = function(props: P) {
    const isAdmin = localStorage.getItem("USER_ROLE") === "admin";
    
    if (!isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-500 mb-6">You need admin privileges to view this page.</p>
          <Link to="/" className="text-[#0F4C81] hover:underline">Return to home</Link>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
  
  // Set display name for React Fast Refresh
  AdminProtectedComponent.displayName = `RequireAdmin(${Component.displayName || Component.name || 'Component'})`;
  
  return AdminProtectedComponent;
};

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

// Mock feedback data
const mockFeedback: Feedback[] = [
  {
    id: 'fb-1',
    type: 'positive',
    message: 'The assistant provided accurate information about campus locations.',
    userQuery: 'Where is ALU located?',
    aiResponse: 'ALU has campuses in Rwanda (Kigali) and Mauritius (Beau Plan)...',
    timestamp: '2023-08-15T14:32:00Z',
    category: 'accuracy'
  },
  {
    id: 'fb-2',
    type: 'negative',
    message: 'The AI didn\'t understand my question about transfer credits.',
    userQuery: 'How do I transfer credits from my previous university?',
    aiResponse: 'I don\'t have specific information about credit transfer processes...',
    timestamp: '2023-08-14T09:15:00Z',
    category: 'knowledge'
  },
  {
    id: 'fb-3',
    type: 'negative',
    message: 'The response was too vague and didn\'t answer my specific question.',
    userQuery: 'What are the admission requirements for the MBA program?',
    aiResponse: 'Admission requirements vary by program. Generally, you\'ll need...',
    timestamp: '2023-08-13T16:45:00Z',
    category: 'specificity'
  },
  {
    id: 'fb-4',
    type: 'positive',
    message: 'Very helpful information about the scholarship application process!',
    userQuery: 'How do I apply for scholarships at ALU?',
    aiResponse: 'To apply for scholarships at ALU, you should start by...',
    timestamp: '2023-08-12T11:20:00Z',
    category: 'helpfulness'
  },
  {
    id: 'fb-5',
    type: 'positive',
    message: 'The AI provided clear and concise information.',
    userQuery: 'What is the academic calendar for this year?',
    aiResponse: 'The academic year at ALU is divided into three terms...',
    timestamp: '2023-08-11T13:50:00Z',
    category: 'clarity'
  }
];

const FeedbackDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('all');
  const [feedbackType, setFeedbackType] = useState('all');
  
  // Filter feedback based on search term and filters
  const filteredFeedback = mockFeedback.filter(feedback => {
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
        <h1 className="text-3xl font-bold text-[#0F4C81]">Feedback Management</h1>
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
            <p className="text-4xl font-bold">{mockFeedback.filter(f => f.type === 'positive').length}</p>
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
            <p className="text-4xl font-bold">{mockFeedback.filter(f => f.type === 'negative').length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-[#0F4C81]" />
              Satisfaction Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {Math.round((mockFeedback.filter(f => f.type === 'positive').length / mockFeedback.length) * 100)}%
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
            <TabsList className="grid grid-cols-3 max-w-[400px] bg-[#0F4C81]/10 mb-6">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
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
      
      <div className="bg-[#0F4C81]/5 rounded-md p-3 mb-3">
        <h3 className="font-medium text-sm">User Query:</h3>
        <p className="text-sm mt-1">{feedback.userQuery}</p>
      </div>
      
      <div className="bg-[#0F4C81]/5 rounded-md p-3">
        <h3 className="font-medium text-sm">AI Response:</h3>
        <p className="text-sm mt-1">{feedback.aiResponse}</p>
      </div>
    </div>
  );
};

// Name the wrapped component for Fast Refresh
const AdminFeedbackDashboard = requireAdmin(FeedbackDashboard);
export default AdminFeedbackDashboard;