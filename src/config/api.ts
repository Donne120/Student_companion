// API configuration file

// Function to determine the API URL based on the environment
export const getApiUrl = () => {
  // For local development
  if (window.location.hostname === 'localhost' || /^192\.168\./.test(window.location.hostname)) {
    return 'http://localhost:8080';
  }
  
  // For Hugging Face Space deployment
  return 'https://ngum-alu-student-companion.hf.space';
};

// Base URL for API requests
export const API_URL = getApiUrl();

// Helper function for API requests with timeout handling
export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Health check function
export const checkBackendHealth = async () => {
  try {
    // Just check root endpoint since /health doesn't exist
    const response = await fetchWithTimeout(`${API_URL}`, {}, 5000);
    return response.status === 200; // Changed to check HTTP status
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};

// Message history type
type ChatMessage = {
  role: string;
  content: string;
};

// Generate chat response
export const generateResponse = async (message: string, history: ChatMessage[] = []) => {
  const isAvailable = await checkBackendHealth();
  
  if (!isAvailable) {
    throw new Error("Backend service is currently unavailable");
  }
  
  // Removed /api prefix based on your error logs
  const response = await fetchWithTimeout(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history,
      options: { user_id: "user1" }
    }),
  });
  
  return response;
};