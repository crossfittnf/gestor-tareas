'use client';

import Link from 'next/link';
import { WEEKLY_SCHEDULE } from '@/lib/scheduleData';
import { MOCK_USERS } from '@/lib/mockData';
import './schedule.css';

// Employee colors
// Employee colors
const EMPLOYEE_COLORS: Record<string, string> = {
    'javivasco': '#FFB84D',  // Orange (100%)
    'ivan': '#FFE066',       // Yellow (100%)
    'andres': '#90EE90',     // Light Green (100%)
    'cristina': '#FFB6C1',   // Light Pink (100%)
};

// Simplified shift blocks - only 2 rows now
const SHIFT_BLOCKS = [
    { id: 'morning', label: 'Mañana / Fin de Semana', time: '08:45 - 13:45 / 09:00 - 14:00' },
    { id: 'afternoon', label: 'Tarde', time: '13:45 - 20:45' },
];

const DAYS = [
    { key: 'monday', label: 'Lunes', isWeekend: false },
    { key: 'tuesday', label: 'Martes', isWeekend: false },
    { key: 'wednesday', label: 'Miércoles', isWeekend: false },
    { key: 'thursday', label: 'Jueves', isWeekend: false },
    { key: 'friday', label: 'Viernes', isWeekend: false },
    { key: 'saturday', label: 'Sábado', isWeekend: true },
    { key: 'sunday', label: 'Domingo', isWeekend: true },
];

export default function SchedulePage() {
    // Get employees for a specific shift on a specific day
    const getEmployeesForShift = (day: string, shiftId: string) => {
        const employees = [];
        const isWeekend = day === 'saturday' || day === 'sunday';

        for (const user of MOCK_USERS) {
            const userSchedule = WEEKLY_SCHEDULE[user.username];
            if (!userSchedule) continue;

            const dayShift = userSchedule[day as keyof typeof userSchedule];

            // For morning row: show morning shifts on weekdays and full-day on weekends
            if (shiftId === 'morning') {
                if (isWeekend && dayShift === 'full-day') {
                    employees.push({
                        name: user.name,
                        username: user.username,
                        color: EMPLOYEE_COLORS[user.username.toLowerCase()] || '#eee',
                    });
                } else if (!isWeekend && dayShift === 'morning') {
                    employees.push({
                        name: user.name,
                        username: user.username,
                        color: EMPLOYEE_COLORS[user.username.toLowerCase()] || '#eee',
                    });
                }
            }
            // For afternoon row: only show on weekdays
            else if (shiftId === 'afternoon' && !isWeekend && dayShift === 'afternoon') {
                employees.push({
                    name: user.name,
                    username: user.username,
                    color: EMPLOYEE_COLORS[user.username.toLowerCase()] || '#eee',
                });
            }
        }

        return employees;
    };

    return (
        <div className="schedule-page">
            <header className="schedule-header">
                <div className="container header-content">
                    <Link href="/dashboard" className="back-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Volver
                    </Link>
                    <h1 className="schedule-title">Horario Semanal - Recepción</h1>
                </div>
            </header>

            <main className="schedule-main container">
                <div className="schedule-grid-wrapper">
                    <table className="schedule-grid">
                        <thead>
                            <tr>
                                {/* Removed Shift Column Header */}
                                {DAYS.map(day => {
                                    // Calculate date for this day of the CURRENT week
                                    // Start with a new Date object (today)
                                    const today = new Date();
                                    const currentDay = today.getDay(); // 0 = sun, 1 = mon...
                                    // Normalize sunday to 7 for simpler math (Mon=1 ... Sun=7)
                                    const currentDayIndex = currentDay === 0 ? 7 : currentDay;

                                    // Map DAYS array (0=Monday ... 6=Sunday) to 1-7
                                    // Our DAYS array starts at Monday=0 index
                                    const targetDayIndex = DAYS.indexOf(day) + 1;

                                    const diff = targetDayIndex - currentDayIndex;

                                    const targetDate = new Date(today);
                                    targetDate.setDate(today.getDate() + diff);

                                    const dateStr = targetDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

                                    return (
                                        <th key={day.key} className="day-header">
                                            {day.label}
                                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.2rem', color: 'rgba(255,255,255, 0.9)' }}>
                                                {dateStr}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {SHIFT_BLOCKS.map((shift) => (
                                <tr key={shift.id}>
                                    {/* Removed Shift Label Cell */}
                                    {DAYS.map(day => {
                                        // For afternoon row, disable weekend cells
                                        if (shift.id === 'afternoon' && day.isWeekend) {
                                            return <td key={day.key} className="schedule-cell disabled-cell"></td>;
                                        }

                                        const employees = getEmployeesForShift(day.key, shift.id);

                                        // Determine time for this cell
                                        let timeLabel = '';
                                        if (shift.id === 'morning') {
                                            timeLabel = day.isWeekend ? '09:00 - 14:00' : '08:45 - 13:45';
                                        } else if (shift.id === 'afternoon') {
                                            timeLabel = '13:45 - 20:45';
                                        }

                                        return (
                                            <td key={day.key} className="schedule-cell">
                                                {employees.map(emp => (
                                                    <div
                                                        key={emp.username}
                                                        className="employee-cell"
                                                        style={{ backgroundColor: emp.color }}
                                                    >
                                                        <span className="employee-name">{emp.name}</span>
                                                        <span className="employee-time">{timeLabel}</span>
                                                    </div>
                                                ))}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
