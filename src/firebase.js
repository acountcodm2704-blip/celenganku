import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKswaUj70uvfkOh_svPFV_GycZvViXu8I",
  authDomain: "celenganku-a0aa1.firebaseapp.com",
  projectId: "celenganku-a0aa1",
  storageBucket: "celenganku-a0aa1.firebasestorage.app",
  messagingSenderId: "851135728022",
  appId: "1:851135728022:web:0252dc35eb92221d26b5b7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const db = getFirestore(app);