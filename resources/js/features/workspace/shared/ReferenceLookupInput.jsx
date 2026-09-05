import { useEffect, useMemo, useRef, useState } from 'react';

import { CloseIcon, LoadingIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { HighlightText, LookupDropdownSurface, LookupEmptyState } from '@/features/workspace/shared/LookupPrimitives';
import { useFormError } from '@/components/ui/FormErrorContext';
import { sanitizeTextValue } from '@/utils/textSanitizer';

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
            return values
                .filter(Boolean)
                .map((item) => String(item).trim())
                .filter((label) => label && label !== '-');
        }

        const selectedLabel = String(value ?? '').trim();

        return (selectedLabel && selectedLabel !== '-') ? [selectedLabel] : [];
    }, [multiValueMode, values, value]);
    const selectedLabel = selectedLabels[0] ?? '';
    const selectedLabelSet = useMemo(() => new Set(selectedLabels), [selectedLabels]);

    useEffect(() => {
        setQuery('');
    }, [selectedLabel, selectedLabels]);

    useEffect(() => {
        let timer = null;
        function handleOutsideClick(event) {
            const target = event.target;
            if (target instanceof HTMLElement && !document.body.contains(target)) {
                return;
            }
            if (rootRef.current && !rootRef.current.contains(target)) {
                if (target instanceof HTMLElement && target.closest('[data-portal-dropdown]')) {
                    return;
                }
                timer = setTimeout(() => {
                    setOpen(false);
                }, 0);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            if (timer) clearTimeout(timer);
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

        inputRef.current?.focus();
    }

    function handleChange(event) {
        const nextValue = sanitizeTextValue(event.target.value);
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
        ? 'border-danger focus-within:border-danger focus-within:shadow-input-error-focus'
        : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    return (
        <div ref={rootRef} className={`relative w-full ${className}`.trim()}>
            <div
                onMouseDown={focusInput}
                aria-invalid={Boolean(resolvedError)}
                className={`group flex w-full items-center overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabled ? 'bg-slate-100 cursor-default' : 'cursor-text'}`.trim()}
            >
                {multiValueMode ? (
                    <div className={`flex min-w-0 flex-1 flex-col gap-1.5 p-1.5 ${disabled ? 'cursor-default' : 'cursor-text'}`.trim()}>
                        {selectedLabels.length ? (
                            <div className="flex flex-wrap items-center gap-2 pb-0.5">
                                {selectedLabels.map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex max-w-full shrink-0 items-center gap-2 rounded-md border border-border-chip-blue bg-bg-chip-blue px-2 py-1 text-sm text-text-chip-blue-dark"
                                    >
                                        <span className="truncate max-w-[240px]">{item}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRemove(item);
                                            }}
                                            disabled={disabled}
                                            aria-label={`Hapus ${item}`}
                                            className="inline-flex h-4 w-4 shrink-0 items-center justify-center disabled:text-slate-300 text-text-chip-blue-dark hover:text-red-600 active:text-red-800 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                                        >
                                            <CloseIcon className="h-4 w-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : null}

                        <div className="flex items-center w-full min-w-0 pt-0.5">
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                disabled={disabled}
                                placeholder={placeholder}
                                onFocus={() => {
                                    setOpen(true);
                                }}
                                onChange={handleChange}
                                aria-label={searchLabel}
                                className={`h-[24px] min-w-[72px] flex-1 bg-transparent px-1 text-xs sm:text-sm text-brand-dark outline-none placeholder:text-disabled-border-t cursor-text disabled:cursor-default disabled:text-slate-400 ${inputClassName}`.trim()}
                            />
                            <button
                                type="button"
                                onClick={() => inputRef.current?.focus()}
                                disabled={disabled}
                                aria-label={searchLabel}
                                className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-slate-600 hover:text-slate-800 disabled:text-slate-300 focus:outline-none cursor-pointer"
                            >
                                {searching ? (
                                    <LoadingIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                    <SearchIcon className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={`flex min-w-0 flex-1 items-center gap-2 pl-1.5 pr-2 py-1.5 ${disabled ? 'cursor-default' : 'cursor-text'}`.trim()}>
                            {selectedLabels.length ? (
                                selectedLabels.map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex max-w-full shrink-0 items-center gap-2 rounded-md border border-border-chip-blue bg-bg-chip-blue px-2 py-1 text-sm text-text-chip-blue-dark"
                                    >
                                        <span className="truncate">{item}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleClear();
                                            }}
                                            disabled={disabled}
                                            aria-label={`Hapus ${item}`}
                                            className="inline-flex h-4 w-4 shrink-0 items-center justify-center disabled:text-slate-300 text-text-chip-blue-dark hover:text-red-600 active:text-red-800 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                                        >
                                            <CloseIcon className="h-4 w-4" />
                                        </button>
                                    </span>
                                ))
                            ) : (
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
                                    className={`h-[28px] min-w-[72px] flex-1 bg-transparent px-1 text-xs sm:text-sm text-brand-dark outline-none placeholder:text-disabled-border-t cursor-text disabled:cursor-default disabled:text-slate-400 ${inputClassName}`.trim()}
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
                    </>
                )}
            </div>

            {showMenu ? (
                <LookupDropdownSurface className={menuClassName} anchorRef={rootRef}>
                    {searching ? (
                        <div className="p-4 text-center text-xs sm:text-sm text-text-workspace-dark font-normal">
                            Memuat data...
                        </div>
                    ) : filteredItems.length ? (
                        <div className="max-h-[260px] overflow-y-auto flex-1 min-h-0">
                            {filteredItems.map((item) => (
                                <button
                                    key={item.id ?? getOptionLabel(item)}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(item);
                                    }}
                                    className="flex w-full items-start gap-3 border-b border-slate-200 px-3 py-3 text-left transition last:border-b-0 odd:bg-white even:bg-[#F8F8F8] hover:!bg-ui-bg-hover"
                                >
                                    {renderOption ? (
                                        renderOption(item)
                                    ) : (
                                        <div className="min-w-0">
                                            <div className="truncate text-xs sm:text-sm font-normal text-text-workspace-dark">
                                                <HighlightText text={getOptionLabel(item)} search={query} />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <LookupEmptyState title={emptyTitle} />
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
