import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDuTx2OEncdi-m-2EG22HGq2JuLMcPB_7c",
    authDomain: "gestor-tareas-ea4e9.firebaseapp.com",
    projectId: "gestor-tareas-ea4e9",
    storageBucket: "gestor-tareas-ea4e9.firebasestorage.app",
    messagingSenderId: "774610966452",
    appId: "1:774610966452:web:7cc0a37cd859751da604e1",
    measurementId: "G-5QQLHT7LST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Auto-sign in anonymously to allow Firestore writes if rules require auth
signInAnonymously(auth).catch((err) => {
    console.error("Failed to sign in anonymously", err);
});
