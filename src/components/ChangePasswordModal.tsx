import React, { useState } from 'react';
import { updateUserPassword } from '@/lib/user';
import './ChangePasswordModal.css';

interface ChangePasswordModalProps {
    userId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ChangePasswordModal({ userId, onClose, onSuccess }: ChangePasswordModalProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        try {
            await updateUserPassword(userId, newPassword);
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al actualizar la contraseña');
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Cambiar Contraseña</h2>

                <form onSubmit={handleSubmit} className="change-password-form">
                    <div className="form-group">
                        <label>Nueva Contraseña</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nueva contraseña"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-visibility"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite la contraseña"
                            required
                        />
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn" disabled={isLoading}>
                            Cancelar
                        </button>
                        <button type="submit" className="save-btn" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
