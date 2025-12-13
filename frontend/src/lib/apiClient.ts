// Enhanced API client with better error handling and retry logic
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for monitoring
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date().getTime() - response.config.metadata.startTime.getTime();
    
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth_token');
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
          break;
          
        case 403:
          toast.error('You don\'t have permission to access this resource.');
          break;
          
        case 404:
          toast.error('Resource not found.');
          break;
          
        case 429:
          toast.error('Too many requests. Please slow down.');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors - retry once
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
            return apiClient(originalRequest);
          }
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error('An unexpected error occurred.');
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('Cannot connect to server. Please check your internet connection.');
    } else {
      // Something else happened
      toast.error('An error occurred while processing your request.');
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Health check
  health: async () => {
    try {
      const response = await apiClient.get('/health', { timeout: 5000 });
      return response.data;
    } catch (error) {
      return { status: 'offline' };
    }
  },
  
  // Chat endpoints
  chat: {
    send: async (message: string, history: any[] = [], options: any = {}) => {
      const response = await apiClient.post('/chat', {
        message,
        history,
        options,
      });
      return response.data;
    },
    
    stream: async (message: string, history: any[] = [], onChunk: (chunk: string) => void) => {
      // Implement streaming if backend supports it
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history }),
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) return;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        onChunk(chunk);
      }
    },
  },
  
  // Document endpoints
  documents: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      
      return response.data;
    },
    
    list: async () => {
      const response = await apiClient.get('/documents');
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await apiClient.delete(`/documents/${id}`);
      return response.data;
    },
  },
  
  // Feedback endpoints
  feedback: {
    submit: async (feedbackData: any) => {
      const response = await apiClient.post('/feedback', feedbackData);
      return response.data;
    },
    
    list: async () => {
      const response = await apiClient.get('/feedback');
      return response.data;
    },
  },
  
  // Analytics endpoints
  analytics: {
    track: async (event: string, properties: any = {}) => {
      try {
        await apiClient.post('/analytics/track', {
          event,
          properties,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // Silent fail for analytics
        console.error('Analytics tracking failed:', error);
      }
    },
    
    getStats: async () => {
      const response = await apiClient.get('/analytics/stats');
      return response.data;
    },
  },
};

// Export the client for custom requests
export default apiClient;

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}





