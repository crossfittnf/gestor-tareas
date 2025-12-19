import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, initializeFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDuTx2OENcdi-m-2EG22HGq2JuLMcPB_7c",
    authDomain: "gestor-tareas-ea4e9.firebaseapp.com",
    projectId: "gestor-tareas-ea4e9",
    storageBucket: "gestor-tareas-ea4e9.firebasestorage.app",
    messagingSenderId: "774610966452",
    appId: "1:774610966452:web:7cc0a37cd859751da604e1",
    measurementId: "G-5QQLHT7LST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Use initializeFirestore to force long polling - bypasses firewall blocking WebSockets
// JAVIVASCO: Re-enabling this because standard config failed. Testing [LongPolling + NoPersistence] combo.
// JAVIVASCO: API Key is fixed. BUT WebSockets failing (Error 400). Reverting to Long Polling.
// export const db = getFirestore(app);
// JAVIVASCO: Reverting to Standard WebSockets + Fresh Session
export const db = getFirestore(app);
// export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
// export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable Offline Persistence
// Enable Offline Persistence
// JAVIVASCO: Disabling persistence PERMANENTLY. It causes deadlocks on Chrome/Mac for this user.
// The app will work Online-First.
/*
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.warn('Persistence failed: Browser not supported');
    }
});
*/

// Auto-sign in anonymously to allow Firestore writes if rules require auth
// JAVIVASCO: Adding global auth listener for debug
import { onAuthStateChanged, signOut } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Global Auth Listener: User is signed in:", user.uid);
        // We could potentially export a reactive variable here if needed, but console is a start
        // or set a window variable for the UI to read
        if (typeof window !== 'undefined') {
            (window as any).__AUTH_STATUS__ = `Authed: ${user.uid.substring(0, 5)}...`;
        }
    } else {
        console.log("Global Auth Listener: User is signed out");
        if (typeof window !== 'undefined') {
            (window as any).__AUTH_STATUS__ = "Not Authenticated";
        }
    }
});
signInAnonymously(auth)
    .then((userCredential) => {
        console.log("Anonymous Auth Success:", userCredential.user.uid);
    })
    .catch((err) => {
        console.error("Failed to sign in anonymously", err);
        // Force token refresh if it fails
        signOut(auth).then(() => signInAnonymously(auth));
    });
