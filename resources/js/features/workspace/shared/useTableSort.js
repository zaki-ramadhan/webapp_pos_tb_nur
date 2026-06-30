import { useCallback, useMemo, useState } from 'react';

/**
 * Shared sort logic for all data listing tables.
 * Returns sortedRows, sortKey, sortDir, and handleSort.
 */
export default function useTableSort(rows) {
    const [sortState, setSortState] = useState({ key: null, dir: 'asc' });

    const handleSort = useCallback((columnId) => {
        setSortState((prev) => {
            if (prev.key === columnId) {
                return {
                    key: columnId,
                    dir: prev.dir === 'asc' ? 'desc' : 'asc',
                };
            }
            return {
                key: columnId,
                dir: 'asc',
            };
        });
    }, []);

    const sortedRows = useMemo(() => {
        if (!sortState.key) return rows;
        return [...rows].sort((a, b) => {
            const aVal = a[sortState.key] ?? '';
            const bVal = b[sortState.key] ?? '';
            const aNum = Number(aVal);
            const bNum = Number(bVal);
            const isNumeric = !Number.isNaN(aNum) && !Number.isNaN(bNum);
            const cmp = isNumeric ? aNum - bNum : String(aVal).localeCompare(String(bVal), 'id');
            return sortState.dir === 'asc' ? cmp : -cmp;
        });
    }, [rows, sortState]);

    return {
        sortedRows,
        sortKey: sortState.key,
        sortDir: sortState.dir,
        handleSort,
    };
}
