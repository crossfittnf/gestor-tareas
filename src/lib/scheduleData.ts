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

// Current week schedule (based on uploaded image - RECEPCIÓN column only)
export const WEEKLY_SCHEDULE: WeeklySchedule = {
    'javivasco': {
        'monday': 'morning',      // Lunes mañana (arriba en Recepción)
        'tuesday': null,          // No trabaja martes
        'wednesday': 'morning',   // Miércoles mañana (arriba en Recepción)
        'thursday': null,         // No trabaja jueves
        'friday': null,           // No trabaja viernes
        'saturday': null,         // No trabaja sábado
        'sunday': null,           // No trabaja domingo
    },
    'ivan': {
        'monday': 'afternoon',    // Lunes tarde (abajo en Recepción)
        'tuesday': 'morning',     // Martes mañana (arriba en Recepción)
        'wednesday': null,        // No trabaja miércoles
        'thursday': 'morning',    // Jueves mañana (arriba en Recepción)
        'friday': 'afternoon',    // Viernes tarde (abajo en Recepción)
        'saturday': null,         // No trabaja sábado
        'sunday': null,           // No trabaja domingo
    },
    'andres': {
        'monday': null,           // No trabaja lunes
        'tuesday': 'afternoon',   // Martes tarde (abajo en Recepción)
        'wednesday': 'afternoon', // Miércoles tarde (abajo en Recepción)
        'thursday': null,         // No trabaja jueves
        'friday': null,           // No trabaja viernes
        'saturday': 'full-day',   // Sábado completo (en Recepción)
        'sunday': 'full-day',     // Domingo completo (en Recepción)
    },
    'cristina': {
        'monday': null,           // No trabaja lunes
        'tuesday': null,          // No trabaja martes
        'wednesday': null,        // No trabaja miércoles
        'thursday': 'afternoon',  // Jueves tarde (abajo en Recepción)
        'friday': 'morning',      // Viernes mañana (arriba en Recepción)
        'saturday': null,         // No trabaja sábado
        'sunday': null,           // No trabaja domingo
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
