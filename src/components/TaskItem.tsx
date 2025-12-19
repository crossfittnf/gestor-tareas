'use client';

import { useState } from 'react';
import { Task } from '@/lib/mockData';
import './TaskItem.css';

interface TaskItemProps {
    task: Task;
    taskNumber: number;
    onToggle: (id: string, completed: boolean) => void;
    onUpdateObservations: (id: string, observations: string) => void;
}

export default function TaskItem({ task, taskNumber, onToggle, onUpdateObservations }: TaskItemProps) {
    const [showObservations, setShowObservations] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    return (
        <div className={`task-item ${task.completed ? 'completed' : ''}`}>
            {/* Line 1: Number Badge + Checkbox + Title + Explanation Button */}
            <div className="task-header">
                <div className="task-main">
                    <div className="task-number-badge">
                        {taskNumber}
                    </div>
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => onToggle(task.id, e.target.checked)}
                        className="task-checkbox"
                        id={`task-${task.id}`}
                    />
                    <label htmlFor={`task-${task.id}`} className="task-title">
                        {task.title}
                    </label>
                </div>

                {task.explanation && (
                    <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="explanation-button"
                        title="Ver explicación"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Explanation (collapsible) */}
            {showExplanation && task.explanation && (
                <div className="task-explanation">
                    <div className="explanation-content">
                        <strong>Explicación:</strong>
                        <p>{task.explanation}</p>
                    </div>
                </div>
            )}

            {/* Line 2: Observations Button */}
            <div className="task-actions">
                <button
                    onClick={() => setShowObservations(!showObservations)}
                    className="observations-toggle"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {showObservations ? 'Ocultar observaciones' : 'Añadir observaciones'}
                </button>
            </div>

            {/* Observations Field (collapsible) */}
            {showObservations && (
                <div className="task-observations">
                    <label className="observations-label">
                        Observaciones / Reporte:
                    </label>
                    <textarea
                        className="observations-textarea"
                        placeholder={
                            task.id.includes('5') && (task.title.includes('llamadas') || task.title.includes('listados'))
                                ? "Por favor indica:\n- 14 Days:\n- Seguimiento:"
                                : "Escribe aquí cualquier incidencia o comentario sobre la tarea..."
                        }
                        value={task.observations || ''}
                        onChange={(e) => onUpdateObservations(task.id, e.target.value)}
                        rows={task.id.includes('5') && (task.title.includes('llamadas') || task.title.includes('listados')) ? 4 : 3}
                    />
                </div>
            )}
        </div>
    );
}
