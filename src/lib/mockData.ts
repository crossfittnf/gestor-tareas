export type ShiftType = 'morning' | 'afternoon' | 'full-day';

export interface Task {
    id: string;
    title: string;
    description?: string;
    explanation?: string;
    completed: boolean;
    observations?: string;
    date: string; // YYYY-MM-DD
    shift: ShiftType;
}

export interface User {
    id: string;
    username: string;
    name: string;
    role: 'employee' | 'admin';
    password?: string; // Optional for now, will be used for initialization/fallback
    requiresPasswordChange?: boolean;
}

// Real employees from Tnf Box
export const MOCK_USERS: User[] = [
    { id: '1', username: 'Javivasco', name: 'Javi Vasco', role: 'admin', password: 'Javivasco', requiresPasswordChange: true },
    { id: '2', username: 'Ivan', name: 'Ivan', role: 'employee', password: 'Ivan', requiresPasswordChange: true },
    { id: '3', username: 'Andres', name: 'Andres', role: 'employee', password: 'Andres', requiresPasswordChange: true },
    { id: '4', username: 'Cristina', name: 'Cristina', role: 'employee', password: 'Cristina', requiresPasswordChange: true },
];

const today = new Date().toISOString().split('T')[0];

export const MOCK_TASKS: Task[] = [
    // ===== MORNING SHIFT TASKS =====
    {
        id: 'm1',
        title: 'Firmar hora de asistencia (entrada)',
        explanation: 'Registrar la hora de entrada en la hoja de asistencia.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm2',
        title: 'Preparar recepción para operar',
        explanation: 'Encender equipos, luces, y preparar el puesto de trabajo.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm3',
        title: 'Actualizar listados 14 days y seguimiento',
        explanation: 'Revisar y actualizar la documentación de seguimiento.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm4',
        title: 'Atender whatsapps y mensajes',
        explanation: 'Responder a los mensajes pendientes de clientes.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm5',
        title: 'Hacer llamadas de los listados',
        explanation: 'Gestionar las llamadas salientes programadas.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm6',
        title: 'Rellenar neveras y cafeteras',
        explanation: 'Reponer stock de bebidas y café.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm7',
        title: 'Limpieza de la zona',
        explanation: 'Mantener limpia y ordenada la zona de recepción.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm8',
        title: 'Arqueo de caja',
        explanation: 'Realizar el conteo de caja del turno de mañana.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm9',
        title: 'Reporte del turno',
        explanation: 'Redactar las incidencias y novedades del turno.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm10',
        title: 'Firmar hoja de asistencia (salida)',
        explanation: 'Registrar la hora de salida al terminar el turno.',
        completed: false,
        date: today,
        shift: 'morning',
    },

    // ===== AFTERNOON SHIFT TASKS =====
    {
        id: 'a1',
        title: 'Firmar hora de asistencia (entrada)',
        explanation: 'Registrar la hora de entrada en la hoja de asistencia.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a2',
        title: 'Limpiar y fregar la zona',
        explanation: 'Realizar limpieza general del área.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a3',
        title: 'Completar listados si quedaron pendientes',
        explanation: 'Terminar tareas administrativas pendientes de la mañana.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a4',
        title: 'Limpiar jarras, reponer cañas, vasos, cafe...',
        explanation: 'Asegurar stock de consumibles y limpieza de vajilla.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a5',
        title: 'Rellenar neveras',
        explanation: 'Reponer bebidas en las neveras.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a6',
        title: 'Arqueo de la caja',
        explanation: 'Realizar el conteo de caja del turno de tarde.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a7',
        title: 'Reporte del turno',
        explanation: 'Redactar las incidencias y novedades del turno.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a8',
        title: 'Firmar hoja de asistencia (salida)',
        explanation: 'Registrar la hora de salida.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a9',
        title: 'Apagar y guardar equipos y cerrar jaula',
        explanation: 'Asegurar el cierre correcto de las instalaciones.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },

    // ===== FULL-DAY SHIFT TASKS (Fines de semana/Festivos) =====
    {
        id: 'f1',
        title: 'Firmar hora de asistencia (entrada)',
        explanation: 'Registrar la hora de entrada.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f2',
        title: 'Preparar recepción para operar',
        explanation: 'Acondicionar el puesto para el inicio de jornada.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f3',
        title: 'Actualizar listados 14 days y seguimiento',
        explanation: 'Gestión de listados de seguimiento.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f4',
        title: 'Atender whatsapps y mensajes',
        explanation: 'Gestión de la comunicación con clientes.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f5',
        title: 'Hacer llamadas de los listados',
        explanation: 'Realizar llamadas de seguimiento.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f6',
        title: 'Rellenar neveras y cafeteras',
        explanation: 'Reposición de stock.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f7',
        title: 'Limpieza de la zona',
        explanation: 'Mantener la higiene en el puesto de trabajo.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f8',
        title: 'Arqueo de caja y reporte del turno',
        explanation: 'Cierre económico y reporte de incidencias.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f9',
        title: 'Firmar hoja de asistencia (salida)',
        explanation: 'Registrar hora de salida.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f10',
        title: 'Apagar y guardar equipos y cerrar jaula',
        explanation: 'Procedimiento de cierre de instalaciones.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
];

export interface ScheduleItem {
    day: string;
    shift: string;
    tasks: string[];
}

export const MOCK_SCHEDULE: ScheduleItem[] = [
    { day: 'Lunes', shift: '09:00 - 17:00', tasks: ['Apertura', 'Inventario', 'Caja'] },
    { day: 'Martes', shift: '09:00 - 17:00', tasks: ['Apertura', 'Reposición', 'Caja'] },
    { day: 'Miércoles', shift: '14:00 - 22:00', tasks: ['Recepción pedidos', 'Limpieza general', 'Cierre'] },
    { day: 'Jueves', shift: 'Descanso', tasks: [] },
    { day: 'Viernes', shift: '09:00 - 17:00', tasks: ['Apertura', 'Inventario fin de semana', 'Caja'] },
    { day: 'Sábado', shift: '10:00 - 14:00', tasks: ['Refuerzo mañana'] },
    { day: 'Domingo', shift: 'Descanso', tasks: [] },
];

// Helper function to get current shift based on time
export function getCurrentShift(): ShiftType {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 14) {
        return 'morning';
    } else if (hour >= 14 && hour < 22) {
        return 'afternoon';
    } else {
        return 'full-day';
    }
}

export const SHIFT_LABELS: Record<ShiftType, string> = {
    'morning': 'Turno de Mañana',
    'afternoon': 'Turno de Tarde',
    'full-day': 'Día Completo',
};
