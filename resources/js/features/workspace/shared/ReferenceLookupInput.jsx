import { useEffect, useMemo, useRef, useState } from 'react';

import { CloseIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { LookupDropdownSurface, LookupEmptyState } from '@/features/workspace/shared/LookupPrimitives';

function buildNormalizedSearchValue(value) {
    return String(value ?? '').trim().toLowerCase();
}

export default function ReferenceLookupInput({
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
            if (rootRef.current && !rootRef.current.contains(event.target)) {
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

    const showMenu = !disabled && open;

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
    }

    function handleClear() {
        setQuery('');
        setOpen(false);
        onClear?.();
        inputRef.current?.focus();
    }

    function handleRemove(item) {
        onRemove?.(item);
        inputRef.current?.focus();
    }

    return (
        <div ref={rootRef} className={`relative w-full ${className}`.trim()}>
            <div
                onMouseDown={focusInput}
                className={`group flex w-full items-center overflow-hidden rounded-[4px] border border-[#cfd6e2] bg-white transition-[border-color,box-shadow] duration-150 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)] ${disabled ? 'bg-slate-100' : ''}`.trim()}
            >
                <div className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5">
                    {selectedLabels.length ? (
                        selectedLabels.map((item) => (
                            <span
                                key={item}
                                className="inline-flex max-w-full shrink-0 items-center gap-2 rounded-[4px] border border-[#8ab2ea] bg-[#eef5ff] px-2 py-1 text-[14px] text-[#295089]"
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
                        className={`h-[28px] min-w-[72px] flex-1 bg-transparent px-1 text-[15px] text-[#1f2436] outline-none placeholder:text-[#a1a8b7] disabled:cursor-default disabled:text-slate-400 ${inputClassName}`.trim()}
                    />
                </div>

                <button
                    type="button"
                    onClick={() => inputRef.current?.focus()}
                    disabled={disabled}
                    aria-label={searchLabel}
                    className="inline-flex h-full w-11 shrink-0 items-center justify-center border-l border-[#d8dde7] text-[#111827] disabled:text-slate-300"
                >
                    {searching ? (
                        <RefreshIcon className="h-5 w-5 animate-spin" />
                    ) : (
                        <SearchIcon className="h-5 w-5" />
                    )}
                </button>
            </div>

            {showMenu ? (
                <LookupDropdownSurface className={menuClassName}>
                    {filteredItems.length ? (
                        <div className="max-h-[260px] overflow-y-auto">
                            {filteredItems.map((item) => (
                                <button
                                    key={item.id ?? getOptionLabel(item)}
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className="flex w-full items-start gap-3 border-b border-[#e6ebf2] px-3 py-3 text-left transition last:border-b-0 hover:bg-[#f8fbff]"
                                >
                                    {renderOption ? (
                                        renderOption(item)
                                    ) : (
                                        <div className="min-w-0">
                                            <div className="truncate text-[17px] text-[#131a28]">{getOptionLabel(item)}</div>
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
        </div>
    );
}
