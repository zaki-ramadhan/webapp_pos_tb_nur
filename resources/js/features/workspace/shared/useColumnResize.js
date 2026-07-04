import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'col_width_';

export function useColumnResize(schemaKey) {
    const [columnWidths, setColumnWidths] = useState({});

    useEffect(() => {
        if (!schemaKey) return;
        try {
            const cached = localStorage.getItem(`${STORAGE_PREFIX}${schemaKey}`);
            setColumnWidths(cached ? JSON.parse(cached) : {});
        } catch (e) {
            setColumnWidths({});
        }
    }, [schemaKey]);

    const handleResizeStart = useCallback((e, columnId) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const thOrTd = e.target.closest('th, td');
        if (!thOrTd) return;

        // Resolve the actual column th width from the header row for accuracy
        const table = thOrTd.closest('table');
        let startWidth = thOrTd.getBoundingClientRect().width;

        if (table) {
            const ths = table.querySelectorAll('thead th');
            const tds = thOrTd.closest('tr')?.querySelectorAll('td');
            // Find the index of the current cell
            const cells = tds ?? Array.from(ths);
            const idx = Array.from(cells).indexOf(thOrTd);
            if (idx >= 0 && ths[idx]) {
                startWidth = ths[idx].getBoundingClientRect().width;
            }
        }

        let rafId = null;

        const onMove = (moveEvent) => {
            const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                setColumnWidths((prev) => {
                    const next = { ...prev, [columnId]: newWidth };
                    try {
                        localStorage.setItem(`${STORAGE_PREFIX}${schemaKey}`, JSON.stringify(next));
                    } catch (e) {}
                    return next;
                });
            });
        };

        const onUp = () => {
            if (rafId) cancelAnimationFrame(rafId);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, [schemaKey]);

    /**
     * Returns style object for a column cell (th or td).
     */
    const getCellStyle = useCallback((columnId, baseStyle = {}) => {
        const w = columnWidths[columnId];
        if (!w) return baseStyle;
        return {
            ...baseStyle,
            width: `${w}px`,
            minWidth: `${w}px`,
            maxWidth: `${w}px`,
        };
    }, [columnWidths]);

    return { columnWidths, handleResizeStart, getCellStyle };
}
