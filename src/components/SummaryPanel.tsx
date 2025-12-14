import React from 'react';
import { Task } from '@/lib/mockData';
import './SummaryPanel.css';

interface SummaryPanelProps {
    tasks: Task[];
}

interface DayStats {
    date: string;
    total: number;
    completed: number;
    pending: number;
    observations: string[];
}

export default function SummaryPanel({ tasks }: SummaryPanelProps) {
    // Group tasks by date
    const dayMap: Record<string, DayStats> = {};
    tasks.forEach((t) => {
        const date = t.date;
        if (!dayMap[date]) {
            dayMap[date] = { date, total: 0, completed: 0, pending: 0, observations: [] };
        }
        const stats = dayMap[date];
        stats.total += 1;
        if (t.completed) {
            stats.completed += 1;
        } else {
            stats.pending += 1;
        }
        if (t.observations && t.observations.trim().length > 0) {
            stats.observations.push(`${t.title}: ${t.observations}`);
        }
    });

    const dayStats = Object.values(dayMap).sort((a, b) => (a.date > b.date ? 1 : -1));

    return (
        <section className="summary-panel">
            <h2 className="summary-title">Resumen del Equipo</h2>
            {dayStats.map((day) => (
                <div key={day.date} className="day-summary">
                    <h3 className="day-date">{day.date}</h3>
                    <div className="summary-stats">
                        <div className="stat-item"><strong>Total Tareas:</strong> {day.total}</div>
                        <div className="stat-item"><strong>Completadas:</strong> {day.completed}</div>
                        <div className="stat-item"><strong>Pendientes:</strong> {day.pending}</div>
                    </div>
                    {day.observations.length > 0 && (
                        <div className="summary-observations">
                            <h4>Observaciones Recientes</h4>
                            <ul>
                                {day.observations.slice(0, 5).map((obs, idx) => (
                                    <li key={idx}>• {obs}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </section>
    );
}
