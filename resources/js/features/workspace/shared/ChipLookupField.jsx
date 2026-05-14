import { useRef } from 'react';

import { CloseIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';

export default function ChipLookupField({
    value = '',
    values = null,
    placeholder = '',
    searchLabel = 'Cari',
    onRemove = null,
    className = '',
    contentClassName = '',
    chipClassName = '',
    heightClassName = 'h-[40px]',
    disabled = false,
    onSearch = null,
    searching = false,
}) {
    const searchButtonRef = useRef(null);
    const items = Array.isArray(values) ? values.filter(Boolean) : value ? [value] : [];

    function focusLookup(event) {
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
        searchButtonRef.current?.focus();
    }

    function handleSearch() {
        if (!disabled) {
            onSearch?.();
        }
    }

    return (
        <div
            onMouseDown={focusLookup}
            className={`group flex w-full items-center overflow-hidden rounded-[4px] border border-[#cfd6e2] bg-white transition-[border-color,box-shadow] duration-150 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)] ${disabled ? 'bg-slate-100' : ''} ${heightClassName} ${className}`.trim()}
        >
            <div className={`flex min-w-0 flex-1 flex-wrap items-center gap-2 px-2 py-1.5 ${contentClassName}`.trim()}>
                {items.length ? (
                    items.map((item) => (
                        <span
                            key={item}
                            className={`inline-flex max-w-full items-center gap-2 rounded-[4px] border border-[#8ab2ea] bg-[#eef5ff] px-2 py-1 text-[14px] text-[#295089] ${chipClassName}`.trim()}
                        >
                            <span className="truncate">{item}</span>
                            <button
                                type="button"
                                onClick={() => onRemove?.(item)}
                                aria-label={`Hapus ${item}`}
                                className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
                            >
                                <CloseIcon className="h-4 w-4" />
                            </button>
                        </span>
                    ))
                ) : (
                    <span className="block truncate px-1 text-[15px] text-[#a1a8b7]">{placeholder}</span>
                )}
            </div>

            <button
                ref={searchButtonRef}
                type="button"
                onClick={handleSearch}
                disabled={disabled}
                aria-label={searchLabel}
                className="inline-flex h-full w-11 shrink-0 items-center justify-center border-l border-[#d8dde7] text-[#111827] disabled:cursor-not-allowed disabled:text-slate-300"
            >
                {searching ? (
                    <RefreshIcon className="h-5 w-5 animate-spin text-[#111827]" />
                ) : (
                    <SearchIcon className="h-5 w-5 text-[#111827]" />
                )}
            </button>
        </div>
    );
}
