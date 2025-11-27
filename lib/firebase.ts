// js/firebaseConfig.js

// Import Firebase modules from CDN
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { initializeApp, getApps, getApp } from "firebase/app";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyASPJ3k8F0hu6c5AN2TPyZhZxi6ob7uQ4Q",
  authDomain: "stagenix-bf75b.firebaseapp.com",
  projectId: "stagenix-bf75b",
  storageBucket: "stagenix-bf75b.appspot.com",
  messagingSenderId: "547369807533",
  appId: "1:547369807533:web:dd1d9d279842ec48a5e024",
  databaseURL: "https://stagenix-bf75b-default-rtdb.firebaseio.com"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export default app;