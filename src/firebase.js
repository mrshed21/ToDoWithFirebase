// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";




// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6KoLjOldC6_xsdWldgoRnHAK207sORH4",
  authDomain: "todostore-f2824.firebaseapp.com",
  projectId: "todostore-f2824",
  storageBucket: "todostore-f2824.firebasestorage.app",
  messagingSenderId: "170043472367",
  appId: "1:170043472367:web:33c1b14aeaac8b405a1e1a",
  measurementId: "G-M315G8QD2C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
