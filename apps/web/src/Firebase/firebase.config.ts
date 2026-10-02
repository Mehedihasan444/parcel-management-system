import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Every value comes from a Vite env var (see apps/web/.env.example). The API
// key used to be committed directly in this file; it was purged from the git
// history and must now be supplied by the deployment environment.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);

export default auth;
