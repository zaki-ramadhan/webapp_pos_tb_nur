import { useEffect, useMemo, useRef, useState } from 'react';

import Panel from '@/components/ui/Panel';
import TextInput from '@/components/ui/TextInput';
import {
    extractBackendRows,
    getBackendErrorMessage,
    listBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { CloseIcon, InfoIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';

export function buildAccountLookupLabel(record) {
    const code = String(record?.code ?? '').trim();
    const name = String(record?.name ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

function buildAccountLookupMeta(record) {
    const type = String(record?.account_type ?? '').trim();
    const notes = String(record?.notes ?? '').trim();

    return [type, notes].filter(Boolean).join(' • ');
}

function normalizeSelectedLabels({ value, values }) {
    if (Array.isArray(values)) {
        return values.filter(Boolean).map(String);
    }

    if (value) {
        return [String(value)];
    }

    return [];
}

function normalizeInputValue(value) {
    return String(value ?? '');
}

function useAccountLookupController({ value, values, disabled = false }) {
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
            setDraftValue(selectedValue);
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
            setDraftValue(selectedValue);
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setOpen(false);
                setQuery('');
                setError('');
                setDraftValue(selectedValue);
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
        setDraftValue(selectedValue);
    }

    function handleInputFocus() {
        if (draftValue.trim()) {
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
        closeLookup,
        handleInputChange,
        handleInputFocus,
        handleRemove,
        handleSelect,
        openLookup,
        setQuery,
    };
}

function AccountLookupSuggestions({
    open,
    query,
    loading,
    error,
    rows,
    selectedLabels,
    onSelectAccount,
    emptyLabel = 'Belum ada data akun perkiraan.',
    loadingLabel = 'Memuat akun perkiraan...',
    className = '',
    showInlineSearch = false,
    onQueryChange = null,
}) {
    const selectedLabelSet = useMemo(() => new Set(selectedLabels), [selectedLabels]);
    const emptyMessage = query.trim()
        ? 'Tidak ada akun perkiraan yang cocok.'
        : emptyLabel;

    if (!open) {
        return null;
    }

    return (
        <Panel className={`absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-[8px] border border-[#d6deea] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] ${className}`.trim()}>
            {showInlineSearch ? (
                <div className="border-b border-[#e6ebf2] p-3">
                    <TextInput
                        value={query}
                        onChange={(event) => onQueryChange?.(event.target.value)}
                        placeholder="Cari kode atau nama akun..."
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        trailing={
                            loading ? (
                                <RefreshIcon className="h-5 w-5 animate-spin text-[#1f2436]" />
                            ) : (
                                <SearchIcon className="h-5 w-5 text-[#1f2436]" />
                            )
                        }
                        className="h-[38px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[14px] text-[#1f2436]"
                        autoFocus
                    />
                </div>
            ) : null}

            <div className="max-h-[280px] overflow-y-auto bg-white">
                {loading ? (
                    <div className="px-4 py-5 text-center text-[14px] text-[#5f6779]">{loadingLabel}</div>
                ) : error ? (
                    <div className="px-4 py-5 text-center text-[14px] text-[#b43b3b]">{error}</div>
                ) : rows.length ? (
                    rows.map((record) => {
                        const label = buildAccountLookupLabel(record);
                        const selected = selectedLabelSet.has(label);
                        const meta = buildAccountLookupMeta(record);

                        return (
                            <button
                                key={record.id}
                                type="button"
                                onClick={() => onSelectAccount(record, label)}
                                className={`flex w-full items-start justify-between gap-3 border-t border-[#e6ebf2] px-4 py-3 text-left transition first:border-t-0 hover:bg-[#eef3fb] ${selected ? 'bg-[#f5f9ff]' : 'bg-white'}`.trim()}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[14px] font-medium text-[#1f2436]">{record.name ?? '-'}</span>
                                    <span className="mt-1 block truncate text-[12px] text-[#5f6779]">{record.code ?? '-'}</span>
                                    {meta ? (
                                        <span className="mt-0.5 block truncate text-[12px] text-[#8a94a8]">
                                            {meta}
                                        </span>
                                    ) : null}
                                </span>
                                <span className="shrink-0 rounded-full bg-[#eef3fb] px-2.5 py-1 text-[11px] font-medium text-[#355784]">
                                    {record.account_type ?? '-'}
                                </span>
                            </button>
                        );
                    })
                ) : (
                    <div className="px-4 py-6 text-center">
                        <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eef3fb] text-[#355784]">
                            <InfoIcon className="h-5 w-5 text-current" />
                        </div>
                        <div className="mt-3 text-[14px] font-medium text-[#4b5567]">{emptyMessage}</div>
                        {!query.trim() ? (
                            <div className="mt-1 text-[12px] text-[#8a94a8]">
                                Mulai ketik kode atau nama akun untuk melihat saran.
                            </div>
                        ) : (
                            <div className="mt-1 text-[12px] text-[#8a94a8]">
                                Coba kata kunci lain yang lebih spesifik.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Panel>
    );
}

function AccountLookupSearchInput({
    value,
    placeholder,
    searchLabel,
    disabled,
    className,
    inputClassName,
    trailingClassName,
    loading,
    onFocus,
    onChange,
    onClear,
}) {
    return (
        <TextInput
            value={value}
            onFocus={onFocus}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            trailing={
                <div className="flex items-center gap-1">
                    {value ? (
                        <button
                            type="button"
                            onClick={onClear}
                            aria-label={`Hapus ${searchLabel.toLowerCase()}`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] text-[#6b7280] transition hover:bg-[#eef3fb] hover:text-[#1f2436]"
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    ) : null}
                    {loading ? (
                        <RefreshIcon className="h-5 w-5 animate-spin text-[#1f2436]" />
                    ) : (
                        <SearchIcon className="h-5 w-5 text-[#1f2436]" />
                    )}
                </div>
            }
            className={className}
            inputClassName={inputClassName}
            trailingClassName={trailingClassName}
        />
    );
}

export function AccountLookupField({
    value = '',
    values = null,
    placeholder = 'Cari/Pilih Akun Perkiraan...',
    searchLabel = 'Cari akun perkiraan',
    dialogTitle = 'Pilih Akun Perkiraan',
    disabled = false,
    className = '',
    contentClassName = '',
    chipClassName = '',
    heightClassName = 'h-[40px]',
    onRemove = null,
    onSelectAccount = null,
}) {
    const controller = useAccountLookupController({ value, values, disabled });
    const isMultiValue = Array.isArray(values);

    return (
        <div ref={controller.rootRef} className="relative">
            {isMultiValue ? (
                <ChipLookupField
                    value={value}
                    values={values}
                    placeholder={placeholder}
                    searchLabel={searchLabel}
                    onRemove={onRemove}
                    onSearch={disabled ? null : () => controller.openLookup('')}
                    disabled={disabled}
                    className={className}
                    contentClassName={contentClassName}
                    chipClassName={chipClassName}
                    heightClassName={heightClassName}
                    searching={controller.loading && controller.open}
                />
            ) : (
                <AccountLookupSearchInput
                    value={controller.draftValue}
                    placeholder={placeholder}
                    searchLabel={searchLabel}
                    disabled={disabled}
                    className={`${heightClassName} rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName="gap-1 pr-2"
                    loading={controller.loading && controller.open}
                    onFocus={controller.handleInputFocus}
                    onChange={controller.handleInputChange}
                    onClear={() => controller.handleRemove(onRemove)}
                />
            )}

            <AccountLookupSuggestions
                open={controller.open}
                query={controller.query}
                onQueryChange={controller.setQuery}
                loading={controller.loading}
                error={controller.error}
                rows={controller.rows}
                selectedLabels={controller.selectedLabels}
                onSelectAccount={(record, label) => controller.handleSelect(record, label, onSelectAccount)}
                showInlineSearch={isMultiValue}
            />
        </div>
    );
}

export function AccountLookupTextInput({
    value = '',
    placeholder = 'Cari/Pilih Akun Perkiraan...',
    searchLabel = 'Cari akun perkiraan',
    dialogTitle = 'Pilih Akun Perkiraan',
    disabled = false,
    className = 'h-[40px] rounded-[4px] border-[#cfd6e2]',
    inputClassName = 'text-[15px] text-[#1f2436]',
    trailingClassName = '',
    onSelectAccount = null,
}) {
    const controller = useAccountLookupController({ value, disabled });

    return (
        <div ref={controller.rootRef} className="relative">
            <AccountLookupSearchInput
                value={normalizeInputValue(controller.draftValue)}
                placeholder={placeholder}
                searchLabel={searchLabel}
                disabled={disabled}
                className={className}
                inputClassName={inputClassName}
                trailingClassName={trailingClassName}
                loading={controller.loading && controller.open}
                onFocus={controller.handleInputFocus}
                onChange={controller.handleInputChange}
                onClear={() => controller.handleRemove(() => onSelectAccount?.(null, ''))}
            />

            <AccountLookupSuggestions
                open={controller.open}
                searchLabel={searchLabel}
                query={controller.query}
                loading={controller.loading}
                error={controller.error}
                rows={controller.rows}
                selectedLabels={controller.selectedLabels}
                onSelectAccount={(record, label) => controller.handleSelect(record, label, onSelectAccount)}
            />
        </div>
    );
}
