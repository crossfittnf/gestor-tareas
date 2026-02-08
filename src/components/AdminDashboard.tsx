'use client';

import React, { useState, useEffect } from 'react';
import { User, MOCK_USERS, MOCK_TASKS, Task } from '@/lib/mockData';
import { getTasksForDateAndUser } from '@/lib/adminUtils';
import { subscribeToUserDay, DayLog } from '@/services/taskService'; // New Import
import { getTodayDateString } from '@/lib/dateUtils';
import { resetUserPassword } from '@/lib/user';
import './AdminDashboard.css';

interface AdminDashboardProps {
    currentUser: User;
}

export default function AdminDashboard({ currentUser }: AdminDashboardProps) {
    // State
    const [selectedDate, setSelectedDate] = useState(() => {
        return getTodayDateString();
    });
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [activeTab, setActiveTab] = useState<'tasks' | 'employees'>('tasks');
    const [resettingUser, setResettingUser] = useState<string | null>(null);
    const [resetSuccess, setResetSuccess] = useState<string | null>(null);

    // Real-time data validation
    const [logs, setLogs] = useState<Record<string, DayLog>>({});

    // Effect: Subscribe to updates
    useEffect(() => {
        const unsubs: (() => void)[] = [];

        // Employees to watch (Include admins as they might perform tasks too)
        const employeesToWatch = selectedEmployee === 'all'
            ? MOCK_USERS
            : MOCK_USERS.filter(u => u.username === selectedEmployee);

        // Clear previous logs on filter change/date change to avoid stale data flicker
        setLogs({});

        employeesToWatch.forEach(user => {
            const unsub = subscribeToUserDay(selectedDate, user.username, (data) => {
                setLogs(prev => ({
                    ...prev,
                    [user.username]: data || { username: user.username, date: selectedDate, tasks: {} }
                }));
            });
            unsubs.push(unsub);
        });

        return () => {
            unsubs.forEach(u => u());
        };
    }, [selectedDate, selectedEmployee]);

    // Helper to merge Mock Structure + Real-time Status
    const getMergedTasks = (username: string): Task[] => {
        // use adminUtils to get the "Scheduled" tasks (structure)
        const baseTasks = getTasksForDateAndUser(selectedDate, username);
        const userLog = logs[username];

        if (!userLog) return baseTasks; // Return base if no cloud data yet

        return baseTasks.map(t => {
            // Strip the prefix to get original ID
            const originalId = t.id.split('-').pop() || t.id;
            const cloudStatus = userLog.tasks?.[originalId];

            return {
                ...t,
                completed: cloudStatus?.completed ?? false,
                observations: cloudStatus?.observations ?? t.observations
            };
        });
    };

    // Calculate Stats on the fly based on 'logs'
    const calculateStats = () => {
        let total = 0;
        let completed = 0;
        const allObs: string[] = [];

        const usersToCount = selectedEmployee === 'all'
            ? MOCK_USERS
            : MOCK_USERS.filter(u => u.username === selectedEmployee);

        usersToCount.forEach(user => {
            const tasks = getMergedTasks(user.username);
            total += tasks.length;
            completed += tasks.filter(t => t.completed).length;

            tasks.forEach(t => {
                if (t.observations && t.observations.trim().length > 0) {
                    allObs.push(`${user.name} (Tarea: ${t.title}): ${t.observations}`);
                }
            });

            // Add General Observations
            const userLog = logs[user.username];
            if (userLog?.generalObservations?.trim()) {
                allObs.push(`${user.name} (General): ${userLog.generalObservations}`);
            }
        });

        return { total, completed, pending: total - completed, observations: allObs };
    };

    const stats = calculateStats();

    // Get tasks for display list
    const tasks = selectedEmployee !== 'all'
        ? getMergedTasks(selectedEmployee)
        : [];

    const handleResetPassword = async (username: string) => {
        if (!confirm(`¿Estás seguro de que quieres resetear la contraseña de ${username}? Volverá a ser su nombre de usuario.`)) {
            return;
        }

        setResettingUser(username);
        try {
            await resetUserPassword(username);
            setResetSuccess(username);
            setTimeout(() => setResetSuccess(null), 3000);
        } catch (error) {
            alert('Error al resetear la contraseña');
        } finally {
            setResettingUser(null);
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Tab Navigation */}
            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tasks')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Seguimiento de Tareas
                </button>
                <button
                    className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employees')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Gestión de Personal
                </button>
            </div>

            {activeTab === 'tasks' ? (
                <>
                    {/* Controls Section */}
                    <section className="admin-controls">
                        <div className="control-group">
                            <label className="control-label">
                                Fecha <span style={{ fontSize: '0.7em', color: '#aaa' }}>(Syncing...)</span>
                            </label>
                            <input
                                type="date"
                                className="glass-input"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="control-group">
                            <label className="control-label">Empleado</label>
                            <select
                                className="glass-input"
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                            >
                                <option value="all">Todos los empleados</option>
                                {MOCK_USERS.map(user => (
                                    <option key={user.id} value={user.username}>
                                        {user.name} ({user.role === 'admin' ? 'Admin' : 'Empleado'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {/* Stats Cards */}
                    <section className="stats-grid">
                        <div className="stat-card total">
                            <div className="stat-header">
                                <span className="stat-title">Total Tareas</span>
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                </div>
                            </div>
                            <div className="stat-value">{stats.total}</div>
                            <span className="stat-subtitle">Para el día seleccionado</span>
                        </div>
                        <div className="stat-card completed">
                            <div className="stat-header">
                                <span className="stat-title">Completadas</span>
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                            </div>
                            <div className="stat-value">{stats.completed}</div>
                            <span className="stat-subtitle">
                                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% de cumplimiento
                            </span>
                        </div>
                        <div className="stat-card pending">
                            <div className="stat-header">
                                <span className="stat-title">Pendientes</span>
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                </div>
                            </div>
                            <div className="stat-value">{stats.pending}</div>
                            <span className="stat-subtitle">Tareas restantes</span>
                        </div>
                    </section>

                    {/* Task List (Only if specific employee selected) */}
                    {selectedEmployee !== 'all' && (
                        <section className="admin-tasks-view">
                            <div className="section-header">
                                <h3 className="section-title">
                                    Lista de Tareas - {MOCK_USERS.find(u => u.username === selectedEmployee)?.name}
                                </h3>
                            </div>

                            {/* General Observations for Selected Employee */}
                            {logs[selectedEmployee]?.generalObservations && (
                                <div className="general-obs-box" style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                                    <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontSize: '1rem', fontWeight: 600 }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                        Observaciones Generales
                                    </h4>
                                    <p style={{ margin: 0, color: '#374151', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                        {logs[selectedEmployee].generalObservations}
                                    </p>
                                </div>
                            )}

                            <div className="tasks-container">
                                {tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <div key={task.id} className={`admin-task-item ${task.completed ? 'completed' : ''}`}>
                                            <div className="task-status-indicator">
                                                <div className="status-check">
                                                    {task.completed && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="task-content">
                                                <div className="task-title-row">
                                                    <span className="task-title">{task.title}</span>
                                                </div>
                                                <div className="task-explanation">
                                                    {task.explanation || task.description}
                                                </div>

                                                {task.observations && (
                                                    <div className="task-observation-box">
                                                        <div className="observation-icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                                            </svg>
                                                        </div>
                                                        <span className="observation-text">"{task.observations}"</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-placeholder">
                                        <div className="empty-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M8 12h8" />
                                            </svg>
                                        </div>
                                        <p>Este empleado no trabaja en la fecha seleccionada.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Aggregated Observations (If "All" is selected) */}
                    {selectedEmployee === 'all' && stats.observations.length > 0 && (
                        <section className="observations-panel">
                            <div className="section-header" style={{ paddingLeft: 0, background: 'transparent' }}>
                                <h3 className="section-title">Observaciones del Día</h3>
                            </div>
                            <ul className="obs-list">
                                {stats.observations.map((obs, idx) => (
                                    <li key={idx} className="obs-item">{obs}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {selectedEmployee === 'all' && stats.observations.length === 0 && (
                        <div className="empty-placeholder" style={{ marginTop: '2rem' }}>
                            <p>No hay observaciones registradas para este día.</p>
                        </div>
                    )}
                </>
            ) : (
                <section className="employee-management">
                    <div className="section-header">
                        <h3 className="section-title">Gestión de Empleados</h3>
                    </div>
                    <div className="employee-grid">
                        {MOCK_USERS.map(user => (
                            <div key={user.id} className="employee-card">
                                <div className="employee-info">
                                    <h4>{user.name}</h4>
                                    <p>Usuario: <strong>{user.username}</strong></p>
                                    <span className={`employee-tag tag-${user.role}`}>
                                        {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                                    </span>
                                </div>
                                <div className="employee-actions">
                                    <button
                                        className={`reset-btn ${resetSuccess === user.username ? 'success' : ''}`}
                                        disabled={resettingUser === user.username}
                                        onClick={() => handleResetPassword(user.username)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 2v6h-6"></path>
                                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                                            <path d="M3 22v-6h6"></path>
                                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                                        </svg>
                                        {resettingUser === user.username ? 'Reseteando...' : (resetSuccess === user.username ? '¡Reseteado!' : 'Resetear Contraseña')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
