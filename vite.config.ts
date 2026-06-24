import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd());
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Make env variables available globally in your app
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    },
    preview: {
      // Add Render domain to allowed hosts
      allowedHosts: ['alu-student-companion.onrender.com', 'localhost']
    }
  };
});
