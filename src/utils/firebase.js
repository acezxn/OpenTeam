import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyAcGshX9uSylHu5B6CqqpkBMBXAWpl1XAw",
    authDomain: "openteam-330ce.firebaseapp.com",
    projectId: "openteam-330ce",
    storageBucket: "openteam-330ce.appspot.com",
    messagingSenderId: "522874679803",
    appId: "1:522874679803:web:a4a058768fc97a1d341b5e",
    measurementId: "G-NFEWNM2ZRH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage();