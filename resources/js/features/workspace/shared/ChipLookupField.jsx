import { useRef } from 'react';

import { LoadingIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { LookupChip } from '@/features/workspace/shared/LookupPrimitives';

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
    error = false,
    loading = false,
    searching = false,
    id,
    onSearch,
    contentRef = null,
    containerRef = null,
}) {
    const internalContentRef = useRef(null);
    const searchButtonRef = useRef(null);
    const resolvedContentRef = containerRef || contentRef || internalContentRef;
    const isSearching = Boolean(searching || loading);

    const items = Array.isArray(values)
        ? values.filter(Boolean)
        : value
          ? [value]
          : [];

    const handleSearch = () => {
        if (!disabled) {
            onSearch?.();
        }
    };

    function focusSearchButton(event) {
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

        searchButtonRef.current?.focus();
    }

    return (
        <div
            ref={resolvedContentRef}
            onMouseDown={focusSearchButton}
            aria-invalid={error}
            className={`flex w-full items-center overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-150 ${error ? 'border-danger focus-within:border-danger focus-within:shadow-input-error-focus' : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]'} ${disabled ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-white cursor-text'} ${heightClassName} ${className}`.trim()}
        >
            <div className={`flex min-w-0 flex-1 flex-wrap items-center gap-2 pl-1.5 pr-2 py-1.5 ${disabled ? 'cursor-default' : 'cursor-text'} ${contentClassName}`.trim()}>
                {items.length ? (
                    items.map((item) => (
                        <LookupChip
                            key={item}
                            label={item}
                            onClear={() => {
                                if (!disabled) {
                                    onRemove?.(item);
                                }
                            }}
                            disabled={disabled}
                            clearAriaLabel={`Hapus ${item}`}
                            className={chipClassName}
                        />
                    ))
                ) : (
                    <span className={`block truncate px-1 text-xs sm:text-sm ${error ? 'text-red-400' : 'text-disabled-border-t'}`.trim()}>{placeholder}</span>
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
                {isSearching ? (
                    <LoadingIcon className="h-5 w-5 animate-spin text-text-darkest" />
                ) : (
                    <SearchIcon className="h-5 w-5 text-text-darkest" />
                )}
            </button>
        </div>
    );
}
