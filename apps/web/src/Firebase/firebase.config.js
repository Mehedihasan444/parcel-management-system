import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "parcel-management-app-100ca.firebaseapp.com",
  projectId: "parcel-management-app-100ca",
  storageBucket: "parcel-management-app-100ca.appspot.com",
  messagingSenderId: "20726299759",
  appId: "1:20726299759:web:2a2a5d38f16dee0150219a"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export default auth;