import { useRef } from 'react';
import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { useState, useEffect, useMemo } from 'react';
import AccountLookupSearchInput from './components/AccountLookupSearchInput';
import { LookupDropdownSurface, LookupEmptyState } from './LookupPrimitives';
import { LoadingIcon } from './Icons';

function useBackendLookupController({ value = '', disabled = false, resource, queryParams = {} }) {
    const rootRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [draftValue, setDraftValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const lastFetchKeyRef = useRef(null);

    const selectedValue = value;

    useEffect(() => {
        if (!open) {
            setDraftValue('');
            lastFetchKeyRef.current = null;
            setRows([]);
        }
    }, [open, selectedValue]);

    const queryParamsStr = JSON.stringify(queryParams);

    useEffect(() => {
        if (!open) return;

        const fetchKey = query.trim();
        const fetchParamsKey = `${fetchKey}_${queryParamsStr}`;
        if (lastFetchKeyRef.current === fetchParamsKey && rows.length > 0) return;

        setLoading(true);
        let ignore = false;
        const timeoutId = window.setTimeout(async () => {
            try {
                const payload = await listBackendResource(resource, {
                    search: fetchKey,
                    per_page: 150,
                    ...queryParams,
                });
                if (!ignore) {
                    lastFetchKeyRef.current = fetchParamsKey;
                    setRows(extractBackendRows(payload));
                }
            } catch {
                if (!ignore) setRows([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        }, 200);

        return () => {
            ignore = true;
            window.clearTimeout(timeoutId);
        };
    }, [open, query, queryParamsStr]);

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event) {
            const target = event.target;
            if (
                rootRef.current?.contains(target) ||
                (target instanceof HTMLElement && target.closest('[data-portal-dropdown]'))
            ) {
                return;
            }
            setOpen(false);
            setQuery('');
            setDraftValue('');
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setOpen(false);
                setQuery('');
                setDraftValue('');
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    function handleInputFocus() {
        if (!disabled) {
            setQuery(draftValue);
            setOpen(true);
        }
    }

    function handleInputChange(nextValue) {
        setDraftValue(nextValue);
        if (nextValue.trim()) {
            setQuery(nextValue);
            setOpen(true);
        } else {
            setOpen(false);
            setQuery('');
            setRows([]);
        }
    }

    function handleSelect(record, onSelect) {
        setOpen(false);
        setQuery('');
        setDraftValue('');
        onSelect?.(record);
    }

    function handleClear(onClear) {
        setDraftValue('');
        setQuery('');
        setRows([]);
        onClear?.();
    }

    return {
        rootRef,
        open,
        draftValue,
        selectedValue,
        loading,
        rows,
        query,
        handleInputFocus,
        handleInputChange,
        handleSelect,
        handleClear,
    };
}

export default function BackendLookupTextInput({
    resource,
    value = '',
    placeholder = 'Cari/Pilih...',
    searchLabel = 'Cari data',
    getOptionLabel = (option) => option?.label ?? option?.name ?? '',
    getOptionSearchText = (option) => getOptionLabel(option),
    renderOption = null,
    queryParams = {},
    onSelect,
    onClear,
    className = '',
    disabled = false,
}) {
    const ctrl = useBackendLookupController({ value, disabled, resource, queryParams });
    const inputWrapperRef = useRef(null);

    const filteredRows = useMemo(() => {
        const q = ctrl.query.trim().toLowerCase();
        if (!q) return ctrl.rows;
        return ctrl.rows.filter((item) =>
            String(getOptionSearchText(item) ?? '').toLowerCase().includes(q)
        );
    }, [ctrl.rows, ctrl.query, getOptionSearchText]);

    return (
        <div ref={ctrl.rootRef} className="relative w-full">
            <AccountLookupSearchInput
                containerRef={inputWrapperRef}
                value={ctrl.draftValue}
                selectedValue={ctrl.selectedValue}
                placeholder={placeholder}
                searchLabel={searchLabel}
                disabled={disabled}
                className={className}
                inputClassName="text-xs sm:text-sm text-brand-dark"
                trailingClassName=""
                loading={ctrl.loading && ctrl.open}
                onFocus={ctrl.handleInputFocus}
                onChange={ctrl.handleInputChange}
                onClear={() => ctrl.handleClear(onClear)}
            />

            {!disabled && ctrl.open && (
                <LookupDropdownSurface anchorRef={inputWrapperRef}>
                    <div className="max-h-[260px] overflow-y-auto flex-1 min-h-0 bg-white">
                        {ctrl.loading ? (
                            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                                <LoadingIcon className="h-6 w-6 animate-spin text-slate-500 mb-2" />
                                <div className="text-xs sm:text-sm font-medium text-slate-500">Mencari data...</div>
                            </div>
                        ) : filteredRows.length ? (
                            filteredRows.map((item) => (
                                <button
                                    key={item.id ?? getOptionLabel(item)}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        ctrl.handleSelect(item, onSelect);
                                    }}
                                    className="flex w-full items-start gap-3 border-b border-slate-200 px-3 py-3 text-left transition last:border-b-0 odd:bg-white even:bg-[#fafbfc] hover:!bg-ui-bg-hover"
                                >
                                    {renderOption ? (
                                        renderOption(item)
                                    ) : (
                                        <div className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-normal text-brand-dark">
                                                {getOptionLabel(item)}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <LookupEmptyState
                                title={`Tidak ada data yang cocok.`}
                                description="Coba kata kunci lain."
                            />
                        )}
                    </div>
                </LookupDropdownSurface>
            )}
        </div>
    );
}
