import { Task, MOCK_TASKS, ShiftType, MOCK_USERS } from './mockData';
import { WEEKLY_SCHEDULE, DayOfWeek, getUserShiftForDay } from './scheduleData';

// Helper to get day name from date string
function getDayName(dateStr: string): DayOfWeek {
    const date = new Date(dateStr);
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
}

interface StoredTaskState {
    completed: boolean;
    observations: string;
}

export function getTasksForDateAndUser(date: string, username: string): Task[] {
    // 1. Determine if user works on this day
    const dayName = getDayName(date);
    const scheduledShift = getUserShiftForDay(username, dayName);

    if (!scheduledShift) {
        return [];
    }

    // 2. Get base tasks for that shift
    const baseTasks = MOCK_TASKS.filter(t => t.shift === scheduledShift || t.shift === 'full-day');

    // 3. Clone and "hydrate" with any stored state (simulating backend persistence)
    // We'll try to find any stored state in localStorage for this specific day/user/task combo
    // Note: Since this runs on server/client hybrid nextjs, we need to be careful with localStorage

    // For specific recurring tasks, we generate a unique ID based on date + original ID
    // This effectively "creates" new task instances for every day
    return baseTasks.map(task => {
        const uniqueId = `${date}-${username}-${task.id}`;

        // Default state
        let isCompleted = false;
        let observations = '';

        // Try to recover state from localStorage if on client
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(`task_state_${uniqueId}`);
            if (stored) {
                try {
                    const parsed: StoredTaskState = JSON.parse(stored);
                    isCompleted = parsed.completed;
                    observations = parsed.observations;
                } catch (e) {
                    console.error('Failed to parse stored task', e);
                }
            }
        }

        return {
            ...task,
            id: uniqueId, // Use unique instance ID
            date: date,   // Override date to requested date
            completed: isCompleted,
            observations: observations || task.observations
        };
    });
}

// Helper to get stats for a day/user
export function getDayStats(date: string, username: string) {
    if (username === 'all') {
        // Aggregate all users
        let total = 0;
        let completed = 0;
        const allObs: string[] = [];

        MOCK_USERS.filter(u => u.role !== 'admin').forEach(user => {
            const tasks = getTasksForDateAndUser(date, user.username);
            total += tasks.length;
            completed += tasks.filter(t => t.completed).length;
            tasks.forEach(t => {
                if (t.observations) allObs.push(`${user.name}: ${t.observations}`);
            });
        });

        return { total, completed, pending: total - completed, observations: allObs };
    } else {
        const tasks = getTasksForDateAndUser(date, username);
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const obs = tasks
            .filter(t => t.observations)
            .map(t => t.observations || '');

        return { total, completed, pending: total - completed, observations: obs };
    }
}
