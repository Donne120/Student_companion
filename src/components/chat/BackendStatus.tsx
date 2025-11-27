import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Server } from "lucide-react";

/**
 * PRODUCTION BACKEND URL - HARDCODED FOR ALL USERS
 * This is the ONLY backend URL that will be used across all devices
 */
const BACKEND_URL = "https://ngum-alu-chatbot.hf.space";

// Check if backend is available
export const BackendStatus = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Get backend URL - always returns the hardcoded production URL
  const getBackendUrl = () => {
    return BACKEND_URL;
  };

  // Check backend availability
  const checkBackendHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      const backendUrl = getBackendUrl();
      console.log("🔍 Checking backend health at:", backendUrl);
      
      // Use /health endpoint for proper health checking
      const response = await fetch(`${backendUrl}/health`, {
        method: "GET",
        // Increased timeout for slower connections
        signal: AbortSignal.timeout(10000),
        // Add headers to help with CORS
        headers: {
          'Accept': 'application/json',
        },
        // Important: include credentials if needed
        mode: 'cors',
      });
      
      console.log("✅ Backend response status:", response.status);
      
      // Accept 2xx status codes as healthy
      const isHealthy = response.ok;
      setIsBackendAvailable(isHealthy);
      
      if (isHealthy) {
        const data = await response.json();
        console.log("✅ Backend health data:", data);
      }
    } catch (error) {
      console.error("❌ Backend health check failed:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        url: getBackendUrl()
      });
      setIsBackendAvailable(false);
    } finally {
      setIsLoading(false);
      setLastCheck(new Date());
    }
  }, []);

  // Check backend on component mount and set refresh interval
  useEffect(() => {
    // Check immediately on mount
    checkBackendHealth();
    
    // Then check again every 30 seconds
    const intervalId = setInterval(checkBackendHealth, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [checkBackendHealth]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <Badge 
              variant="outline" 
              className={`
                flex items-center gap-1.5 py-1 ${
                  isLoading
                    ? "bg-gray-100 text-gray-700 border-gray-300" 
                    : isBackendAvailable
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                }
              `}
            >
              <Server className="h-3.5 w-3.5" />
              {isLoading 
                ? "Checking..." 
                : isBackendAvailable 
                  ? "Backend Connected" 
                  : "Backend Offline"
              }
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Backend Status: {isLoading ? "Checking..." : isBackendAvailable ? "Connected" : "Offline"}</p>
          <p className="text-xs text-muted-foreground mt-1">Last checked: {lastCheck.toLocaleTimeString()}</p>
          <p className="text-xs text-muted-foreground">URL: {getBackendUrl()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};