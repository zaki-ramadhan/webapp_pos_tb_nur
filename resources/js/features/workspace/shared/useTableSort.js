import { useCallback, useMemo, useState } from 'react';

/**
 * Normalisasi dan ekstraksi nilai baris berdasarkan kunci kolom.
 * Mendukung pembacaan properti camelCase, snake_case, maupun postfix Value/Label.
 */
function extractRowValue(row, key) {
    if (!row || !key) return '';

    if (row[key] !== undefined && row[key] !== null) {
        return row[key];
    }

    const valuePostfix = `${key}Value`;
    if (row[valuePostfix] !== undefined && row[valuePostfix] !== null) {
        return row[valuePostfix];
    }

    const labelPostfix = `${key}Label`;
    if (row[labelPostfix] !== undefined && row[labelPostfix] !== null) {
        return row[labelPostfix];
    }

    // Coba konversi camelCase ke snake_case (misal documentNumber -> document_number)
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (row[snakeKey] !== undefined && row[snakeKey] !== null) {
        return row[snakeKey];
    }

    // Coba konversi snake_case ke camelCase (misal document_number -> documentNumber)
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    if (row[camelKey] !== undefined && row[camelKey] !== null) {
        return row[camelKey];
    }

    return '';
}

/**
 * Mencoba mengekstrak angka dari nilai (termasuk format mata uang Rupiah dan persentase).
 */
function tryParseNumber(val) {
    if (typeof val === 'number') {
        return Number.isFinite(val) ? val : NaN;
    }
    if (typeof val === 'boolean') {
        return val ? 1 : 0;
    }
    if (typeof val !== 'string') {
        return NaN;
    }

    const trimmed = val.trim();
    if (!trimmed) return NaN;

    // Bersihkan prefix Rp, tanda %, dan spasi
    const stripped = trimmed.replace(/^Rp\.?\s*/i, '').replace(/\s*\%$/, '').trim();

    // Jika pola adalah angka dengan titik/koma
    if (/^[+-]?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?$/.test(stripped)) {
        // Format Indonesia: 1.500.000,50 -> 1500000.50
        const normalized = stripped.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(normalized);
        return Number.isFinite(num) ? num : NaN;
    }

    if (/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(stripped)) {
        // Format Standar/US: 1,500,000.50 -> 1500000.50
        const normalized = stripped.replace(/,/g, '');
        const num = parseFloat(normalized);
        return Number.isFinite(num) ? num : NaN;
    }

    const direct = Number(stripped);
    return Number.isFinite(direct) ? direct : NaN;
}

/**
 * Mencoba mengonversi tanggal (ISO YYYY-MM-DD, Indonesia DD/MM/YYYY, atau tanggal berformat).
 */
function tryParseDate(val) {
    if (val instanceof Date) {
        return val.getTime();
    }
    if (typeof val !== 'string') {
        return NaN;
    }

    const trimmed = val.trim();
    if (!trimmed) return NaN;

    // Format DD/MM/YYYY atau DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (dmyMatch) {
        const [, day, month, year, h = '00', m = '00', s = '00'] = dmyMatch;
        const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
        const parsed = Date.parse(iso);
        if (!Number.isNaN(parsed)) return parsed;
    }

    // Format ISO atau format yang didukung Date.parse
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? NaN : parsed;
}

/**
 * Fungsi sorting murni untuk mengurutkan array baris data.
 */
export function sortRows(rows, sortKey, sortDir = 'asc') {
    if (!sortKey || !Array.isArray(rows) || rows.length <= 1) {
        return rows ?? [];
    }

    const dirMultiplier = String(sortDir).toLowerCase() === 'desc' ? -1 : 1;

    return [...rows].sort((a, b) => {
        const rawA = extractRowValue(a, sortKey);
        const rawB = extractRowValue(b, sortKey);

        // Baris kosong diletakkan di bagian paling akhir
        const isEmptyA = rawA === '' || rawA === null || rawA === undefined;
        const isEmptyB = rawB === '' || rawB === null || rawB === undefined;
        if (isEmptyA && !isEmptyB) return 1;
        if (!isEmptyA && isEmptyB) return -1;
        if (isEmptyA && isEmptyB) return 0;

        // 1. Coba perbandingan numerik
        const numA = tryParseNumber(rawA);
        const numB = tryParseNumber(rawB);
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
            return (numA - numB) * dirMultiplier;
        }

        // 2. Coba perbandingan tanggal
        const dateA = tryParseDate(rawA);
        const dateB = tryParseDate(rawB);
        if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) {
            return (dateA - dateB) * dirMultiplier;
        }

        // 3. Fallback perbandingan teks alami
        const strA = typeof rawA === 'object' ? JSON.stringify(rawA) : String(rawA);
        const strB = typeof rawB === 'object' ? JSON.stringify(rawB) : String(rawB);
        const cmp = strA.localeCompare(strB, 'id', { numeric: true, sensitivity: 'base' });

        return cmp * dirMultiplier;
    });
}

/**
 * Shared sort logic for all data listing tables.
 * Returns sortedRows, sortKey, sortDir, and handleSort.
 */
export default function useTableSort(rows, initialKey = null, initialDir = 'asc') {
    const [sortState, setSortState] = useState({ key: initialKey, dir: initialDir });

    const handleSort = useCallback((columnId, forceDir = null) => {
        setSortState((prev) => {
            if (forceDir) {
                return { key: columnId, dir: forceDir };
            }
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
        return sortRows(rows, sortState.key, sortState.dir);
    }, [rows, sortState.key, sortState.dir]);

    return {
        sortedRows,
        sortKey: sortState.key,
        sortDir: sortState.dir,
        handleSort,
        setSortState,
    };
}
