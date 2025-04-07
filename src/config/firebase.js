// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "class-clarity-4748d.firebaseapp.com",
  projectId: "class-clarity-4748d",
  storageBucket: "class-clarity-4748d.firebasestorage.app",
  messagingSenderId: "927619066992",
  appId: "1:927619066992:web:840f7bf10c4fd6184f98b5",
  measurementId: "G-R53FBYEEF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);