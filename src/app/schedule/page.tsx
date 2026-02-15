'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getWeeklyScheduleForDate } from '@/lib/scheduleData';
import { MOCK_USERS } from '@/lib/mockData';
import './schedule.css';

// Employee colors
const EMPLOYEE_COLORS: Record<string, string> = {
    'javivasco': '#FFB84D',  // Orange (100%)
    'ivan': '#FFE066',       // Yellow (100%)
    'andres': '#90EE90',     // Light Green (100%)
    'cristina': '#FFB6C1',   // Light Pink (100%)
    'aisha': '#87CEFA',      // Light Sky Blue
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
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Helper to get the start of the week (Monday) for any given date
    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const startOfWeek = getStartOfWeek(selectedDate);

    // Get employees for a specific shift on a specific day
    const getEmployeesForShift = (day: string, shiftId: string) => {
        const employees = [];
        const isWeekend = day === 'saturday' || day === 'sunday';
        const weeklySchedule = getWeeklyScheduleForDate(selectedDate);

        for (const user of MOCK_USERS) {
            const userSchedule = weeklySchedule[user.username];
            if (!userSchedule) continue;

            const dayShift = userSchedule[day as keyof typeof userSchedule];

            // For morning row: show morning shifts on weekdays, full-day on weekends, OR full-day on weekdays
            if (shiftId === 'morning') {
                if (isWeekend && dayShift === 'full-day') {
                    employees.push({
                        name: user.name,
                        username: user.username,
                        color: EMPLOYEE_COLORS[user.username.toLowerCase()] || '#eee',
                    });
                } else if (!isWeekend && (dayShift === 'morning' || dayShift === 'full-day')) {
                    employees.push({
                        name: user.name,
                        username: user.username,
                        color: EMPLOYEE_COLORS[user.username.toLowerCase()] || '#eee',
                    });
                }
            }
            // For afternoon row: show on weekdays if afternoon OR full-day
            else if (shiftId === 'afternoon' && !isWeekend && (dayShift === 'afternoon' || dayShift === 'full-day')) {
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
                    <h1 className="schedule-title">Horario Semanal</h1>
                    <div className="date-selector">
                        <input
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="date-input"
                        />
                    </div>
                </div>
            </header>

            <main className="schedule-main container">
                <div className="schedule-grid-wrapper">
                    <table className="schedule-grid">
                        <thead>
                            <tr>
                                {/* Removed Shift Column Header */}
                                {DAYS.map(day => {
                                    // Calculate date for this day of the SELECTED week
                                    const targetDate = new Date(startOfWeek);
                                    targetDate.setDate(startOfWeek.getDate() + DAYS.indexOf(day));

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
                                        // Calculate date for this day of the SELECTED week
                                        const targetDate = new Date(startOfWeek);
                                        targetDate.setDate(startOfWeek.getDate() + DAYS.indexOf(day));
                                        const isHolidayToday = targetDate.toLocaleDateString('sv-SE') === '2026-02-02';

                                        // For afternoon row, disable weekend cells and holidays
                                        if (shift.id === 'afternoon' && (day.isWeekend || isHolidayToday)) {
                                            return <td key={day.key} className="schedule-cell disabled-cell"></td>;
                                        }

                                        const employees = getEmployeesForShift(day.key, shift.id);

                                        // Determine time for this cell
                                        let timeLabel = '';
                                        if (shift.id === 'morning') {
                                            if (isHolidayToday) {
                                                timeLabel = '09:00 - 14:00';
                                            } else {
                                                timeLabel = day.isWeekend ? '09:00 - 14:00' : '08:45 - 13:45';
                                            }
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
