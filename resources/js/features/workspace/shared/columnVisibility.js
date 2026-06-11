import { useEffect, useState } from 'react';

const listeners = new Set();

export function useColumnVisibility(schemaKey, initialColumns = []) {
    const [visibleIds, setVisibleIds] = useState(() => {
        if (!schemaKey) {
            return initialColumns.map(c => c.id).filter(Boolean);
        }
        const cached = localStorage.getItem(`col_vis_${schemaKey}`);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {}
        }
        return initialColumns.map(c => c.id).filter(Boolean);
    });

    useEffect(() => {
        if (!schemaKey) return;
        localStorage.setItem(`col_vis_${schemaKey}`, JSON.stringify(visibleIds));
        // Notify listeners
        listeners.forEach(listener => listener(schemaKey, visibleIds));
    }, [schemaKey, visibleIds]);

    useEffect(() => {
        if (!schemaKey) return;
        const handleUpdate = (id, nextIds) => {
            if (id === schemaKey) {
                setVisibleIds(nextIds);
            }
        };
        listeners.add(handleUpdate);
        return () => {
            listeners.delete(handleUpdate);
        };
    }, [schemaKey]);

    return [visibleIds, setVisibleIds];
}

export function getTableSchemaKey(columns = []) {
    return columns
        .map(c => c?.id || c)
        .filter(Boolean)
        .sort()
        .join('|');
}

// Global registry to link TableToolbar and DataTables dynamically
export const tableRegistry = {
    activeTable: null,
    listeners: new Set(),
    setActiveTable(columns, rows, resource) {
        this.activeTable = { columns, rows, resource };
        this.listeners.forEach(l => l(this.activeTable));
    },
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
};

export function cleanHeaderLabel(label) {
    if (typeof label !== 'string') return label;
    return label.replace(/\s*#\s*$/, '').trim();
}

export function getColumnMinWidth(label) {
    if (typeof label !== 'string' || !label) return undefined;
    return `${Math.ceil(label.length * 8.5) + 24}px`;
}

