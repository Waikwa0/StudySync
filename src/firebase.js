// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyABXjg4_Wv9bcVDR2XsS4-kp4Z77h2dO2c",
  authDomain: "studysync-d4a7a.firebaseapp.com",
  projectId: "studysync-d4a7a",
  storageBucket: "studysync-d4a7a.firebasestorage.app",
  messagingSenderId: "766290850484",
  appId: "1:766290850484:web:26a30f5b757f0abe7cdde1",
  measurementId: "G-7DCJ2CBK1H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app); // <-- new Firestore export

export default app;
