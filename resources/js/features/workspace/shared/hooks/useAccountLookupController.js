import { useEffect, useMemo, useRef, useState } from 'react';
import {
    extractBackendRows,
    getBackendErrorMessage,
    listBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';

export function buildAccountLookupLabel(record) {
    const code = String(record?.code ?? '').trim();
    const name = String(record?.name ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

export function buildAccountLookupMeta(record) {
    const type = String(record?.account_type ?? '').trim();
    const notes = String(record?.notes ?? '').trim();

    return [type, notes].filter(Boolean).join(' • ');
}

export function normalizeSelectedLabels({ value, values }) {
    if (Array.isArray(values)) {
        return values.filter(Boolean).map(String);
    }

    if (value) {
        return [String(value)];
    }

    return [];
}

export default function useAccountLookupController({ value, values, disabled = false }) {
    const selectedLabels = useMemo(() => normalizeSelectedLabels({ value, values }), [value, values]);
    const selectedValue = selectedLabels[0] ?? '';
    const rootRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [draftValue, setDraftValue] = useState(selectedValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (!open) {
            setDraftValue('');
        }
    }, [open, selectedValue]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function handlePointerDown(event) {
            const target = event.target;

            if (rootRef.current?.contains(target)) {
                return;
            }

            setOpen(false);
            setQuery('');
            setError('');
            setDraftValue('');
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setOpen(false);
                setQuery('');
                setError('');
                setDraftValue('');
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, selectedValue]);

    useEffect(() => {
        if (!open) {
            return;
        }

        let ignore = false;
        const timeoutId = window.setTimeout(async () => {
            setLoading(true);
            setError('');

            try {
                const payload = await listBackendResource('accounts', {
                    search: query.trim(),
                    per_page: 15,
                });

                if (!ignore) {
                    setRows(extractBackendRows(payload));
                }
            } catch (lookupError) {
                if (!ignore) {
                    setRows([]);
                    setError(getBackendErrorMessage(lookupError, 'Data akun perkiraan tidak dapat dimuat.'));
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }, 200);

        return () => {
            ignore = true;
            window.clearTimeout(timeoutId);
        };
    }, [open, query]);

    function openLookup(nextQuery = '') {
        if (disabled) {
            return;
        }

        setQuery(nextQuery);
        setError('');
        setOpen(true);
    }

    function closeLookup() {
        setOpen(false);
        setQuery('');
        setError('');
        setDraftValue('');
    }

    function handleInputFocus() {
        if (!disabled) {
            openLookup(draftValue);
        }
    }

    function handleInputChange(nextValue) {
        setDraftValue(nextValue);

        if (nextValue.trim()) {
            openLookup(nextValue);
            return;
        }

        setOpen(false);
        setQuery('');
        setError('');
        setRows([]);
    }

    function handleSelect(record, label, onSelectAccount) {
        setDraftValue(label);
        setOpen(false);
        setQuery('');
        setError('');
        onSelectAccount?.(record, label);
    }

    function handleRemove(onRemove) {
        setDraftValue('');
        setQuery('');
        setRows([]);
        onRemove?.();
    }

    return {
        draftValue,
        error,
        loading,
        open,
        query,
        rootRef,
        rows,
        selectedLabels,
        selectedValue,
        closeLookup,
        handleInputChange,
        handleInputFocus,
        handleRemove,
        handleSelect,
        openLookup,
        setQuery,
    };
}
