'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Task, MOCK_TASKS, ShiftType, SHIFT_LABELS, MOCK_USERS } from '@/lib/mockData';
import { isUserWorkingToday, getUserShiftToday, getCurrentDayOfWeek, getMorningEmployeeName } from '@/lib/scheduleData';
import { getTodayDateString } from '@/lib/dateUtils';
import { subscribeToUserDay, updateTaskStatus, DayLog, subscribeToShoppingList } from '@/services/taskService';
import TaskItem from '@/components/TaskItem';
import ShoppingBlackboard from '@/components/ShoppingBlackboard';
import Link from 'next/link';
import AdminDashboard from '@/components/AdminDashboard';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { SyncStatus } from '@/components/SyncStatus'; // Import new component
import './dashboard.css';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedShift, setSelectedShift] = useState<ShiftType | null>(null);
    const [isWorking, setIsWorking] = useState<boolean>(false);

    // Morning Shift Summary Logic
    const [morningUser, setMorningUser] = useState<User | null>(null);
    const [morningLog, setMorningLog] = useState<DayLog | null>(null);

    // Shopping List Logic
    const [shoppingList, setShoppingList] = useState<string[]>([]);

    // Change Password Modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Dropdown Menu State
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Sync Status State
    const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
    const [lastError, setLastError] = useState<string>(''); // Capture detailed error

    // Monitor Online/Offline events
    useEffect(() => {
        const handleOnline = () => {
            setSyncStatus('synced');
            setLastError('');
        };
        const handleOffline = () => {
            setSyncStatus('error');
            setLastError('Browser Offline Event');
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const unsub = subscribeToShoppingList((data) => {
            // Merge logic required for Shopping List too?
            // Currently simple overwrite, but we have offline logic in component.
            // This listener just keeps app shell aware? 
            // Actually ShoppingBlackboard handles its own subscription/logic usually?
            // Checking: Dashboard DOES pass nothing to Blackboard, ShoppingBlackboard handles itself? 
            // Wait, this subscription in DashboardPage seems redundant if ShoppingBlackboard is self-contained.
            // Let's verify ShoppingBlackboard imports.
            setShoppingList(data);
        }, (error) => {
            setSyncStatus('error');
            setLastError(error.message);
        });
        return () => unsub();
    }, []);

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

            // 0. Load from LocalStorage (Offline Cache)
            const todayStr = getTodayDateString();
            const localKey = `offline_tasks_${todayStr}_${currentUser.username}`;
            const savedData = localStorage.getItem(localKey);

            let initialTasks = baseTasks;

            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    // Merge local data into base tasks
                    initialTasks = baseTasks.map(t => {
                        if (parsed[t.id]) {
                            return { ...t, ...parsed[t.id] };
                        }
                        return t;
                    });
                } catch (e) {
                    console.error("Error parsing local tasks", e);
                }
            }

            setTasks(initialTasks);

            // 1. Subscribe to OWN tasks
            const unsubOwn = subscribeToUserDay(todayStr, currentUser.username, (data) => {
                if (data && data.tasks) {
                    setTasks(prevTasks => {
                        // READ LATEST LOCAL STORAGE to Ensure we don't overwrite recent offline changes
                        const currentLocalStr = localStorage.getItem(localKey);
                        const currentLocal = currentLocalStr ? JSON.parse(currentLocalStr) : {};

                        return prevTasks.map(t => {
                            const cloudStatus = data.tasks[t.id];
                            const localStatus = currentLocal[t.id];

                            // MERGE LOGIC:
                            // If Local says completed, keep it completed (User might have just clicked it and cloud is lagging)
                            // If Cloud says completed, accept it (Other device update?)
                            // We prioritize 'true' to avoid data loss.

                            const isCompleted = (localStatus?.completed) || (cloudStatus?.completed) || false;

                            // Observations: Concatenate? Or prefer Local if newer? 
                            // Let's prefer Local if it exists and is not empty, else Cloud.
                            const observation = (localStatus?.observations) || (cloudStatus?.observations) || t.observations;

                            if (cloudStatus || localStatus) {
                                return {
                                    ...t,
                                    completed: isCompleted,
                                    observations: observation
                                };
                            }
                            return t;
                        });
                    });
                }
            }, (error) => {
                console.error("Subscription Error (Own Tasks):", error);
                setSyncStatus('error');
                setLastError(error.message);
            });

            // 2. If Afternoon shift, subscribe to MORNING tasks
            let unsubMorning = () => { };
            if (todayShift === 'afternoon') {
                const dayOfWeek = getCurrentDayOfWeek();
                const morningUsername = getMorningEmployeeName(dayOfWeek);

                if (morningUsername) {
                    const mUser = MOCK_USERS.find(u => u.username === morningUsername);
                    setMorningUser(mUser || null);

                    unsubMorning = subscribeToUserDay(todayStr, morningUsername, (data) => {
                        setMorningLog(data);
                    }, (error) => {
                        console.error("Subscription Error (Morning Tasks):", error);
                        setSyncStatus('error');
                        setLastError(error.message);
                    });
                }
            }

            return () => {
                unsubOwn();
                unsubMorning();
            };
        }
    }, [router, user, isWorking]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        router.push('/');
    };

    const handleToggleTask = async (id: string, completed: boolean) => {
        // Optimistic UI Update
        const newTasks = tasks.map(t =>
            t.id === id ? { ...t, completed } : t
        );
        setTasks(newTasks);

        // SAVE TO LOCAL STORAGE (Immediate Persistence)
        if (user && isWorking) {
            const todayStr = getTodayDateString();
            const localKey = `offline_tasks_${todayStr}_${user.username}`;

            // Build a map of changes to save
            const currentSaved = JSON.parse(localStorage.getItem(localKey) || '{}');
            currentSaved[id] = { ...currentSaved[id], completed };
            localStorage.setItem(localKey, JSON.stringify(currentSaved));

            // Sync to Cloud with Timeout
            setSyncStatus('syncing');
            try {
                // Create a timeout promise
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Sync timed out")), 5000)
                );

                await Promise.race([
                    updateTaskStatus(todayStr, user.username, id, { completed }),
                    timeout
                ]);

                setSyncStatus('synced');
                setLastError('');
            } catch (e: any) {
                console.error("Failed to sync task", e);
                setSyncStatus('error');
                setLastError(e?.message || 'Unknown Sync Error');
            }
        }
    };

    const handleUpdateObservations = async (id: string, observations: string) => {
        // Optimistic UI Update
        const newTasks = tasks.map(t =>
            t.id === id ? { ...t, observations } : t
        );
        setTasks(newTasks);

        // SAVE TO LOCAL STORAGE (Immediate Persistence)
        if (user && isWorking) {
            const todayStr = getTodayDateString();
            const localKey = `offline_tasks_${todayStr}_${user.username}`;

            // Build a map of changes to save
            const currentSaved = JSON.parse(localStorage.getItem(localKey) || '{}');
            currentSaved[id] = { ...currentSaved[id], observations };
            localStorage.setItem(localKey, JSON.stringify(currentSaved));

            // Sync to Cloud with Timeout
            setSyncStatus('syncing');
            try {
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Sync timed out")), 5000)
                );

                await Promise.race([
                    updateTaskStatus(todayStr, user.username, id, { observations }),
                    timeout
                ]);

                setSyncStatus('synced');
                setLastError('');
            } catch (e: any) {
                console.error("Failed to sync observations", e);
                setSyncStatus('error');
                setLastError(e?.message || 'Unknown Sync Error');
            }
        }
    };

    // Admin View Toggle
    const [viewMode, setViewMode] = useState<'employee' | 'admin'>('employee');

    // Calculate stats for current user
    // Filter tasks based on shift!
    const filteredTasks = selectedShift
        ? tasks.filter(t => t.shift === selectedShift)
        : [];

    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.completed).length;
    const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    // Calculate stats for morning user (if available)
    let morningStats = { total: MOCK_TASKS.length, completed: 0, percentage: 0 };
    let morningCompletedTasks: Task[] = [];
    let morningPendingTasks: Task[] = [];
    let morningObservations: { taskTitle: string, text: string }[] = [];

    if (morningUser && morningLog && morningLog.tasks) {
        const morningShiftTasks = MOCK_TASKS.filter(t => t.shift === 'morning');
        morningStats.total = morningShiftTasks.length;

        morningShiftTasks.forEach(task => {
            const status = morningLog!.tasks[task.id];
            const isCompleted = status?.completed ?? false;

            if (isCompleted) {
                morningCompletedTasks.push(task);
            } else {
                morningPendingTasks.push(task);
            }

            if (status?.observations) {
                morningObservations.push({
                    taskTitle: task.title,
                    text: status.observations
                });
            }
        });

        const completedCount = morningCompletedTasks.length;
        morningStats.completed = completedCount;
        morningStats.percentage = morningStats.total === 0 ? 0 : (completedCount / morningStats.total) * 100;
    }

    // Determine if current user is admin
    const isAdmin = user?.role === 'admin';

    // If Admin is in 'admin' mode
    if (isAdmin && viewMode === 'admin' && user) {
        return (
            <main className="dashboard-page">
                <header className="dashboard-header">
                    {/* Simplified Header for Admin View */}
                    <div className="header-content">
                        <div className="header-info">
                            <h1 className="header-title">Panel de Administración</h1>
                        </div>
                        <div className="header-actions">
                            {/* Toggle Button */}
                            {isWorking && (
                                <button onClick={() => setViewMode('employee')} className="header-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                    ← Ir a mis tareas
                                </button>
                            )}
                            <button onClick={handleLogout} className="logout-button">
                                Salir
                            </button>
                        </div>
                    </div>
                </header>
                <div style={{ marginTop: '1rem' }}>
                    <AdminDashboard currentUser={user} />
                </div>
                {showPasswordModal && (
                    <ChangePasswordModal
                        userId={user.id}
                        onClose={() => setShowPasswordModal(false)}
                        onSuccess={() => {
                            setShowPasswordModal(false);
                            // Optional: Show a toast/alert
                            alert('Contraseña actualizada correctamente');
                        }}
                    />
                )}
            </main>
        );
    }

    if (!isWorking && !isAdmin) {
        return (
            <main className="dashboard-page">
                <header className="dashboard-header">
                    <div className="header-content">
                        <div className="header-info">
                            <h1 className="header-title">Panel de Control</h1>
                            <p className="header-subtitle">Bienvenido, {user?.name}</p>
                        </div>
                        <div className="header-actions">
                            <button onClick={handleLogout} className="logout-button">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </header>
                <div className="dashboard-main">
                    <div className="not-working-message">
                        <div className="not-working-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <h2 className="not-working-title">No tienes turno hoy</h2>
                        <p className="not-working-text">
                            Hoy no apareces en el cuadrante de trabajo.
                            Si crees que es un error, contacta con administración.
                        </p>
                        <Link href="/schedule" className="button-primary" style={{ display: 'inline-block', color: 'var(--primary)', fontWeight: 'bold' }}>
                            Ver Horario Semanal
                        </Link>
                    </div>
                </div>
                {showPasswordModal && (
                    <ChangePasswordModal
                        userId={user?.id || ''}
                        onClose={() => setShowPasswordModal(false)}
                        onSuccess={() => {
                            setShowPasswordModal(false);
                            alert('Contraseña actualizada correctamente');
                        }}
                    />
                )
                }
            </main >
        );
    }

    // Fallback for Admin who isn't working but is in 'employee' mode inadvertently?
    // Reset to admin if not working and admin
    if (isAdmin && !isWorking && viewMode === 'employee') {
        // Force admin mode? better to handle in effect, but here works for render
        // Actually, if they are admin, they can see admin interface.
        // Let's just show Admin interface above if not working.
        // But the condition above handles (isAdmin && viewMode === 'admin').
        // So here we are if isAdmin && viewMode === 'employee' && !isWorking.
        // Just show "Not Working" with a button to go back to Admin.
    }

    return (
        <main className="dashboard-page">
            <header className="dashboard-header">
                <div className="header-shift-badge">
                    Turno: {selectedShift ? SHIFT_LABELS[selectedShift] : '...'}
                </div>
                <div className="header-content">
                    <div className="header-info">
                        <h1 className="header-title">{user?.name}</h1>
                        <p className="header-subtitle">Panel de Empleado</p>
                    </div>
                    <div className="header-actions">
                        <SyncStatus status={syncStatus} />
                        <div className="user-menu-container" style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="menu-trigger"
                                aria-label="Menú de usuario"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="menu-overlay"
                                        onClick={() => setIsMenuOpen(false)}
                                        style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            zIndex: 40
                                        }}
                                    />
                                    <div
                                        className="dropdown-menu"
                                        style={{
                                            position: 'absolute',
                                            top: '120%',
                                            right: 0,
                                            background: 'white',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                            width: '220px',
                                            zIndex: 50,
                                            overflow: 'hidden',
                                            border: '1px solid #e5e7eb',
                                            animation: 'fadeIn 0.2s ease-out'
                                        }}
                                    >
                                        <div className="menu-header" style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                                            <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{user?.name}</p>
                                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>@{user?.username}</p>
                                        </div>

                                        <div className="menu-items" style={{ padding: '0.5rem' }}>
                                            <Link
                                                href="/schedule"
                                                className="menu-item"
                                                onClick={() => setIsMenuOpen(false)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem 1rem',
                                                    color: '#374151',
                                                    textDecoration: 'none',
                                                    fontSize: '0.95rem',
                                                    borderRadius: '8px',
                                                    transition: 'background-color 0.15s'
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                Ver Horario
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setShowPasswordModal(true);
                                                }}
                                                className="menu-item"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem 1rem',
                                                    color: '#374151',
                                                    background: 'none',
                                                    border: 'none',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    fontSize: '0.95rem',
                                                    cursor: 'pointer',
                                                    borderRadius: '8px',
                                                    transition: 'background-color 0.15s'
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                Cambiar Contraseña
                                            </button>

                                            {isAdmin && (
                                                <button
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        setViewMode('admin');
                                                    }}
                                                    className="menu-item"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.75rem 1rem',
                                                        color: '#374151',
                                                        background: 'none',
                                                        border: 'none',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        fontSize: '0.95rem',
                                                        cursor: 'pointer',
                                                        borderRadius: '8px',
                                                        transition: 'background-color 0.15s'
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                                    Panel Admin
                                                </button>
                                            )}

                                            <div style={{ height: '1px', background: '#e5e7eb', margin: '0.5rem 0' }}></div>

                                            <button
                                                onClick={handleLogout}
                                                className="menu-item"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem 1rem',
                                                    color: '#ef4444',
                                                    background: 'none',
                                                    border: 'none',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    fontSize: '0.95rem',
                                                    cursor: 'pointer',
                                                    borderRadius: '8px',
                                                    transition: 'background-color 0.15s'
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="dashboard-main">
                <div className="dashboard-layout">
                    <div className="dashboard-tasks-main">
                        {/* Morning Summary Widget (Only for Afternoon Shift) */}
                        {selectedShift === 'afternoon' && morningUser && (
                            <div className="morning-summary-card">
                                <div className="morning-summary-header">
                                    <h3 className="morning-summary-title">Resumen Turno Mañana ({morningUser.name})</h3>
                                </div>

                                <div className="morning-summary-grid">
                                    <div className="morning-column completed">
                                        <h4 className="morning-column-title">Realizadas ✅</h4>
                                        {morningCompletedTasks.length > 0 ? (
                                            <ul className="morning-task-list">
                                                {morningCompletedTasks.map(t => (
                                                    <li key={t.id} className="morning-task-item">{t.title}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="morning-empty-text">Ninguna completada</p>
                                        )}
                                    </div>

                                    <div className="morning-column pending">
                                        <h4 className="morning-column-title">Pendientes ⏳</h4>
                                        {morningPendingTasks.length > 0 ? (
                                            <ul className="morning-task-list">
                                                {morningPendingTasks.map(t => (
                                                    <li key={t.id} className="morning-task-item">{t.title}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="morning-empty-text">Todo completado</p>
                                        )}
                                    </div>
                                </div>

                                {morningObservations.length > 0 && (
                                    <div className="morning-observations-section">
                                        <h4 className="morning-observations-title">Observaciones</h4>
                                        <ul className="morning-observations-list">
                                            {morningObservations.map((obs, idx) => (
                                                <li key={idx} className="morning-observation-item">
                                                    <strong>{obs.taskTitle}:</strong> {obs.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="progress-section">
                            <div className="progress-header">
                                <h2 className="progress-title">Tus Tareas</h2>
                                <span className="progress-text">
                                    {completedTasks} de {totalTasks} completadas
                                </span>
                            </div>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

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
                        </div>

                        {filteredTasks.length === 0 && (
                            <div className="empty-state">
                                No hay tareas asignadas para este turno.
                            </div>
                        )}

                        <div className="whatsapp-section">
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    const dateStr = now.toLocaleDateString('es-ES');
                                    const shiftLabel = selectedShift ? SHIFT_LABELS[selectedShift] : 'Turno';

                                    // Calculate stats
                                    const pending = filteredTasks.filter(t => !t.completed);
                                    const obsList = filteredTasks.filter(t => t.observations && t.observations.trim().length > 0);

                                    // Simplified Header
                                    let message = `� *${user?.name}* | 📅 ${dateStr} | ${shiftLabel}\n\n`;

                                    message += `✅ *Completadas:* ${completedTasks}/${totalTasks}\n\n`;

                                    if (pending.length > 0) {
                                        message += `⚠️ *Pendientes:*\n`;
                                        pending.forEach(t => {
                                            message += `- ${t.title}\n`;
                                        });
                                        message += `\n`;
                                    } else {
                                        message += `🎉 *Todo al día*\n\n`;
                                    }

                                    // Shopping List Section
                                    if (shoppingList.length > 0) {
                                        message += `🛒 *Falta comprar:*\n`;
                                        shoppingList.forEach(item => {
                                            message += `- ${item}\n`;
                                        });
                                        message += `\n`;
                                    }

                                    if (obsList.length > 0) {
                                        message += `📝 *Observaciones:*\n`;
                                        obsList.forEach(t => {
                                            message += `- *${t.title}:* ${t.observations}\n`;
                                        });
                                    }

                                    const encodedMessage = encodeURIComponent(message);
                                    window.open(`https://wa.me/34618289708?text=${encodedMessage}`, '_blank');
                                }}
                                className="whatsapp-button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                                </svg>
                                Enviar Reporte por WhatsApp
                            </button>
                        </div>
                    </div> {/* Close dashboard-tasks-main */}

                    <aside className="dashboard-sidebar">
                        <ShoppingBlackboard onSyncStatusChange={setSyncStatus} />
                    </aside>
                </div> {/* Close dashboard-layout */}

                {/* Debug Info Footer */}
                <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: '0.75rem', textAlign: 'center' }}>
                    <p>Debug ID: {getTodayDateString()}_{user?.username} | Status: {syncStatus} {lastError && `| Error: ${lastError}`}</p>
                </div>
            </div>
            {showPasswordModal && user && (
                <ChangePasswordModal
                    userId={user.id}
                    onClose={() => setShowPasswordModal(false)}
                    onSuccess={() => {
                        setShowPasswordModal(false);
                        alert('Contraseña actualizada correctamente');
                    }}
                />
            )}
        </main>
    );
}
