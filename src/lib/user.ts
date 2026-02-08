import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { User, MOCK_USERS } from './mockData';

export const USERS_COLLECTION = 'general';

/**
 * Fetch a user by their username directly.
 * Uses getDoc for speed and reliability (no Query required).
 * Path: general/user_{username}
 */
const QUERY_TIMEOUT = 10000;

export async function getUserByUsername(inputUsername: string): Promise<User | null> {
    // Normalize username: Check if it matches a known user (case-insensitive)
    // This fixes issues where 'cristina' wouldn't match 'Cristina'
    const normalizedUsername = inputUsername.trim();
    const mockMatch = MOCK_USERS.find(u => u.username.toLowerCase() === normalizedUsername.toLowerCase());

    // Use the canonical username if found (e.g., "Cristina"), otherwise use input as-is
    const effectiveUsername = mockMatch ? mockMatch.username : normalizedUsername;

    try {
        // Direct Doc Reference (No Query = No Index Issues)
        const docId = `user_${effectiveUsername}`;
        const userRef = doc(db, USERS_COLLECTION, docId);

        // Timeout Promise
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Firestore timeout")), QUERY_TIMEOUT)
        );

        // Race Firestore
        const snapshot = await Promise.race([
            getDoc(userRef),
            timeoutPromise
        ]) as any;

        if (snapshot.exists()) {
            return snapshot.data() as User;
        } else {
            console.log("User NOT found in Cloud, initializing from MOCK...");

            // Initialize THIS user specifically if missing
            if (mockMatch) {
                try {
                    // Create it now so next time it exists
                    await setDoc(userRef, mockMatch);
                    return mockMatch;
                } catch (e) {
                    console.error("Failed to init user", e);
                    return mockMatch; // Return mock anyway
                }
            }
            return null;
        }

    } catch (error) {
        console.error("Error/Timeout in getUserByUsername:", error);
        console.warn("Falling back to MOCK_USERS");
        return mockMatch || null;
    }
}

/**
 * Resets a user's password to their initial state (username) 
 * and forces a password change on next login.
 */
export async function resetUserPassword(username: string) {
    const mockMatch = MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!mockMatch) {
        throw new Error("Usuario no encontrado en la configuración.");
    }

    const docId = `user_${mockMatch.username}`;
    const userRef = doc(db, USERS_COLLECTION, docId);

    const resetData = {
        ...mockMatch,
        password: mockMatch.password || mockMatch.username, // Use initial password or username
        requiresPasswordChange: true
    };

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore timeout resetting password")), QUERY_TIMEOUT)
    );

    await Promise.race([
        setDoc(userRef, resetData, { merge: true }),
        timeoutPromise
    ]);

    console.log(`Password reset successfully for ${username}`);
}

// Deprecated bulk init (no longer needed as we auto-init on fetch)
export async function initializeUsers() {
    // No-op
}

/**
 * Update a user's password and remove the 'requiresPasswordChange' flag.
 */
export async function updateUserPassword(userId: string, newPassword: string) {
    // We need the username to construct the ID. 
    // If userId is passed as '1' (from MOCK), we might be in trouble if we keyed by Username.
    // Let's verify how userId is passed. 
    // In MOCK_USERS, id is '1', '2'.

    // PROBLEM: We keyed files by `user_{username}`. But this function receives `userId`.
    // Solution: We should look up the user by ID or change the signature.
    // However, looking at the MOCK_DATA, IDs are numeric strings.

    // HACK: Since we only have 4 users and we know them, let's find the username from MOCK_USERS 
    // using the ID, then update the cloud doc `user_{username}`.

    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) {
        console.error("Unknown user ID:", userId);
        throw new Error("User not found");
    }

    const docId = `user_${user.username}`;
    console.log(`Updating password for ${docId}`);

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore timeout update")), QUERY_TIMEOUT)
    );

    const userRef = doc(db, USERS_COLLECTION, docId);

    // Ensure the doc exists (it should if we logged in), but use set with merge just in case
    // First, ensure we have the base user data too if it was missing?
    // Actually, setDoc with merge is fine.

    await Promise.race([
        setDoc(userRef, {
            password: newPassword,
            requiresPasswordChange: false,
            // Ensure ID and match mock data is preserved if creating
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        }, { merge: true }),
        timeoutPromise
    ]);
    console.log("Password update successful");
}
