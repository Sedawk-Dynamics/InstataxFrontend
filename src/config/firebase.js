// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBM6znEWdfq4k-XG121TzCWOacPnyhk164",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "instatax-21727.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "instatax-21727",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "instatax-21727.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "48363146527",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:48363146527:web:9dc8f13233207cc6e0f42a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JQ6GG1ER9R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Export Firebase Auth functions for OTP verification
export { RecaptchaVerifier, signInWithPhoneNumber };

// Initialize Analytics (optional - only if you need it)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;




