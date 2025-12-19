import React from 'react';

type Status = 'synced' | 'syncing' | 'error';

interface SyncStatusProps {
    status: Status;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ status }) => {
    if (status === 'synced') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7 }} title="Todos los cambios guardados">
                <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981', // Green
                    display: 'inline-block'
                }}></span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Guardado</span>
            </div>
        );
    }

    if (status === 'syncing') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Guardando en la nube...">
                <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b', // Amber
                    display: 'inline-block',
                    animation: 'pulse 1s infinite'
                }}></span>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Guardando...</span>
                <style jsx>{`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.4; }
                        100% { opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="No se pudo guardar en la nube (Datos guardados SOLO en este dispositivo)">
            <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ef4444', // Red
                display: 'inline-block'
            }}></span>
            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>Offline (No Sincronizado)</span>
        </div>
    );
};
