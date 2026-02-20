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

// Helper to get the start of the week (Monday) in YYYY-MM-DD format
export function getWeekKey(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toLocaleDateString('sv-SE');
}

export const SCHEDULES_BY_WEEK: Record<string, WeeklySchedule> = {
    // Semana del 5 de Enero
    '2026-01-05': {
        'Javivasco': { 'monday': null, 'tuesday': null, 'wednesday': 'morning', 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null },
        'Ivan': { 'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': 'morning', 'friday': 'morning', 'saturday': null, 'sunday': 'full-day' },
        'Andres': { 'monday': null, 'tuesday': null, 'wednesday': 'afternoon', 'thursday': null, 'friday': 'afternoon', 'saturday': 'full-day', 'sunday': null },
        'Cristina': { 'monday': 'full-day', 'tuesday': null, 'wednesday': null, 'thursday': 'afternoon', 'friday': null, 'saturday': null, 'sunday': null },
        'Aisha': { 'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null },
    },
    // Semana del 12 de Enero
    '2026-01-12': {
        'Javivasco': { 'monday': 'morning', 'tuesday': null, 'wednesday': 'morning', 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null },
        'Ivan': { 'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': 'morning', 'friday': 'morning', 'saturday': null, 'sunday': 'full-day' },
        'Andres': { 'monday': null, 'tuesday': 'afternoon', 'wednesday': 'afternoon', 'thursday': null, 'friday': 'afternoon', 'saturday': 'morning', 'sunday': null },
        'Cristina': { 'monday': 'afternoon', 'tuesday': null, 'wednesday': null, 'thursday': 'afternoon', 'friday': null, 'saturday': null, 'sunday': null },
        'Aisha': { 'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null },
    },
    // Semana del 19 de Enero
    '2026-01-19': {
        'Javivasco': { 'monday': 'morning', 'tuesday': null, 'wednesday': 'morning', 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null },
        'Ivan': { 'monday': null, 'tuesday': 'morning', 'wednesday': null, 'thursday': 'morning', 'friday': 'morning', 'saturday': 'full-day', 'sunday': 'full-day' },
        'Andres': { 'monday': null, 'tuesday': 'afternoon', 'wednesday': 'afternoon', 'thursday': null, 'friday': 'afternoon', 'saturday': null, 'sunday': null },
        'Cristina': { 'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null },
        'Aisha': { 'monday': 'afternoon', 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null },
    },
    // Semana del 2 de Febrero (Semana Actual)
    '2026-02-02': {
        'Javivasco': {
            'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null,
        },
        'Ivan': {
            'monday': null, 'tuesday': 'morning', 'wednesday': null, 'thursday': 'morning', 'friday': 'morning', 'saturday': null, 'sunday': 'full-day',
        },
        'Andres': {
            'monday': null, 'tuesday': 'afternoon', 'wednesday': 'afternoon', 'thursday': null, 'friday': 'afternoon', 'saturday': null, 'sunday': null,
        },
        'Cristina': {
            'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null,
        },
        'Aisha': {
            'monday': 'full-day', 'tuesday': null, 'wednesday': 'morning', 'thursday': 'afternoon', 'friday': null, 'saturday': 'full-day', 'sunday': null,
        },
    },
    // Próxima semana (A partir del 9 de Feb)
    '2026-02-09': {
        'Javivasco': {
            'monday': 'morning', 'tuesday': null, 'wednesday': 'morning', 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null,
        },
        'Ivan': {
            'monday': 'afternoon', 'tuesday': 'morning', 'wednesday': 'afternoon', 'thursday': 'morning', 'friday': 'morning', 'saturday': 'full-day', 'sunday': null,
        },
        'Andres': {
            'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null,
        },
        'Cristina': {
            'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null,
        },
        'Aisha': {
            'monday': null, 'tuesday': 'afternoon', 'wednesday': null, 'thursday': 'afternoon', 'friday': 'afternoon', 'saturday': null, 'sunday': 'full-day',
        },
    },
    // Nueva semana (A partir del 16 de Feb)
    '2026-02-16': {
        'Javivasco': {
            'monday': 'morning', 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null,
        },
        'Ivan': {
            'monday': 'afternoon', 'tuesday': 'morning', 'wednesday': 'afternoon', 'thursday': 'morning', 'friday': 'morning', 'saturday': null, 'sunday': null,
        },
        'Andres': {
            'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null,
        },
        'Cristina': {
            'monday': null, 'tuesday': null, 'wednesday': null, 'thursday': null, 'friday': null, 'saturday': null, 'sunday': null,
        },
        'Aisha': {
            'monday': null, 'tuesday': null, 'wednesday': 'morning', 'thursday': 'afternoon', 'friday': 'afternoon', 'saturday': 'full-day', 'sunday': 'full-day',
        },
    }
};

// Fallback to latest available schedule if week not found
export function getWeeklyScheduleForDate(date: Date): WeeklySchedule {
    const weekKey = getWeekKey(date);
    if (SCHEDULES_BY_WEEK[weekKey]) {
        return SCHEDULES_BY_WEEK[weekKey];
    }
    // Return the lexicographically latest week as fallback
    const keys = Object.keys(SCHEDULES_BY_WEEK).sort();
    return SCHEDULES_BY_WEEK[keys[keys.length - 1]];
}

// Helper function to get day of week in lowercase
export function getCurrentDayOfWeek(): DayOfWeek {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    return days[today];
}

// Check if a user is working today
export function isUserWorkingToday(username: string): boolean {
    const today = getCurrentDayOfWeek();
    const schedule = getWeeklyScheduleForDate(new Date());
    const userSchedule = schedule[username];

    if (!userSchedule) return false;

    return userSchedule[today] !== null;
}

// Get user's shift for today
export function getUserShiftToday(username: string): ShiftType | null {
    const today = getCurrentDayOfWeek();
    const schedule = getWeeklyScheduleForDate(new Date());
    const userSchedule = schedule[username];

    if (!userSchedule) return null;

    return userSchedule[today];
}

// Get user's shift for a specific day/date
export function getUserShiftForDay(username: string, day: DayOfWeek, date?: Date): ShiftType | null {
    const schedule = getWeeklyScheduleForDate(date || new Date());
    const userSchedule = schedule[username];

    if (!userSchedule) return null;

    return userSchedule[day];
}

// Find who is working in the morning for a specific day
export function getMorningEmployeeName(day: DayOfWeek, date?: Date): string | null {
    const schedule = getWeeklyScheduleForDate(date || new Date());
    for (const [username, userSchedule] of Object.entries(schedule)) {
        if (userSchedule[day] === 'morning') {
            return username;
        }
    }
    return null;
}

