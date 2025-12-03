// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA74TfyN8Kblf9A0rr5RmnxpIQXAAnoWqg",
  authDomain: "nypthoria.firebaseapp.com",
  projectId: "nypthoria",
  storageBucket: "nypthoria.firebasestorage.app",
  messagingSenderId: "889533985009",
  appId: "1:889533985009:web:5f5617d9a88dd809917950"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set up Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Suppress Cross-Origin-Opener-Policy warnings
console.warn = (originalWarn => {
  return function(...args) {
    if (typeof args[0] === 'string' && args[0].includes('Cross-Origin-Opener-Policy')) {
      return;
    }
    originalWarn.apply(console, args);
  };
})(console.warn);
