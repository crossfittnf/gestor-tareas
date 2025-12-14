'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Task, MOCK_TASKS, ShiftType, SHIFT_LABELS } from '@/lib/mockData';
import { isUserWorkingToday, getUserShiftToday } from '@/lib/scheduleData';
import { subscribeToUserDay, updateTaskStatus } from '@/services/taskService'; // New Import
import TaskItem from '@/components/TaskItem';
import Link from 'next/link';
import './dashboard.css';
import AdminDashboard from '@/components/AdminDashboard';
import './dashboard.css';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedShift, setSelectedShift] = useState<ShiftType | null>(null);
    const [isWorking, setIsWorking] = useState<boolean>(false);

    useEffect(() => {
        // Check authentication
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            router.push('/');
            return;
        }
        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);

        // Check if user is working today
        const workingToday = isUserWorkingToday(currentUser.username);
        setIsWorking(workingToday);

        if (workingToday) {
            // Get user's shift for today
            const todayShift = getUserShiftToday(currentUser.username);
            setSelectedShift(todayShift);

            // Fetch Base Tasks
            const baseTasks = MOCK_TASKS;
            setTasks(baseTasks);

            // Subscribe to Firestore for Real-time Status
            const todayStr = new Date().toISOString().split('T')[0];

            const unsub = subscribeToUserDay(todayStr, currentUser.username, (data) => {
                if (data && data.tasks) {
                    // Merge cloud status into local tasks
                    setTasks(prevTasks => prevTasks.map(t => {
                        const cloudStatus = data.tasks[t.id];
                        if (cloudStatus) {
                            return {
                                ...t,
                                completed: cloudStatus.completed,
                                observations: cloudStatus.observations || t.observations
                            };
                        }
                        return t;
                    }));
                }
            });

            return () => unsub();
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        router.push('/');
    };

    const handleToggleTask = async (id: string, completed: boolean) => {
        // Optimistic UI Update
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, completed } : t
        ));

        // Sync to Cloud
        if (user && isWorking) {
            const todayStr = new Date().toISOString().split('T')[0];
            try {
                await updateTaskStatus(todayStr, user.username, id, { completed });
            } catch (e) {
                console.error("Failed to sync task", e);
                // Revert on error? For now, keep optimistic.
            }
        }
    };

    const handleUpdateObservations = async (id: string, observations: string) => {
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, observations } : t
        ));

        // Sync to Cloud
        if (user && isWorking) {
            const todayStr = new Date().toISOString().split('T')[0];
            try {
                await updateTaskStatus(todayStr, user.username, id, { observations });
            } catch (e) {
                console.error("Failed to sync observations", e);
            }
        }
    };

    // Determine if current user is admin
    const isAdmin = user?.role === 'admin';


    if (!user) return null;

    // If not working today, show message (UNLESS ADMIN)
    if (!isWorking && !isAdmin) {
        return (
            <div className="dashboard-page">
                <header className="dashboard-header">
                    <div className="container header-content">
                        <div className="header-info">
                            <h1 className="header-title">Gestor de Tareas</h1>
                            <p className="header-subtitle">Hola, {user.name}</p>
                        </div>
                        <div className="header-actions">
                            <Link href="/schedule" className="header-link">
                                Ver Horario Semanal
                            </Link>
                            <button onClick={handleLogout} className="logout-button">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </header>

                <main className="dashboard-main container">
                    <div className="not-working-message">
                        <div className="not-working-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </div>
                        <h2 className="not-working-title">Hoy no trabajas</h2>
                        <p className="not-working-text">
                            Según el horario semanal, hoy tienes el día libre. ¡Disfruta tu descanso!
                        </p>
                        <Link href="/schedule" className="btn btn-primary">
                            Ver Horario Completo
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // Filter tasks by selected shift and full-day tasks for current user view
    const filteredTasks = selectedShift
        ? tasks.filter(t => t.shift === selectedShift || t.shift === 'full-day')
        : [];

    const completedCount = filteredTasks.filter(t => t.completed).length;
    const progress = filteredTasks.length > 0
        ? Math.round((completedCount / filteredTasks.length) * 100)
        : 0;

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="dashboard-header">
                <div className="container header-content">
                    <div className="header-info">
                        <h1 className="header-title">Gestor de Tareas</h1>
                        <p className="header-subtitle">Hola, {user.name} {isAdmin && '(Administrador)'}</p>
                    </div>
                    {/* Shift badge in header (only if working today) */}
                    {selectedShift && (
                        <div className="header-shift-badge">
                            {SHIFT_LABELS[selectedShift]}
                        </div>
                    )}
                    <div className="header-actions">
                        <Link href="/schedule" className="header-link">
                            Ver Horario Semanal
                        </Link>
                        <button onClick={handleLogout} className="logout-button">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {isAdmin && (
                <div className="container" style={{ marginTop: '2rem' }}>
                    <AdminDashboard currentUser={user} />
                </div>
            )}

            <main className="dashboard-main container">

                {/* Progress Section */}
                <div className="progress-section">
                    <div className="progress-header">
                        <h2 className="progress-title">
                            Tareas de Hoy
                        </h2>
                        <span className="progress-text">
                            {completedCount} de {filteredTasks.length} completadas
                        </span>
                    </div>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="tasks-list">
                    {filteredTasks.map((task, index) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            taskNumber={index + 1}
                            onToggle={handleToggleTask}
                            onUpdateObservations={handleUpdateObservations}
                        />
                    ))}

                    {filteredTasks.length === 0 && (
                        <div className="empty-state">
                            No hay tareas asignadas para este turno.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
