// Utility to reset backend URL to correct value
export const resetBackendUrl = () => {
  const correctUrl = 'https://ngum-alu-student-companion.hf.space';
  
  // Clear old values
  localStorage.removeItem('BACKEND_URL');
  localStorage.removeItem('USE_LOCAL_BACKEND');
  
  // Set correct values
  localStorage.setItem('BACKEND_URL', correctUrl);
  localStorage.setItem('USE_LOCAL_BACKEND', 'true');
  
  console.log('✅ Backend URL reset to:', correctUrl);
  console.log('✅ Use Local Backend:', localStorage.getItem('USE_LOCAL_BACKEND'));
  
  return correctUrl;
};

// Auto-run on import
if (typeof window !== 'undefined') {
  const currentUrl = localStorage.getItem('BACKEND_URL');
  
  // If URL contains the wrong path, fix it
  if (currentUrl && currentUrl.includes('/tree/main/backend')) {
    console.warn('⚠️ Detected wrong backend URL, fixing...');
    resetBackendUrl();
    window.location.reload();
  }
}


