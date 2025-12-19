import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default function ConnectionTester() {
    const [status, setStatus] = useState<string>('Esperando prueba...');
    const [details, setDetails] = useState<string>('');

    const testConnection = async () => {
        setStatus('Probando conexión...');
        setDetails('');
        try {
            // Try to read
            const testCol = collection(db, 'test_connection');
            await getDocs(testCol);

            // Try to write to verify permissions
            await addDoc(testCol, { timestamp: new Date(), type: 'diagnostic_write' });

            setStatus('✅ Conexión TOTAL (Lectura y Escritura) EXITOSA.');
        } catch (error: any) {
            console.error("Test failed", error);
            setStatus('❌ Error de Conexión');
            // Extract meaningful info
            let msg = error.message || JSON.stringify(error);
            if (error.code) msg = `Código: ${error.code} - ${msg}`;
            setDetails(msg);
        }
    };

    return (
        <div style={{
            padding: '1rem',
            background: '#f3f4f6',
            borderRadius: '8px',
            marginTop: '1rem',
            border: '1px solid #d1d5db',
            fontSize: '0.9rem',
            fontFamily: 'monospace'
        }}>
            <h4>Diagnóstico de Base de Datos</h4>
            <button
                onClick={testConnection}
                style={{
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '0.5rem'
                }}
            >
                Probar Conexión Ahora
            </button>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{status}</div>
            {details && (
                <div style={{
                    color: '#dc2626',
                    background: '#fee2e2',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    wordBreak: 'break-all'
                }}>
                    {details}
                </div>
            )}
        </div>
    );
}
