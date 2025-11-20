// This file contains the AI service that interacts with the backend
import { Message } from "@/types/chat";

// Make sure environment variable is set to Hugging Face URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Update to match your Hugging Face API endpoint
const CHAT_ENDPOINT = `${API_URL}/chat`;  // Backend endpoint is /chat (no /api prefix)

/**
 * Service for interacting with the AI backend
 */
// Define a type for personality options
type Personality = {
  name?: string;
  traits?: string[];
  tone?: string;
  [key: string]: unknown;
};

export const aiService = {
  // Cache for backend availability to reduce repeated checks
  _backendAvailableCache: {
    status: null as boolean | null,
    timestamp: 0,
    expiryMs: 30000, // 30 seconds cache validity
  },

  /**
   * Generates a response from the AI
   */
  async generateResponse(
    query: string,
    conversationHistory: Message[] = [],
    options: { personality?: Personality } = {}
  ): Promise<string> {
    try {
      // Check if backend is available
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error("Backend service is currently unavailable");
      }

      // Use the backend for response generation
      return await this.getResponseFromBackend(query, conversationHistory, options);
    } catch (error) {
      console.error("Error generating response:", error);
      return "I'm sorry, I'm having trouble connecting to the ALU knowledge base right now. Please try again later.";
    }
  },

  /**
   * Checks if the backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    // Use cache if valid
    const now = Date.now();
    if (
      this._backendAvailableCache.status !== null &&
      now - this._backendAvailableCache.timestamp < this._backendAvailableCache.expiryMs
    ) {
      return this._backendAvailableCache.status;
    }

    try {
      // Hugging Face spaces often don't have a /health endpoint
      // Try a simple GET request to the root instead
      const response = await fetch(`${API_URL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // Increase timeout
      });

      const isAvailable = response.ok;
      
      // Update cache
      this._backendAvailableCache.status = isAvailable;
      this._backendAvailableCache.timestamp = now;
      
      return isAvailable;
    } catch (error) {
      console.error("Backend health check failed:", error);
      
      // Update cache
      this._backendAvailableCache.status = false;
      this._backendAvailableCache.timestamp = now;
      
      return false;
    }
  },
      
  /**
   * Gets a response from the backend
   */
  async getResponseFromBackend(
    query: string,
    conversationHistory: Message[],
    options: { personality?: Personality } = {}
  ): Promise<string> {
    try {
      // ✅ READ SETTINGS FROM LOCALSTORAGE
      
      // Model parameters
      const savedModelParams = JSON.parse(
        localStorage.getItem('MODEL_PARAMETERS') || 
        JSON.stringify({ temperature: 0.7, topP: 0.9, maxTokens: 1024, presencePenalty: 0.2, frequencyPenalty: 0.2 })
      );
      
      // Knowledge sources
      const savedKnowledgeSources = JSON.parse(localStorage.getItem('KNOWLEDGE_SOURCES') || '{}');
      const enabledKnowledgeSources = Object.keys(savedKnowledgeSources).filter(key => savedKnowledgeSources[key]);
      
      // System instructions
      const systemInstructions = localStorage.getItem('SYSTEM_INSTRUCTIONS') || '';
      
      // Response style
      const responseStyle = localStorage.getItem('RESPONSE_STYLE') || 'balanced';
      
      // Gemini API Key
      const geminiApiKey = localStorage.getItem('GEMINI_API_KEY') || '';
      
      // Backend URL (check if custom backend is enabled)
      const customBackendUrl = localStorage.getItem('BACKEND_URL');
      const useLocalBackend = localStorage.getItem('USE_LOCAL_BACKEND') === 'true';
      const backendUrl = (useLocalBackend && customBackendUrl) ? customBackendUrl : API_URL;
      const endpoint = `${backendUrl}/chat`; // Backend endpoint is /chat (no /api prefix)
      
      // Convert the conversation history to the format expected by the backend
      const history = conversationHistory.map((message) => ({
        role: message.isAi ? "assistant" : "user",
        content: message.text,
      }));

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          history,
          // ✅ SEND ALL SETTINGS TO BACKEND
          temperature: savedModelParams.temperature,
          top_p: savedModelParams.topP,
          max_tokens: savedModelParams.maxTokens,
          presence_penalty: savedModelParams.presencePenalty,
          frequency_penalty: savedModelParams.frequencyPenalty,
          knowledge_sources: enabledKnowledgeSources.length > 0 ? enabledKnowledgeSources : undefined,
          system_prompt: systemInstructions || undefined,
          response_style: responseStyle,
          gemini_api_key: geminiApiKey || undefined, // ✅ SEND GEMINI KEY
          options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend response error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "No response from backend";
    } catch (error) {
      console.error("Error getting response from backend:", error);
      throw new Error("Failed to get response from backend");
    }
  },

  /**
   * Gets the backend status information
   */
  async getBackendStatus(): Promise<{ status: string; message: string }> {
    const isAvailable = await this.isBackendAvailable();
    
    return {
      status: isAvailable ? 'online' : 'offline',
      message: isAvailable ? 'Knowledge base connected' : 'Knowledge base unavailable'
    };
  },

  /**
   * Gets the status of the Nyptho system
   */
  async getNypthoStatus(): Promise<{
    ready: boolean;
    learning: {
      observation_count: number;
      learning_rate: number;
    };
  }> {
    try {
      const response = await fetch(`${API_URL}/nyptho/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(2000),
      });

      if (!response.ok) {
        return { ready: false, learning: { observation_count: 0, learning_rate: 0 } };
      }

      const data = await response.json();
      return {
        ready: data.ready || false,
        learning: data.learning || { observation_count: 0, learning_rate: 0 }
      };
    } catch (error) {
      console.error("Error getting Nyptho status:", error);
      return { ready: false, learning: { observation_count: 0, learning_rate: 0 } };
    }
  }
};
