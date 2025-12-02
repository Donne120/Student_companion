// This file contains the AI service that interacts with the backend
import { Message } from "@/types/chat";
import { searchHelpCenter, SearchResult } from "./helpCenterService";

/**
 * PRODUCTION BACKEND URL - HARDCODED FOR ALL USERS
 * This is the ONLY backend URL that will be used.
 * No user configuration, no localStorage, no environment variables.
 */
const BACKEND_URL = "https://ngum-alu-chatbot.hf.space";

/**
 * Get the backend URL - always returns the hardcoded production URL
 * This ensures ALL users connect to the same backend without any configuration
 */
function getBackendUrl(): string {
  // Always return the hardcoded production URL
  console.log("🔧 Using production backend:", BACKEND_URL);
  return BACKEND_URL;
}

// Log the backend URL on initialization
console.log("✅ Backend URL initialized:", BACKEND_URL);

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
   * ENHANCED: Now searches ALU Help Center FIRST for comprehensive answers
   */
  async generateResponse(
    query: string,
    conversationHistory: Message[] = [],
    options: { personality?: Personality } = {}
  ): Promise<string> {
    try {
      // ===== STEP 1: DEEP SEARCH IN ALU HELP CENTER =====
      console.log("🔍 Searching ALU Help Center for:", query);
      const helpCenterResults = searchHelpCenter(query);
      
      // If we found highly relevant results (score >= 70), use them
      if (helpCenterResults.length > 0 && helpCenterResults[0].relevanceScore >= 70) {
        console.log("✅ Found relevant help center article:", helpCenterResults[0].article.title);
        return this.formatHelpCenterResponse(query, helpCenterResults);
      }
      
      // If we found moderate results (score >= 40), include them with backend response
      if (helpCenterResults.length > 0 && helpCenterResults[0].relevanceScore >= 40) {
        console.log("📚 Found moderate help center matches, combining with AI response");
        
        // Try to get backend response with help center context
        const isAvailable = await this.isBackendAvailable();
        if (isAvailable) {
          try {
            const backendResponse = await this.getResponseFromBackend(query, conversationHistory, options);
            // Append help center resources
            return backendResponse + "\n\n" + this.formatHelpCenterResources(helpCenterResults.slice(0, 2));
          } catch (error) {
            // If backend fails, use help center results
            return this.formatHelpCenterResponse(query, helpCenterResults);
          }
        } else {
          // Backend unavailable, use help center
          return this.formatHelpCenterResponse(query, helpCenterResults);
        }
      }

      // ===== STEP 2: USE BACKEND IF NO HELP CENTER MATCH =====
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        // Backend down, but no help center match either
        if (helpCenterResults.length > 0) {
          // Show any help center results we found
          return this.formatHelpCenterResponse(query, helpCenterResults);
        }
        throw new Error("Backend service is currently unavailable");
      }

      // Use the backend for response generation
      return await this.getResponseFromBackend(query, conversationHistory, options);
    } catch (error) {
      console.error("Error generating response:", error);
      
      // Last resort: try help center one more time
      const helpCenterResults = searchHelpCenter(query);
      if (helpCenterResults.length > 0) {
        return this.formatHelpCenterResponse(query, helpCenterResults);
      }
      
      return "I'm sorry, I'm having trouble connecting to the ALU knowledge base right now. Please try again later or visit https://help.alueducation.com for immediate assistance.";
    }
  },

  /**
   * Format help center results into a comprehensive response
   */
  formatHelpCenterResponse(query: string, results: SearchResult[]): string {
    if (results.length === 0) {
      return "I couldn't find specific information about that in the ALU Help Center. Please visit https://help.alueducation.com or contact support for assistance.";
    }

    const topResult = results[0];
    const article = topResult.article;

    let response = `# ${article.title}\n\n`;
    response += `**Category:** ${article.category}\n\n`;
    
    // Add the matched content or full content
    if (topResult.matchedContent && topResult.matchedContent.length > 100) {
      response += topResult.matchedContent + "\n\n";
    } else {
      // Show first 800 characters of content
      const contentPreview = article.content.substring(0, 800);
      response += contentPreview + (article.content.length > 800 ? "...\n\n" : "\n\n");
    }

    // Add link to full article
    response += `📖 **[Read Full Article](${article.url})**\n\n`;

    // Add related articles if available
    if (results.length > 1) {
      response += `### Related Resources:\n\n`;
      for (let i = 1; i < Math.min(4, results.length); i++) {
        const relatedArticle = results[i].article;
        response += `- [${relatedArticle.title}](${relatedArticle.url}) (${relatedArticle.category})\n`;
      }
      response += `\n`;
    }

    // Add help center link
    response += `\n---\n\n`;
    response += `💡 **Need more help?** Visit the [ALU Help Center](https://help.alueducation.com) or contact:\n`;
    response += `- 📧 Email: support@alueducation.com\n`;
    response += `- 📞 Phone: +250 788 309 667 (Rwanda)\n`;

    return response;
  },

  /**
   * Format help center resources as additional context
   */
  formatHelpCenterResources(results: SearchResult[]): string {
    // Disabled - don't show help center resources section
    return "";
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
      // Use /health endpoint for proper health checking
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/health`, {
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
      
      // Hugging Face Model Settings - DISABLED by default (API deprecated)
      // Users can enable with their own HF token if needed
      const useHuggingFaceModel = localStorage.getItem('USE_HUGGINGFACE_MODEL') === 'true'; // Default: disabled
      const hfModelName = localStorage.getItem('HF_MODEL_NAME') || 'mistralai/Mistral-7B-Instruct-v0.2';
      
      // Backend URL (always use the dynamic function to get latest URL)
      const backendUrl = getBackendUrl();
      const endpoint = `${backendUrl}/api/chat`; // Backend endpoint is /api/chat
      
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
          options: {
            ...options,
            use_huggingface_model: useHuggingFaceModel, // ✅ ENABLE HF MODEL
            hf_model: hfModelName // ✅ SEND MODEL NAME
          },
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
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/nyptho/status`, {
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
