import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Server } from "lucide-react";

// Environment variable for local development
const useLocalBackend = import.meta.env.DEV || false;

// Check if backend is available
export const BackendStatus = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Get backend URL with efficient caching
  const getBackendUrl = () => {
    // Check if a BACKEND_URL is set in localStorage (for testing)
    const storedBackendUrl = localStorage.getItem('BACKEND_URL');
    if (storedBackendUrl) return storedBackendUrl;
    
    // Local development mode
    if (useLocalBackend) return "http://localhost:8000";
    
    // Production deployment URL
    return "https://ngum-alu-chatbot.hf.space";
  };

  // Check backend availability
  const checkBackendHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      // Use a simple GET request for faster checking
      const response = await fetch(`${getBackendUrl()}/`, {
        method: "GET",
        // Reduced timeout for faster response
        signal: AbortSignal.timeout(5000)
      });
      
      setIsBackendAvailable(response.status === 200);
    } catch (error) {
      console.error("Backend health check failed:", error);
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