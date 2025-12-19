'use client';

import React, { useState, useEffect, useRef } from 'react';
import { subscribeToShoppingList, updateShoppingList } from '@/services/taskService';
import './ShoppingBlackboard.css';

export default function ShoppingBlackboard() {
    const [items, setItems] = useState<string[]>([]);
    const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeToShoppingList((data) => {
            setItems(data);
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        const updatedItems = [...items, newItem.trim()];
        setItems(updatedItems); // Optimistic update
        setNewItem('');

        try {
            await updateShoppingList(updatedItems);
        } catch (error) {
            console.error("Failed to add item", error);
            // Revert? For simplicty, next snapshot will fix it
        }
    };

    const handleRemoveItem = async (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems); // Optimistic

        try {
            await updateShoppingList(updatedItems);
        } catch (error) {
            console.error("Failed to remove item", error);
        }
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
