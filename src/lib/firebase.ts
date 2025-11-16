// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAol6UJmKpY5S4fihD1veMR-x7NE-S4SfI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nypthoria.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nypthoria",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nypthoria.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "889533985009",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:889533985009:web:6ec9a3b735426ab2917950"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set up Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Ignore the Cross-Origin-Opener-Policy warnings - they're just browser safety mechanisms
console.warn = (originalWarn => {
  return function(...args) {
    if (typeof args[0] === 'string' && args[0].includes('Cross-Origin-Opener-Policy')) {
      return; // Suppress these warnings
    }
    originalWarn.apply(console, args);
  };
})(console.warn);