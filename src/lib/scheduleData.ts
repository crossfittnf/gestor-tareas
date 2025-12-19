import { ShiftType } from './mockData';

// Weekly schedule based on the "Recepción" column from the schedule image
// Updated weekly - see SCHEDULE_UPDATE.md for instructions

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface EmployeeSchedule {
    [day: string]: ShiftType | null; // null means not working
}

export interface WeeklySchedule {
    [username: string]: EmployeeSchedule;
}

// Current week schedule (Updated by User Request)
export const WEEKLY_SCHEDULE: WeeklySchedule = {
    'Javivasco': {
        'monday': 'morning',
        'tuesday': null,
        'wednesday': 'morning',
        'thursday': null,
        'friday': 'morning',
        'saturday': null,
        'sunday': null,
    },
    'Ivan': {
        'monday': null,
        'tuesday': 'morning',
        'wednesday': 'afternoon',
        'thursday': 'morning',
        'friday': 'afternoon',
        'saturday': null,
        'sunday': 'full-day',
    },
    'Andres': {
        'monday': null,
        'tuesday': 'afternoon',
        'wednesday': null,
        'thursday': null,
        'friday': null,
        'saturday': null,
        'sunday': null,
    },
    'Cristina': {
        'monday': 'afternoon',
        'tuesday': null,
        'wednesday': null,
        'thursday': 'afternoon',
        'friday': null,
        'saturday': 'full-day',
        'sunday': null,
    },
};

// Helper function to get day of week in lowercase
export function getCurrentDayOfWeek(): DayOfWeek {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    return days[today];
}

// Check if a user is working today
export function isUserWorkingToday(username: string): boolean {
    const today = getCurrentDayOfWeek();
    const userSchedule = WEEKLY_SCHEDULE[username];

    if (!userSchedule) return false;

    return userSchedule[today] !== null;
}

// Get user's shift for today
export function getUserShiftToday(username: string): ShiftType | null {
    const today = getCurrentDayOfWeek();
    const userSchedule = WEEKLY_SCHEDULE[username];

    if (!userSchedule) return null;

    return userSchedule[today];
}

// Get user's shift for a specific day
export function getUserShiftForDay(username: string, day: DayOfWeek): ShiftType | null {
    const userSchedule = WEEKLY_SCHEDULE[username];

    if (!userSchedule) return null;

    return userSchedule[day];
}

// Find who is working in the morning for a specific day
export function getMorningEmployeeName(day: DayOfWeek): string | null {
    for (const [username, schedule] of Object.entries(WEEKLY_SCHEDULE)) {
        if (schedule[day] === 'morning') {
            return username;
        }
    }
    return null;
}
