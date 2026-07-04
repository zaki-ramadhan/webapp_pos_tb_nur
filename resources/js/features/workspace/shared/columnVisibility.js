import { useEffect, useState } from 'react';

const listeners = new Set();

export function useColumnVisibility(schemaKey, initialColumns = []) {
    const getInitialVisibleIds = () => {
        if (!schemaKey) {
            return initialColumns.filter(c => !c.defaultHidden).map(c => c.id).filter(Boolean);
        }
        const cached = localStorage.getItem(`col_vis_${schemaKey}`);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch (e) {}
        }
        return initialColumns.filter(c => !c.defaultHidden).map(c => c.id).filter(Boolean);
    };

    const [visibleIds, setVisibleIds] = useState(getInitialVisibleIds);
    const [lastSchemaKey, setLastSchemaKey] = useState(schemaKey);

    // Sinkronkan kolom jika schema berubah
    if (schemaKey !== lastSchemaKey) {
        setLastSchemaKey(schemaKey);
        setVisibleIds(getInitialVisibleIds());
    }

    useEffect(() => {
        if (!schemaKey || !visibleIds || visibleIds.length === 0) return;
        localStorage.setItem(`col_vis_${schemaKey}`, JSON.stringify(visibleIds));
        // Beritahu listener
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

// Registrasi global toolbar & tabel
export const tableRegistry = {
    activeTable: null,
    listeners: new Set(),
    lastActiveRows: {},
    setActiveTable(columns, rows, resource) {
        this.activeTable = { columns, rows, resource };
        if (resource) {
            this.lastActiveRows[resource] = rows;
        }
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

