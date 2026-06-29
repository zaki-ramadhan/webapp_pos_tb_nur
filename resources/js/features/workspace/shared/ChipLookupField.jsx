import { useRef } from 'react';

import { CloseIcon, LoadingIcon, SearchIcon } from '@/features/workspace/shared/Icons';

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
    error = false,
    id,
    containerRef = null,
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
        onSearch?.();
    }

    function handleSearch() {
        if (!disabled) {
            onSearch?.();
        }
    }

    const toneClassName = error
        ? 'border-red-150 focus-within:border-error-border focus-within:shadow-input-error-focus'
        : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    return (
        <div
            ref={containerRef}
            onMouseDown={focusLookup}
            className={`group flex w-full items-center overflow-hidden rounded-md border ${toneClassName} bg-white transition-[border-color,box-shadow] duration-150 ${disabled ? 'bg-slate-100' : ''} ${heightClassName} ${className}`.trim()}
        >
            <div className={`flex min-w-0 flex-1 flex-wrap items-center gap-2 pl-1.5 pr-2 py-1.5 ${contentClassName}`.trim()}>
                {items.length ? (
                    items.map((item) => (
                        <span
                            key={item}
                            className={`inline-flex min-w-0 max-w-full items-center gap-2 rounded-md border border-border-chip-blue bg-bg-chip-blue px-2 py-1 text-sm text-text-chip-blue-dark ${chipClassName}`.trim()}
                        >
                            <span className="truncate">{item}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!disabled) {
                                        onRemove?.(item);
                                    }
                                }}
                                disabled={disabled}
                                aria-label={`Hapus ${item}`}
                                className="inline-flex h-4 w-4 shrink-0 items-center justify-center disabled:text-slate-300"
                            >
                                <CloseIcon className="h-4 w-4" />
                            </button>
                        </span>
                    ))
                ) : (
                    <span className="block truncate px-1 text-xs sm:text-sm text-disabled-border-t">{placeholder}</span>
                )}
            </div>

            <button
                ref={searchButtonRef}
                id={id}
                type="button"
                onClick={handleSearch}
                disabled={disabled}
                aria-label={searchLabel}
                className="inline-flex h-full w-11 shrink-0 items-center justify-center border-l border-ui-border-medium text-text-darkest disabled:cursor-default disabled:text-slate-300 disabled:pointer-events-none focus:outline-none"
            >
                {searching ? (
                    <LoadingIcon className="h-5 w-5 animate-spin text-text-darkest" />
                ) : (
                    <SearchIcon className="h-5 w-5 text-text-darkest" />
                )}
            </button>
        </div>
    );
}
