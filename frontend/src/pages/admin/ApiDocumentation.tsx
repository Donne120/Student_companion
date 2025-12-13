import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocumentation() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-8">
        <Link to="/settings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mr-4">
          <ArrowLeft size={20} />
          <span>Back to Settings</span>
        </Link>
        <h1 className="text-3xl font-bold text-[#0F4C81]">API Documentation</h1>
      </div>
      
      <p className="text-gray-500 mb-6">
        Complete documentation for the ALU Student Companion API endpoints.
      </p>

      <Tabs defaultValue="chat">
        <TabsList className="mb-4 bg-[#0F4C81]/10">
          <TabsTrigger 
            value="chat" 
            className="data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
          >
            Chat API
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
          >
            Documents API
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
          >
            Analytics API
          </TabsTrigger>
          <TabsTrigger 
            value="admin" 
            className="data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
          >
            Admin API
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Chat Endpoints</CardTitle>
              <CardDescription>
                Endpoints for interacting with the chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">POST /api/chat</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4">
                  <pre className="text-sm overflow-x-auto">
                    {`// Request
{
  "message": "Where is ALU located?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there! How can I help you today?" }
  ],
  "options": {
    "personality": {
      "name": "Academic Advisor",
      "tone": "professional"
    }
  }
}`}
                  </pre>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {`// Response
{
  "response": "ALU has campuses in Rwanda (Kigali) and Mauritius (Beau Plan)...",
  "source": "ALU Brain: Campus Life",
  "confidence": 0.95
}`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">GET /health</h3>
                <p className="mb-2">Checks if the API is running and connected to all required services.</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {`// Response
{
  "status": "healthy",
  "uptime": 13624,
  "services": {
    "database": "connected",
    "vectorStore": "connected"
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Additional tabs */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Management API</CardTitle>
              <CardDescription>
                Endpoints for managing knowledge base documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Document API endpoints */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">POST /api/documents/upload</h3>
                <p className="mb-2">Upload a document to the knowledge base</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4">
                  <pre className="text-sm overflow-x-auto">
                    {`// Request (multipart/form-data)
- file: [binary document]
- metadata: 
{
  "title": "ALU Campus Guide",
  "category": "campus_services",
  "description": "Overview of campus facilities and services"
}`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">GET /api/documents/list</h3>
                <p className="mb-2">List all documents in the knowledge base</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {`// Response
{
  "documents": [
    {
      "id": "doc_123",
      "title": "ALU Campus Guide",
      "category": "campus_services",
      "dateAdded": "2023-08-15T14:30:00Z",
      "size": 1024567
    },
    // Additional documents...
  ],
  "total": 24,
  "page": 1,
  "pageSize": 20
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics API</CardTitle>
              <CardDescription>
                Endpoints for retrieving usage analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">GET /api/analytics/summary</h3>
                <p className="mb-2">Get overall usage analytics</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {`// Response
{
  "totalQueries": 4872,
  "averageResponseTime": 0.82,
  "userSatisfaction": 0.87,
  "topQueries": [
    { "query": "ALU location", "count": 89 },
    // More top queries...
  ],
  "queriesByCategory": {
    "academic": 1845,
    "administrative": 1203,
    "campus": 982,
    "other": 842
  },
  "timeRange": {
    "from": "2023-08-01T00:00:00Z",
    "to": "2023-08-31T23:59:59Z"
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Admin API</CardTitle>
              <CardDescription>
                Admin-only endpoints for system management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">POST /api/admin/system/rebuild-index</h3>
                <p className="mb-2">Rebuild the vector store index</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4">
                  <pre className="text-sm overflow-x-auto">
                    {`// Request
{
  "force": true,
  "categories": ["academic", "administrative"]  // Optional - specific categories to rebuild
}`}
                  </pre>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {`// Response
{
  "status": "success",
  "jobId": "job_rebuild_45678",
  "estimatedTimeToComplete": "120s",
  "documentsToProcess": 125
}`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">GET /api/admin/system/status</h3>
                <p className="mb-2">Get detailed system status</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {`// Response
{
  "status": "healthy",
  "components": {
    "api": { "status": "operational", "uptime": 432000 },
    "database": { "status": "operational", "connections": 12 },
    "vectorStore": { "status": "degraded", "reason": "High load" },
    "cache": { "status": "operational", "hitRate": 0.78 }
  },
  "performance": {
    "cpu": 22.5,
    "memory": 65.8,
    "disk": 42.3
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

