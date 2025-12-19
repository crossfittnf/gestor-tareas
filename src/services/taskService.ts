import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';

export interface TaskStatus {
    completed: boolean;
    observations: string;
}

export interface DayLog {
    username: string;
    date: string;
    tasks: Record<string, TaskStatus>; // Map of taskId -> status
}

/**
 * Subscribe to real-time updates for a specific user on a specific day.
 * Used by the Employee Dashboard to see/update their own tasks.
 */
export function subscribeToUserDay(
    date: string,
    username: string,
    onUpdate: (data: DayLog | null) => void,
    onError?: (error: Error) => void
) {
    const docId = `${date}_${username}`;
    const docRef = doc(db, 'daily_logs', docId);

    return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
            onUpdate(snapshot.data() as DayLog);
        } else {
            onUpdate(null);
        }
    }, (error) => {
        console.error("Error watching user day:", error);
        if (onError) onError(error);
    });
}

/**
 * Update the status of a specific task.
 * Creates the daily document if it doesn't exist.
 */
export async function updateTaskStatus(
    date: string,
    username: string,
    taskId: string,
    updates: Partial<TaskStatus>
) {
    const docId = `${date}_${username}`;
    const docRef = doc(db, 'daily_logs', docId);

    try {
        // We use setDoc with merge: true to create or update
        // Note: We need to use dot notation for nested map updates to avoid overwriting other tasks
        // However, Firestore 'merge' allows deep merging if structure mimics object

        // Strategy: First check if doc exists to determine simpler path, 
        // or just use dot notation for the specific task field

        const key = `tasks.${taskId}`;

        // Prepare update object with dynamic key
        // We can't use dynamic keys in simple object literal without []
        const fieldUpdate: any = {};

        if (updates.completed !== undefined) fieldUpdate[`tasks.${taskId}.completed`] = updates.completed;
        if (updates.observations !== undefined) fieldUpdate[`tasks.${taskId}.observations`] = updates.observations;

        // Ensure base fields exist (username, date) in case we are creating it
        // We can use setDoc with merge for the initial creation + field update
        await setDoc(docRef, {
            username,
            date,
            tasks: {
                [taskId]: updates // This might overwrite if we are not careful with merge?
                // setDoc(..., { merge: true }) works well for top levels
            }
        }, { merge: true });

    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
}

/**
 * Helper to fetch a single day once (Used for Admin aggregation if we don't want 100 listeners)
 * But for real-time admin, we might want listeners. 
 * For now, this is a direct fetch helper.
 */
export async function getDayLog(date: string, username: string): Promise<DayLog | null> {
    const docId = `${date}_${username}`;
    const docRef = doc(db, 'daily_logs', docId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        return snap.data() as DayLog;
    }
    return null;
}

// ===== SHOPPING LIST SERVICE =====

export interface ShoppingList {
    items: string[];
}

export function subscribeToShoppingList(onUpdate: (items: string[]) => void, onError?: (error: Error) => void) {
    const docRef = doc(db, 'general', 'shopping');
    return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
            onUpdate(snapshot.data().items || []);
        } else {
            onUpdate([]);
        }
    }, (error) => {
        console.error("Error watching shopping list:", error);
        if (onError) onError(error);
    });
}

export async function updateShoppingList(items: string[]) {
    const docRef = doc(db, 'general', 'shopping');
    await setDoc(docRef, { items }, { merge: true });
}
