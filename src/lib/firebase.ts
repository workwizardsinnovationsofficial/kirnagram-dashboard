import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAorIQM7-gbj9uAlhO5QrKjbfxG89mCCM",
  authDomain: "admin-logins-92bc7.firebaseapp.com",
  projectId: "admin-logins-92bc7",
  storageBucket: "admin-logins-92bc7.firebasestorage.app",
  messagingSenderId: "811850449228",
  appId: "1:811850449228:web:d0e954ebfafc82e29a4fe9",
  measurementId: "G-SN17H9SZYZ",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
