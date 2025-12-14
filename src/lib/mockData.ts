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
}

// Real employees from Tnf Box
export const MOCK_USERS: User[] = [
    { id: '1', username: 'javivasco', name: 'Javi Vasco', role: 'admin' },
    { id: '2', username: 'ivan', name: 'Ivan', role: 'employee' },
    { id: '3', username: 'andres', name: 'Andres', role: 'employee' },
    { id: '4', username: 'cristina', name: 'Cristina', role: 'employee' },
];

const today = new Date().toISOString().split('T')[0];

export const MOCK_TASKS: Task[] = [
    // ===== MORNING SHIFT TASKS =====
    {
        id: 'm1',
        title: 'Firmar hoja de asistencia (entrada)',
        explanation: 'Al llegar, firmar la hoja de asistencia marcando la hora de entrada. Asegurarse de que la firma sea legible y la hora correcta.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm2',
        title: 'Preparar recepción para operar',
        description: 'Subir fusibles, encender equipos y limpiar',
        explanation: 'Subir todos los fusibles, encender televisión, luces, nevera, abrir jaula, limpiar mesas y dejar la recepción lista para operar. Verificar que todo el equipo funcione correctamente.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm3',
        title: 'Actualizar listados 14 days y seguimiento',
        explanation: 'Revisar y actualizar los listados de 14 days y el documento de seguimiento con la información más reciente. Verificar que no haya pendientes del día anterior.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm4',
        title: 'Atender whatsapps y mensajes',
        explanation: 'Revisar y responder todos los mensajes de WhatsApp y otras plataformas. Priorizar consultas urgentes y dar seguimiento a conversaciones pendientes.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm5',
        title: 'Hacer llamadas de los listados',
        explanation: 'Realizar las llamadas programadas según los listados. Anotar el resultado de cada llamada y actualizar el estado en el sistema de seguimiento.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm6',
        title: 'Arqueo de caja y reporte del turno',
        explanation: 'Contar el efectivo en caja, verificar que cuadre con las transacciones registradas. Preparar el reporte del turno con todas las incidencias y actividades realizadas.',
        completed: false,
        date: today,
        shift: 'morning',
    },
    {
        id: 'm7',
        title: 'Firmar hoja de asistencia (salida)',
        explanation: 'Antes de salir, firmar la hoja de asistencia marcando la hora de salida. Asegurarse de que toda la información esté completa.',
        completed: false,
        date: today,
        shift: 'morning',
    },

    // ===== AFTERNOON SHIFT TASKS =====
    // User specified these in reverse order (10 to 2), so reordering correctly:
    {
        id: 'a1',
        title: 'Firmar hoja de asistencia (entrada)',
        explanation: 'Al llegar, firmar la hoja de asistencia marcando la hora de entrada. Asegurarse de que la firma sea legible y la hora correcta.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a2',
        title: 'Rellenar neveras',
        explanation: 'Revisar el stock de las neveras y rellenarlas con los productos necesarios. Verificar fechas de caducidad y rotar productos según FIFO.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a3',
        title: 'Limpiar jaula y polvo de las vitrinas',
        description: 'Limpiar jaula, polvo de las vitrinas',
        explanation: 'Limpiar a fondo la jaula y quitar el polvo de todas las vitrinas. Asegurarse de que todo quede impecable para los clientes.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a4',
        title: 'Rellenar neveras y cafeteras',
        explanation: 'Completar el stock de neveras y cafeteras. Verificar que las cafeteras estén limpias y funcionando correctamente.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a5',
        title: 'Limpiar jarras, reponer cañas, vasos',
        description: 'Limpiar jarras de leche, reponer cañas, vasos...',
        explanation: 'Limpiar todas las jarras de leche, reponer cañas, vasos y demás material desechable. Verificar que haya suficiente stock para el día siguiente.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a6',
        title: 'Arqueo de caja',
        description: 'Hacer arqueo de la caja',
        explanation: 'Contar el efectivo en caja, verificar que cuadre con las transacciones del turno. Anotar cualquier diferencia encontrada.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a7',
        title: 'Reporte del turno',
        description: 'Hacer reporte del turno',
        explanation: 'Preparar el reporte del turno detallando todas las actividades realizadas, incidencias y observaciones importantes.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a8',
        title: 'Apagar equipos y cerrar',
        description: 'Apagar tele, luces, nevera, cerrar jaula y puertas',
        explanation: 'Apagar televisión, luces, nevera, cerrar la jaula y todas las puertas. Verificar que todo quede bien cerrado y seguro.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },
    {
        id: 'a9',
        title: 'Firmar hoja de asistencia (salida)',
        explanation: 'Antes de salir, firmar la hoja de asistencia marcando la hora de salida. Verificar que el local quede completamente cerrado.',
        completed: false,
        date: today,
        shift: 'afternoon',
    },

    // ===== FULL-DAY SHIFT TASKS (Combined) =====
    {
        id: 'f1',
        title: 'Firmar hoja de asistencia (entrada)',
        explanation: 'Al llegar, firmar la hoja de asistencia marcando la hora de entrada.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f2',
        title: 'Preparar recepción para operar',
        description: 'Subir fusibles, encender equipos y limpiar',
        explanation: 'Subir todos los fusibles, encender televisión, luces, nevera, abrir jaula, limpiar mesas y dejar la recepción lista para operar.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f3',
        title: 'Actualizar listados 14 days y seguimiento',
        explanation: 'Revisar y actualizar los listados de 14 days y el documento de seguimiento.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f4',
        title: 'Atender whatsapps y mensajes',
        explanation: 'Revisar y responder todos los mensajes de WhatsApp y otras plataformas durante todo el día.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f5',
        title: 'Hacer llamadas de los listados',
        explanation: 'Realizar las llamadas programadas según los listados.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f6',
        title: 'Rellenar neveras y cafeteras',
        explanation: 'Mantener las neveras y cafeteras llenas durante todo el turno.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f7',
        title: 'Limpiar jaula y vitrinas',
        explanation: 'Limpiar la jaula y quitar el polvo de las vitrinas.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f8',
        title: 'Arqueo de caja y reporte del turno',
        explanation: 'Realizar el arqueo de caja y preparar el reporte completo del día.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f9',
        title: 'Apagar equipos y cerrar local',
        description: 'Apagar tele, luces, nevera, cerrar jaula y puertas',
        explanation: 'Apagar todos los equipos, cerrar la jaula y todas las puertas. Verificar que todo quede seguro.',
        completed: false,
        date: today,
        shift: 'full-day',
    },
    {
        id: 'f10',
        title: 'Firmar hoja de asistencia (salida)',
        explanation: 'Firmar la hoja de asistencia marcando la hora de salida.',
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
