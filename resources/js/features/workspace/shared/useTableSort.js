import { useCallback, useMemo, useState } from 'react';

/**
 * Shared sort logic for all data listing tables.
 * Returns sortedRows, sortKey, sortDir, and handleSort.
 */
export default function useTableSort(rows) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const handleSort = useCallback((columnId) => {
        setSortKey((prev) => {
            if (prev === columnId) {
                setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                return columnId;
            }
            setSortDir('asc');
            return columnId;
        });
    }, []);

    const sortedRows = useMemo(() => {
        if (!sortKey) return rows;
        return [...rows].sort((a, b) => {
            const aVal = a[sortKey] ?? '';
            const bVal = b[sortKey] ?? '';
            const aNum = Number(aVal);
            const bNum = Number(bVal);
            const isNumeric = !Number.isNaN(aNum) && !Number.isNaN(bNum);
            const cmp = isNumeric ? aNum - bNum : String(aVal).localeCompare(String(bVal), 'id');
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [rows, sortKey, sortDir]);

    return { sortedRows, sortKey, sortDir, handleSort };
}
