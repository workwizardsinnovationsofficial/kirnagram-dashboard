import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvLITK_oEr1M3KJRIr18z8LUrxj7ykVkY",
  authDomain: "kirnagram-b672d.firebaseapp.com",
  projectId: "kirnagram-b672d",
  storageBucket: "kirnagram-b672d.firebasestorage.app",
  messagingSenderId: "440741687516",
  appId: "1:440741687516:web:adf491375dbfc0dd1ec419",
  measurementId: "G-M6JP76GLCS",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);