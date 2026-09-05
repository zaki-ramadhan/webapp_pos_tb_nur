import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormError } from '@/components/ui/FormErrorContext';
import { CloseIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { INDONESIAN_CITIES } from '@/features/workspace/shared/indonesianCities';
import { HighlightText, LookupDropdownSurface } from '@/features/workspace/shared/LookupPrimitives';

export default function CityAutocompleteInput({
    id,
    value = '',
    onChange,
    onSelectCity,
    prefix = 'Kota',
    placeholder = 'Cari Kota / Kabupaten...',
    disabled = false,
    error,
    message,
    className = 'h-[40px] rounded-[4px] border-ui-border',
    prefixClassName = 'min-w-[62px] border-ui-border bg-input-prefix-bg px-3 text-xs sm:text-sm text-input-prefix-text',
    inputClassName = 'text-xs sm:text-sm text-brand-dark',
    dropdownLeftOffsetClassName = 'left-[62px]',
    ...props
}) {
    const [open, setOpen] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    // selectedCity: nilai yang sudah di-commit lewat dropdown (tampil sebagai chip)
    const [selectedCity, setSelectedCity] = useState(value || '');
    const inputRef = useRef(null);
    const rootRef = useRef(null);
    const isSelectingRef = useRef(false);
    const isFocusedRef = useRef(false);

    // Sync prop value ke selectedCity saat nilai berubah dari luar (mis. autofill dari parent)
    useEffect(() => {
        if (!isFocusedRef.current) {
            setSelectedCity(value || '');
            if (!value) setSearchVal('');
        }
    }, [value]);

    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, props.name, id);
    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);

    const isNonInteractive = disabled;
    const toneClassName = resolvedError
        ? isNonInteractive
            ? 'border-red-150'
            : 'border-red-150 focus-within:border-error-border focus-within:shadow-input-error-focus'
        : isNonInteractive
            ? 'border-slate-400'
            : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';
    const disabledClassName = isNonInteractive ? 'bg-ui-bg-panel text-gray-500' : 'bg-white';

    const filteredOptions = useMemo(() => {
        const normalized = String(searchVal ?? '').trim().toLowerCase();
        if (!normalized) {
            return INDONESIAN_CITIES.slice(0, 50);
        }
        return INDONESIAN_CITIES
            .filter(
                (item) =>
                    item.city.toLowerCase().includes(normalized) ||
                    item.province.toLowerCase().includes(normalized)
            )
            .slice(0, 50);
    }, [searchVal]);

    const handleSelect = (item) => {
        isSelectingRef.current = true;
        onSelectCity?.({
            ...item,
            country: item.country || 'Indonesia',
        });
        setSelectedCity(item.city);
        setSearchVal('');
        setOpen(false);
        clearError(contextKey);
        setTimeout(() => {
            isSelectingRef.current = false;
        }, 200);
    };

    const handleClear = () => {
        setSelectedCity('');
        setSearchVal('');
        onSelectCity?.({ city: '', province: '', postalCode: '', country: '' });
        onChange?.('');
        setOpen(false);
        clearError(contextKey);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    function focusInputFromWrapper(event) {
        if (disabled) return;
        const target = event.target;
        if (
            target instanceof HTMLElement &&
            target.closest('input, button, a, select, textarea, [role="button"]') !== null
        ) {
            return;
        }
        inputRef.current?.focus();
    }

    const hasPrefixMinW = prefixClassName.includes('min-w-');
    const prefixMinWClass = hasPrefixMinW ? '' : 'min-w-[86px]';
    const hasPrefixPx = prefixClassName.includes('px-') || prefixClassName.includes('pl-') || prefixClassName.includes('pr-');
    const prefixPxClass = hasPrefixPx ? '' : 'px-5';

    return (
        <div ref={rootRef} className="relative w-full min-w-0">
            <div
                onMouseDown={selectedCity ? undefined : focusInputFromWrapper}
                className={`group flex h-11 w-full min-w-0 items-center overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabledClassName} ${selectedCity && !disabled ? 'cursor-default' : ''} ${className}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex h-full ${prefixMinWClass} shrink-0 items-center border-r border-slate-400 ${prefixPxClass} text-xs sm:text-sm text-input-focus transition-colors duration-150 group-focus-within:border-current ${disabled ? 'bg-ui-bg-panel text-gray-500' : ''} ${prefixClassName}`.trim()}
                    >
                        {prefix}
                    </span>
                ) : null}

                <div className={`flex flex-1 min-w-0 items-center gap-2 h-full overflow-hidden ${selectedCity ? 'pl-2 pr-1' : 'px-3'}`}>
                    {selectedCity ? (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border-chip-blue bg-bg-chip-blue px-2 py-1 text-xs sm:text-sm text-text-chip-blue-dark cursor-default">
                            <span className="truncate">{selectedCity}</span>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    aria-label="Hapus kota"
                                    className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-text-chip-blue-dark hover:text-red-600 active:text-red-800 transition-colors cursor-pointer"
                                >
                                    <CloseIcon className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </span>
                    ) : (
                        <input
                            ref={inputRef}
                            id={id}
                            type="text"
                            value={searchVal}
                            onChange={(e) => {
                                const cleanedVal = e.target.value.replace(/[^a-zA-Z\s'.-]/g, '');
                                setSearchVal(cleanedVal);
                                setOpen(true);
                                onChange?.(cleanedVal);
                            }}
                            onFocus={() => {
                                isFocusedRef.current = true;
                                setOpen(true);
                            }}
                            onBlur={(e) => {
                                isFocusedRef.current = false;
                                setTimeout(() => {
                                    if (!isSelectingRef.current) {
                                        onChange?.(searchVal);
                                    }
                                }, 150);
                            }}
                            placeholder={disabled ? '' : placeholder}
                            disabled={disabled}
                            autoComplete="off"
                            className={`h-full flex-1 min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-disabled-border-t ${disabled ? 'cursor-default bg-ui-bg-panel text-gray-500 pointer-events-none' : 'text-slate-700 cursor-text'} ${inputClassName}`.trim()}
                            {...props}
                        />
                    )}
                </div>

                {/* SearchIcon selalu tampil di kanan, baik saat chip maupun saat mengetik */}
                <div className="flex h-full items-center pr-3 pl-1 shrink-0">
                    <SearchIcon className="h-4 w-4 text-slate-400" />
                </div>
            </div>

            {feedbackMessage ? (
                <p className="mt-1.5 text-xs sm:text-sm leading-5 text-error-border">
                    {feedbackMessage}
                </p>
            ) : null}

            {open && !selectedCity && (
                <LookupDropdownSurface
                    onClose={() => setOpen(false)}
                    maxHeightLimit={220}
                    className="border-tab-view-active-border-x shadow-lg rounded-[4px]"
                    anchorRef={rootRef}
                >
                    <div className="overflow-y-auto w-full flex-1 min-h-0">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className="flex w-full flex-col px-4 py-2 text-left hover:bg-info-bg border-b border-border-row-subtle last:border-b-0"
                                >
                                    <span className="text-xs sm:text-sm font-normal text-text-workspace-dark">
                                        <HighlightText text={item.city} search={searchVal} />
                                    </span>
                                    <span className="text-[10px] sm:text-xs text-black">
                                        <HighlightText text={item.province} search={searchVal} />
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-4 text-center text-xs sm:text-sm text-brand-dark">
                                Tidak ada hasil yang cocok.
                            </div>
                        )}
                    </div>
                </LookupDropdownSurface>
            )}
        </div>
    );
}
