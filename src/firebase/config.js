// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDU9CLz2L_Mqur9ifGzc0fbbKkHhuTHjT0",
  authDomain: "my-coach-9394a.firebaseapp.com",
  projectId: "my-coach-9394a",
  storageBucket: "my-coach-9394a.firebasestorage.app",
  messagingSenderId: "67025439273",
  appId: "1:67025439273:web:4bc33bfe58c708c3be2a38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services we'll use across the app
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;