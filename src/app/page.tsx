'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByUsername, updateUserPassword } from '@/lib/user';
import { User } from '@/lib/mockData';
import './login.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'change-password'>('login');
  const [tempUser, setTempUser] = useState<User | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log("Attempting login for:", username);
      const user = await getUserByUsername(username);
      console.log("User found:", user);

      // Simple password check (in a real app, use bcrypt/hashing)
      // We check if:
      // 1. User exists
      // 2. Password matches (stored password or fallback to username as initial password)
      // Check if we have an offline override for this user
      const savedOfflineUsers = JSON.parse(localStorage.getItem('offline_users') || '{}');
      const offlineUser = user ? savedOfflineUsers[user.id] : null;

      // Use offline password if available, otherwise database/mock password
      // If we have an offline user, we trust its password over the "stale" mock data found via fallback
      const effectiveUser = offlineUser || user;
      const storedPassword = effectiveUser?.password || effectiveUser?.username;

      console.log("Login check:", {
        inputPassword: password,
        hasOfflineData: !!offlineUser,
        storedPassword
      });

      if (effectiveUser && password === storedPassword) {
        if (effectiveUser.requiresPasswordChange) {
          setTempUser(effectiveUser);
          setStep('change-password');
          setIsLoading(false);
        } else {
          localStorage.setItem('currentUser', JSON.stringify(user));
          router.push('/dashboard');
        }
      } else {
        console.warn(`Password mismatch. Input: ${password}, Stored: ${storedPassword}`);
        setError('Usuario o contraseña incorrectos. (Si no tienes internet, prueba tu contraseña inicial)');
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError('Error al conectar con el servidor. Revisa la consola.');
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!tempUser) return;

    setIsLoading(true);
    try {
      await updateUserPassword(tempUser.id, newPassword);

      // Update local object to reflect change immediately if we wanted to auto-login
      // But let's just finish the flow
      const updatedUser = { ...tempUser, password: newPassword, requiresPasswordChange: false };

      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setSuccess('Contraseña actualizada correctamente. Redirigiendo...');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error("Update failed or timed out:", err);
      // Show EXACT error for debugging
      const errorMessage = err?.message || JSON.stringify(err);
      setError(`Error Técnico: ${errorMessage}`);

      // SAVE TO PERMANENT LOCAL STORAGE for offline persistence
      const savedOfflineUsers = JSON.parse(localStorage.getItem('offline_users') || '{}');
      if (tempUser?.id) {
        savedOfflineUsers[tempUser.id] = { ...tempUser, password: newPassword, requiresPasswordChange: false };
        localStorage.setItem('offline_users', JSON.stringify(savedOfflineUsers));
      }

      // Fudge the user for local session
      const updatedUser = { ...tempUser, password: newPassword, requiresPasswordChange: false };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      setSuccess('Conexión débil: Contraseña guardada SOLO para esta sesión (Offline Mode). Redirigiendo...');

      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="decorative-bar"></div>

        <div className="login-header">
          <div className="icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 className="login-title">
            Gestión de tareas de Tnf Box
          </h1>
          <p className="login-subtitle">
            {step === 'login' ? 'Bienvenido al portal del empleado' : 'Actualiza tu contraseña'}
          </p>
        </div>

        {step === 'login' ? (
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input"
                  placeholder="Ej: juan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`login-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <div className="button-loading">
                  <div className="spinner"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleChangePassword}>
            <div className="info-message" style={{ marginBottom: '1rem', color: '#4b5563', fontSize: '0.9rem', textAlign: 'center' }}>
              Es necesario que cambies tu contraseña antes de continuar.
            </div>

            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  Nueva Contraseña
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    className="input"
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message" style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`login-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <div className="button-loading">
                  <div className="spinner"></div>
                  <span>Actualizando...</span>
                </div>
              ) : (
                'Cambiar Contraseña'
              )}
            </button>
          </form>
        )}

        <p className="footer-text">
          Sistema de gestión interna v1.0
        </p>
      </div>
    </main>
  );
}
