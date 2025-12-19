import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { User, MOCK_USERS } from './mockData';

export const USERS_COLLECTION = 'users';

/**
 * Fetch a user by their username.
 * If no users exist in the DB, it initializes them from MOCK_USERS.
 */
const QUERY_TIMEOUT = 10000; // 10 seconds timeout

export async function getUserByUsername(username: string): Promise<User | null> {
    try {
        console.log("Starting getUser logic for:", username);

        // Timeout Promise
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Firestore timeout")), QUERY_TIMEOUT)
        );

        const q = query(collection(db, USERS_COLLECTION), where('username', '==', username));

        // Race Firestore against timeout
        const querySnapshot = await Promise.race([
            getDocs(q),
            timeoutPromise
        ]) as any;

        if (querySnapshot.empty) {
            console.log("No user found in DB, checking if empty initialization needed...");
            // Check if DB is empty to potentially initialize
            // Also race this check
            const allUsers = await Promise.race([
                getDocs(collection(db, USERS_COLLECTION)),
                timeoutPromise
            ]) as any;

            if (allUsers.empty) {
                console.log("DB is empty, initializing...");
                // Just fire and forget initialization or await? 
                // Let's await but catch error so we don't block logic if it fails
                try {
                    await initializeUsers();
                    // Retry fetch logic? Or just return mock user for now to be fast
                    // Let's return mock user directly to be responsive
                    console.log("Returning mock user after init trigger");
                    return MOCK_USERS.find(u => u.username === username) || null;
                } catch (e) {
                    console.error("Init failed", e);
                }
            }
            return null;
        }

        return querySnapshot.docs[0].data() as User;

    } catch (error) {
        console.error("Error/Timeout in getUserByUsername:", error);
        console.warn("Falling back to MOCK_USERS");
        return MOCK_USERS.find(u => u.username === username) || null;
    }
}

/**
 * Initialize Firestore with mock users if they don't exist.
 */
export async function initializeUsers() {
    for (const user of MOCK_USERS) {
        const userRef = doc(db, USERS_COLLECTION, user.id);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
            await setDoc(userRef, user);
        }
    }
}

/**
 * Update a user's password and remove the 'requiresPasswordChange' flag.
 */
export async function updateUserPassword(userId: string, newPassword: string) {
    console.log("Attempting to update password for userId:", userId);

    // Timeout Promise
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore timeout update")), QUERY_TIMEOUT)
    );

    const userRef = doc(db, USERS_COLLECTION, userId);

    await Promise.race([
        setDoc(userRef, {
            password: newPassword,
            requiresPasswordChange: false
        }, { merge: true }),
        timeoutPromise
    ]);
    console.log("Password update successful");
}
