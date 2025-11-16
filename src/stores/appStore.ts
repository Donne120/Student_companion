// Global application state management using Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppSettings {
  activeModel: 'gemini' | 'deepseek';
  accessibilityMode: boolean;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

interface AppState {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Backend status
  backendStatus: 'online' | 'offline' | 'checking';
  setBackendStatus: (status: 'online' | 'offline' | 'checking') => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // User preferences
  recentSearches: string[];
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  
  // Feature flags
  features: {
    voiceInput: boolean;
    fileUpload: boolean;
    miniChatbot: boolean;
    analytics: boolean;
  };
  toggleFeature: (feature: keyof AppState['features']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Default settings
      settings: {
        activeModel: 'gemini',
        accessibilityMode: false,
        theme: 'dark',
        fontSize: 'medium',
        soundEnabled: true,
        notificationsEnabled: true,
      },
      
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      
      // UI State
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      
      // Backend status
      backendStatus: 'checking',
      setBackendStatus: (status) => set({ backendStatus: status }),
      
      // Loading
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Error handling
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Recent searches
      recentSearches: [],
      addRecentSearch: (search) =>
        set((state) => ({
          recentSearches: [
            search,
            ...state.recentSearches.filter((s) => s !== search),
          ].slice(0, 10), // Keep only last 10
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      // Feature flags
      features: {
        voiceInput: true,
        fileUpload: true,
        miniChatbot: true,
        analytics: true,
      },
      toggleFeature: (feature) =>
        set((state) => ({
          features: {
            ...state.features,
            [feature]: !state.features[feature],
          },
        })),
    }),
    {
      name: 'alu-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        recentSearches: state.recentSearches,
        features: state.features,
      }),
    }
  )
);

// Selectors for better performance
export const useSettings = () => useAppStore((state) => state.settings);
export const useBackendStatus = () => useAppStore((state) => state.backendStatus);
export const useFeatures = () => useAppStore((state) => state.features);


