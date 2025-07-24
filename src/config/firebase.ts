
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyBKouYtC2Qn79oO_imFGOGI6xyCx_ywc5s",
  authDomain: "zarp-a78e3.firebaseapp.com",
  projectId: "zarp-a78e3",
  storageBucket: "zarp-a78e3.firebasestorage.app",
  messagingSenderId: "1071691235796",
  appId: "1:1071691235796:web:144a0b26662dde23f45641",
  measurementId: "G-112SF3PFCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);