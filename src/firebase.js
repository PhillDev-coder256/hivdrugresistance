// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPB6kzq2nowQ-zubj7SWvwLmVSJrtloYE",
  authDomain: "hiv-drug-resistance.firebaseapp.com",
  projectId: "hiv-drug-resistance",
  storageBucket: "hiv-drug-resistance.appspot.com",
  messagingSenderId: "1088376308440",
  appId: "1:1088376308440:web:796547525a8bb9b8440dad",
  measurementId: "G-GHT0YN4E4M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

export { db };
