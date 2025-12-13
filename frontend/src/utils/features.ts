export const isFeatureEnabled = (featureId: string): boolean => {
  const features = JSON.parse(localStorage.getItem('FEATURES') || '[]');
  const feature = features.find(f => f.id === featureId);
  
  // If feature isn't found in localStorage, it doesn't exist
  if (!feature) return false;
  
  // Check if feature is enabled
  if (!feature.enabled) return false;
  
  // Check access level
  const userRole = localStorage.getItem('USER_ROLE') || 'student';
  
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  // Faculty has access to public and beta features
  if (userRole === 'faculty') {
    return feature.access === 'public' || feature.access === 'beta';
  }
  
  // Students only have access to public features
  return feature.access === 'public';
};

export const initializeFeatures = () => {
  // Only initialize if features don't exist
  if (!localStorage.getItem('FEATURES')) {
    const defaultFeatures = [
      {
        id: "contextual_search",
        name: "Contextual Search",
        description: "Enhanced search with academic context awareness",
        access: "public",
        enabled: true
      },
      {
        id: "chat_history",
        name: "Conversation History",
        description: "Save and reference previous conversations",
        access: "public",
        enabled: true
      },
      {
        id: "responsive_ui",
        name: "Responsive Interface",
        description: "Adaptive design for all devices",
        access: "public",
        enabled: true
      },
      {
        id: "semantic_search",
        name: "Semantic Search",
        description: "Advanced meaning-based search capabilities",
        access: "beta",
        enabled: true,
        beta: true
      },
      {
        id: "analytics_dashboard",
        name: "Analytics Dashboard",
        description: "View detailed usage statistics and patterns",
        access: "admin",
        enabled: true
      }
    ];
    
    localStorage.setItem('FEATURES', JSON.stringify(defaultFeatures));
    console.log("Initialized default features");
  }
};