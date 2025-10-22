// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔧 Firebase configuratie van jouw project
const firebaseConfig = {
  apiKey: "AIzaSyBQlg3hynlqzdgcjrztTPoZEkYH56wmDzQ",
  authDomain: "dutch20-vrijwilligers-carpool.firebaseapp.com",
  projectId: "dutch20-vrijwilligers-carpool",
  storageBucket: "dutch20-vrijwilligers-carpool.firebasestorage.app",
  messagingSenderId: "723127684447",
  appId: "1:723127684447:web:95dd2eb9897c7a4501faea",
  measurementId: "G-85DSE9H3GM"
};

// 🔥 Firebase initialiseren
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
