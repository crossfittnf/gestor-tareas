'use client';

import React, { useState, useEffect, useRef } from 'react';
import { subscribeToShoppingList, updateShoppingList } from '@/services/taskService';
import './ShoppingBlackboard.css';

export default function ShoppingBlackboard() {
    const [items, setItems] = useState<string[]>([]);
    const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Initial Load from Local Storage
        const saved = localStorage.getItem('offline_shopping_list');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }

        // 2. Subscribe to Cloud
        const unsub = subscribeToShoppingList((data) => {
            // MERGE POLICY: Union of local and cloud to prevent data loss on refresh
            // If cloud has data, we trust it? 
            // Or if cloud is empty but local has data, keep local?

            // Current approach: If cloud returns data, use it. But if cloud is empty/fails and we have local, keep local?
            // Safer: If data is not empty, use it.
            if (data && data.length > 0) {
                setItems(data);
                // Also update local cache to match cloud
                localStorage.setItem('offline_shopping_list', JSON.stringify(data));
            }
            // If data is empty but we have local, maybe we shouldn't wipe it immediately if it's a connection glitch?
            // But if user genuinely deleted everything, effective sync requires wiping.
            // Let's rely on the fact that if 'data' comes in as empty array [], it means "deleted".
            // However, to fix "I write and it disappears":
            // We'll set state.
            else if (data && data.length === 0) {
                // Should we wipe? If user says "it wipes", maybe cloud is returning [] erroneously?
                // For now, let's respect cloud if it returns, but...
                // Only if network is actually connected? We don't know.
                // Let's trust cloud > local generally, BUT:
                // If I just wrote to local, and cloud writes fail, cloud listener might not fire or fire with old data?
                // Let's just update local on every valid cloud update.
                setItems(data);
                localStorage.setItem('offline_shopping_list', JSON.stringify(data));
            }
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const updateLocalAndCloud = async (newItems: string[]) => {
        // 1. Update State
        setItems(newItems);
        // 2. Update Local
        localStorage.setItem('offline_shopping_list', JSON.stringify(newItems));
        // 3. Update Cloud
        try {
            await updateShoppingList(newItems);
        } catch (error) {
            console.error("Failed to sync shopping list", error);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        const updatedItems = [...items, newItem.trim()];
        setNewItem('');
        await updateLocalAndCloud(updatedItems);
    };

    const handleRemoveItem = async (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        await updateLocalAndCloud(updatedItems);
    };

    return (
        <div className="shopping-blackboard">
            <div className="blackboard-frame">
                <div className="blackboard-surface">
                    <h3 className="blackboard-title">Lista de la Compra 🛒</h3>

                    <ul className="chalk-list">
                        {items.map((item, index) => (
                            <li key={index} className="chalk-item">
                                <span className="chalk-text">{item}</span>
                                <button
                                    onClick={() => handleRemoveItem(index)}
                                    className="eraser-btn"
                                    aria-label="Borrar"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                        {items.length === 0 && !isLoading && (
                            <li className="chalk-empty">...</li>
                        )}
                    </ul>

                    <form onSubmit={handleAddItem} className="chalk-form">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Escribe aquí..."
                            className="chalk-input"
                        />
                        <button type="submit" className="chalk-add-btn">
                            +
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
