// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJ-dtCLzA4T2Z9XnIGPg7ZBRof9KRh1QE",
  authDomain: "the-freelancer-6e176.firebaseapp.com",
  projectId: "the-freelancer-6e176",
  storageBucket: "the-freelancer-6e176.appspot.com",
  messagingSenderId: "727796044227",
  appId: "1:727796044227:web:b4bfa8f77b5e6f10b82d76",
  measurementId: "G-ZE7NSF0R9Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
