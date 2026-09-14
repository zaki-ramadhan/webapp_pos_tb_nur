import { useEffect, useMemo, useRef, useState } from 'react';
import {
    createBackendResource,
    extractBackendRows,
    getBackendErrorMessage,
    listBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { showCrudErrorToast, showCrudSuccessToast } from '@/features/workspace/shared/crudFeedback';

export function buildAccountLookupLabel(record, resource = null) {
    if (typeof record === 'string') {
        return record;
    }
    if (record?.document_number) {
        return record.document_number;
    }
    const code = String(record?.code ?? record?.employee_code ?? '').trim();
    const name = String(record?.name ?? record?.full_name ?? '').trim();

    if (resource === 'units' || resource === 'product-categories') {
        return name || code;
    }

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

export const ACCOUNT_TYPE_TRANSLATIONS = {
    'Cash/Bank': 'Kas dan Bank',
    'Fixed Asset': 'Aset Tetap',
    'Accumulated Depreciation': 'Akumulasi Penyusutan',
    'Expense': 'Beban',
    'Receivable': 'Piutang Usaha',
    'Payable': 'Utang Usaha',
    'Equity': 'Modal',
    'Revenue': 'Pendapatan',
    'Cost of Sales': 'Beban Pokok Penjualan',
    'Inventory': 'Persediaan',
    'Other Current Asset': 'Aset Lancar Lainnya',
    'Other Asset': 'Aset Lainnya',
    'Other Current Liability': 'Liabilitas Jangka Pendek',
    'Long Term Liability': 'Liabilitas Jangka Panjang',
    'Other Expense': 'Beban Lainnya',
    'Other Revenue': 'Pendapatan Lainnya',
};

export function translateAccountType(type) {
    if (!type) return '';
    return ACCOUNT_TYPE_TRANSLATIONS[type] ?? type;
}

export function buildAccountLookupMeta(record) {
    const rawType = String(record?.account_type ?? '').trim();
    const type = translateAccountType(rawType);
    const notes = String(record?.notes ?? record?.position ?? '').trim();

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

export default function useAccountLookupController({
    value,
    values,
    disabled = false,
    queryParams = {},
    resource = 'accounts',
    onBeforeOpen = null,
    filterRows = null,
    allowQuickCreate = ['customers', 'suppliers'].includes(resource),
}) {
    const selectedLabels = useMemo(() => normalizeSelectedLabels({ value, values }), [value, values]);
    const selectedValue = selectedLabels[0] ?? '';
    const rootRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [draftValue, setDraftValue] = useState(selectedValue);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);
    const lastFetchKeyRef = useRef(null);
    const filterRowsRef = useRef(filterRows);

    useEffect(() => {
        filterRowsRef.current = filterRows;
    });

    useEffect(() => {
        if (!open) {
            setDraftValue('');
            lastFetchKeyRef.current = null;
            setRows([]);
        }
    }, [open, selectedValue]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function handlePointerDown(event) {
            const target = event.target;

            if (rootRef.current?.contains(target) || (target instanceof HTMLElement && target.closest('[data-portal-dropdown]'))) {
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

    const queryParamsStr = JSON.stringify(queryParams);

    useEffect(() => {
        if (!open) {
            return;
        }

        const fetchKey = query.trim();
        const fetchParamsKey = `${fetchKey}_${queryParamsStr}`;

        if (lastFetchKeyRef.current === fetchParamsKey && rows.length > 0) {
            return;
        }

        setLoading(true);
        setError('');

        let ignore = false;
        const timeoutId = window.setTimeout(async () => {
            try {
                const payload = await listBackendResource(resource, {
                    search: fetchKey,
                    per_page: resource === 'accounts' ? 300 : resource === 'product-categories' ? 250 : 15,
                    ...queryParams,
                });

                if (!ignore) {
                    lastFetchKeyRef.current = fetchParamsKey;
                    let extracted = extractBackendRows(payload);
                    if (typeof filterRowsRef.current === 'function') {
                        extracted = extracted.filter(filterRowsRef.current);
                    }
                    setRows(extracted);
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
    }, [open, query, queryParamsStr]);

    function openLookup(nextQuery = '') {
        if (disabled) {
            return;
        }

        if (onBeforeOpen && onBeforeOpen() === false) {
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

        if (typeof nextValue === 'string' ? nextValue.length > 0 : Boolean(nextValue)) {
            openLookup(nextValue);
            return;
        }

        setOpen(false);
        setQuery('');
        setError('');
        setRows([]);
    }

    function handleSelect(record, label, onSelectAccount) {
        const cleanLabel = typeof label === 'string' ? label.trim() : label;
        setDraftValue(cleanLabel);
        setOpen(false);
        setQuery('');
        setError('');
        onSelectAccount?.(record, cleanLabel);
    }

    function handleRemove(onRemove) {
        setDraftValue('');
        setQuery('');
        setRows([]);
        onRemove?.();
    }

    async function handleQuickCreate(keyword, onSelectCallback) {
        const rawTrimmed = String(keyword ?? query ?? '').trim();
        if (!rawTrimmed || isCreating) return null;

        const lowerTrimmed = rawTrimmed.toLowerCase();
        const existing = rows.find((r) => {
            const name = String(r?.name ?? r?.label ?? '').trim().toLowerCase();
            return name === lowerTrimmed;
        });

        const entityLabel = resource === 'customers' ? 'Pelanggan' : (resource === 'suppliers' ? 'Pemasok' : (resource === 'units' ? 'Satuan' : 'Data'));

        if (existing) {
            const label = buildAccountLookupLabel(existing, resource);
            handleSelect(existing, label, onSelectCallback);
            showCrudSuccessToast(`${entityLabel} "${existing.name || rawTrimmed}" dipilih.`);
            return existing;
        }

        setIsCreating(true);
        try {
            const payload = {
                name: rawTrimmed,
                is_active: true,
            };
            const result = await createBackendResource(resource, payload);
            const newRecord = result?.data ?? result;
            if (newRecord && newRecord.id) {
                const label = buildAccountLookupLabel(newRecord, resource) || newRecord.name || rawTrimmed;
                const formattedRecord = {
                    ...newRecord,
                    id: newRecord.id,
                    name: newRecord.name ?? label,
                    label: label,
                };
                setRows((prev) => {
                    const exists = prev.some((it) => String(it.id) === String(newRecord.id));
                    return exists ? prev : [...prev, formattedRecord];
                });
                handleSelect(formattedRecord, label, onSelectCallback);
                showCrudSuccessToast(`${entityLabel} "${newRecord.name ?? rawTrimmed}" berhasil ditambahkan.`);
                return formattedRecord;
            }
        } catch (err) {
            const status = err?.response?.status;
            if (status === 422) {
                try {
                    const searchRes = await listBackendResource(resource, { search: rawTrimmed, _refresh: Date.now() });
                    const searchRows = extractBackendRows(searchRes);
                    const matched = searchRows.find((r) => String(r.name ?? '').trim().toLowerCase() === lowerTrimmed);
                    if (matched) {
                        const label = buildAccountLookupLabel(matched, resource) || matched.name || rawTrimmed;
                        const formatted = { ...matched, label };
                        setRows((prev) => {
                            const exists = prev.some((it) => String(it.id) === String(matched.id));
                            return exists ? prev : [...prev, formatted];
                        });
                        handleSelect(formatted, label, onSelectCallback);
                        showCrudSuccessToast(`${entityLabel} "${matched.name || rawTrimmed}" dipilih.`);
                        return formatted;
                    }
                } catch (fallbackErr) {
                    // Ignore fallback error
                }
            }
            showCrudErrorToast(getBackendErrorMessage(err, `Gagal menambahkan ${entityLabel.toLowerCase()}.`));
        } finally {
            setIsCreating(false);
        }
        return null;
    }

    return {
        draftValue,
        error,
        loading,
        isCreating,
        allowQuickCreate,
        open,
        query,
        rootRef,
        rows,
        selectedLabels,
        selectedValue,
        closeLookup,
        handleInputChange,
        handleInputFocus,
        handleQuickCreate,
        handleRemove,
        handleSelect,
        openLookup,
        setQuery,
    };
}
