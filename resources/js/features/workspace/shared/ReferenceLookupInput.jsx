import { useEffect, useMemo, useRef, useState } from 'react';

import { CloseIcon, LoadingIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { LookupDropdownSurface, LookupEmptyState } from '@/features/workspace/shared/LookupPrimitives';
import { useFormError } from '@/components/ui/FormErrorContext';

function buildNormalizedSearchValue(value) {
    return String(value ?? '').trim().toLowerCase();
}

export default function ReferenceLookupInput({
    id,
    name,
    error = '',
    message = '',
    value = '',
    values = null,
    items = [],
    placeholder = 'Cari/Pilih...',
    searchLabel = 'Cari data referensi',
    disabled = false,
    searching = false,
    className = '',
    inputClassName = '',
    menuClassName = '',
    getOptionLabel = (option) => option?.label ?? '',
    getOptionSearchText = (option) => getOptionLabel(option),
    renderOption = null,
    onSelect = null,
    onClear = null,
    onRemove = null,
    emptyTitle = 'Data tidak ditemukan',
    emptyDescription = 'Coba kata kunci lain.',
}) {
    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, name, id);
    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);
    const rootRef = useRef(null);
    const inputRef = useRef(null);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const multiValueMode = Array.isArray(values);
    const selectedLabels = useMemo(() => {
        if (multiValueMode) {
            return values.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
        }

        const selectedLabel = String(value ?? '').trim();

        return selectedLabel ? [selectedLabel] : [];
    }, [multiValueMode, value, values]);
    const selectedLabel = selectedLabels[0] ?? '';
    const selectedLabelSet = useMemo(() => new Set(selectedLabels), [selectedLabels]);

    useEffect(() => {
        setQuery('');
    }, [selectedLabel, selectedLabels]);

    useEffect(() => {
        function handleOutsideClick(event) {
            const target = event.target;
            if (rootRef.current && !rootRef.current.contains(target)) {
                if (target instanceof HTMLElement && target.closest('[data-portal-dropdown]')) {
                    return;
                }
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const filteredItems = useMemo(() => {
        const normalizedQuery = buildNormalizedSearchValue(query);

        if (!normalizedQuery) {
            return items.filter((item) => {
                const optionLabel = String(getOptionLabel(item) ?? '').trim();

                if (multiValueMode && optionLabel && selectedLabelSet.has(optionLabel)) {
                    return false;
                }

                return true;
            });
        }

        return items.filter((item) => {
            const optionLabel = String(getOptionLabel(item) ?? '').trim();

            if (multiValueMode && optionLabel && selectedLabelSet.has(optionLabel)) {
                return false;
            }

            return buildNormalizedSearchValue(getOptionSearchText(item)).includes(normalizedQuery);
        });
    }, [getOptionLabel, getOptionSearchText, items, multiValueMode, query, selectedLabelSet]);

    const showMenu = !disabled && open && (!selectedLabel || multiValueMode);

    function focusInput(event) {
        if (disabled) {
            return;
        }

        const target = event.target;

        if (
            target instanceof HTMLElement &&
            target.closest('button, a, input, select, textarea') !== null
        ) {
            return;
        }

        event.preventDefault();
        inputRef.current?.focus();
    }

    function handleChange(event) {
        const nextValue = event.target.value;
        setQuery(nextValue);
        setOpen(true);
    }

    function handleSelect(item) {
        setQuery('');
        setOpen(false);
        onSelect?.(item);
        clearError(contextKey);
    }

    function handleClear() {
        setQuery('');
        setOpen(false);
        onClear?.();
        clearError(contextKey);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }

    function handleRemove(item) {
        onRemove?.(item);
        clearError(contextKey);
        inputRef.current?.focus();
    }

    const toneClassName = resolvedError
        ? 'border-red-150 focus-within:border-error-border focus-within:shadow-input-error-focus'
        : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    return (
        <div ref={rootRef} className={`relative w-full ${className}`.trim()}>
            <div
                onMouseDown={focusInput}
                className={`group flex w-full items-center overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabled ? 'bg-slate-100 cursor-default' : 'cursor-text'}`.trim()}
            >
                <div className="flex min-w-0 flex-1 items-center gap-2 pl-1.5 pr-2 py-1.5">
                    {selectedLabels.length ? (
                        selectedLabels.map((item) => (
                            <span
                                key={item}
                                className="inline-flex max-w-full shrink-0 items-center gap-2 rounded-md border border-border-chip-blue bg-bg-chip-blue px-2 py-1 text-sm text-text-chip-blue-dark"
                            >
                                <span className="truncate">{item}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (multiValueMode) {
                                            handleRemove(item);
                                            return;
                                        }

                                        handleClear();
                                    }}
                                    disabled={disabled}
                                    aria-label={`Hapus ${item}`}
                                    className="inline-flex h-4 w-4 shrink-0 items-center justify-center disabled:text-slate-300"
                                >
                                    <CloseIcon className="h-4 w-4" />
                                </button>
                            </span>
                        ))
                    ) : null}

                    {!multiValueMode && selectedLabel ? null : (
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            disabled={disabled}
                            placeholder={selectedLabel ? '' : placeholder}
                            onFocus={() => {
                                setOpen(true);
                            }}
                            onChange={handleChange}
                            aria-label={searchLabel}
                            className={`h-[28px] min-w-[72px] flex-1 bg-transparent px-1 text-xs sm:text-sm text-brand-dark outline-none placeholder:text-disabled-border-t disabled:cursor-default disabled:text-slate-400 ${inputClassName}`.trim()}
                        />
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => inputRef.current?.focus()}
                    disabled={disabled}
                    aria-label={searchLabel}
                    className="inline-flex h-full w-11 shrink-0 items-center justify-center border-l border-ui-border-medium text-text-darkest disabled:text-slate-300 focus:outline-none"
                >
                    {searching ? (
                        <LoadingIcon className="h-5 w-5 animate-spin" />
                    ) : (
                        <SearchIcon className="h-5 w-5" />
                    )}
                </button>
            </div>

            {showMenu ? (
                <LookupDropdownSurface className={menuClassName} anchorRef={rootRef}>
                    {searching ? (
                        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                            <LoadingIcon className="h-6 w-6 animate-spin text-slate-500 mb-2" />
                            <div className="text-xs sm:text-sm font-medium text-slate-500">Mencari data...</div>
                        </div>
                    ) : filteredItems.length ? (
                        <div className="max-h-[260px] overflow-y-auto flex-1 min-h-0">
                            {filteredItems.map((item) => (
                                <button
                                    key={item.id ?? getOptionLabel(item)}
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className="flex w-full items-start gap-3 border-b border-slate-200 px-3 py-3 text-left transition last:border-b-0 odd:bg-white even:bg-[#fafbfc] hover:!bg-ui-bg-hover"
                                >
                                    {renderOption ? (
                                        renderOption(item)
                                    ) : (
                                        <div className="min-w-0">
                                            <div className="truncate text-xs sm:text-sm font-normal text-text-workspace-dark">{getOptionLabel(item)}</div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <LookupEmptyState title={emptyTitle} description={emptyDescription} />
                    )}
                </LookupDropdownSurface>
            ) : null}
            {feedbackMessage ? (
                <p className="mt-1.5 text-[11px] sm:text-xs leading-5 text-error-border">
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
