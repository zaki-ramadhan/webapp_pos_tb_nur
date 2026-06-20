import { useMemo, useRef, useState } from 'react';
import { useFormError } from '@/components/ui/FormErrorContext';
import { CloseIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { INDONESIAN_CITIES } from '@/features/workspace/shared/indonesianCities';
import { LookupDropdownSurface } from '@/features/workspace/shared/LookupPrimitives';

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
    className = 'h-[40px] rounded-[4px] border-[#cfd6e2]',
    prefixClassName = 'min-w-[62px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-xs sm:text-sm text-[#8b94a7]',
    inputClassName = 'text-xs sm:text-sm text-[#1f2436]',
    dropdownLeftOffsetClassName = 'left-[62px]',
    ...props
}) {
    const [open, setOpen] = useState(false);
    const inputRef = useRef(null);
    const rootRef = useRef(null);

    function focusInputFromWrapper(event) {
        if (disabled) {
            return;
        }
        const target = event.target;
        if (
            target instanceof HTMLElement &&
            (target.closest('input, button, a, select, textarea, [role="button"]') !== null)
        ) {
            return;
        }
        inputRef.current?.focus();
    }

    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, props.name, id);

    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);

    const isNonInteractive = disabled;
    const toneClassName = resolvedError
        ? isNonInteractive
            ? 'border-[#e39191]'
            : 'border-[#e39191] focus-within:border-[#d65959] focus-within:shadow-[0_0_0_3px_rgba(214,89,89,0.14)]'
        : isNonInteractive
            ? 'border-slate-400'
            : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';
    const disabledClassName = isNonInteractive ? 'bg-slate-100 text-slate-400' : 'bg-white';

    const filteredOptions = useMemo(() => {
        const normalized = String(value ?? '').trim().toLowerCase();
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
    }, [value]);

    const handleSelect = (item) => {
        onSelectCity?.(item);
        setOpen(false);
        clearError(contextKey);
    };

    const handleClear = () => {
        onSelectCity?.({ city: '', province: '', postalCode: '', country: '' });
        setOpen(false);
        clearError(contextKey);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const highlightText = (text, highlight) => {
        const queryStr = String(highlight ?? '').trim();
        if (!queryStr) return <span>{text}</span>;
        const regex = new RegExp(`(${queryStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <mark key={i} className="bg-yellow-200 text-black p-0">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const hasPrefixMinW = prefixClassName.includes('min-w-');
    const prefixMinWClass = hasPrefixMinW ? '' : 'min-w-[86px]';
    const hasPrefixPx = prefixClassName.includes('px-') || prefixClassName.includes('pl-') || prefixClassName.includes('pr-');
    const prefixPxClass = hasPrefixPx ? '' : 'px-5';

    return (
        <div ref={rootRef} className="relative w-full min-w-0">
            <div
                onMouseDown={focusInputFromWrapper}
                className={`group flex h-11 w-full min-w-0 items-center overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabledClassName} ${className}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex h-full ${prefixMinWClass} items-center border-r border-slate-400 ${prefixPxClass} text-xs sm:text-sm text-[#5a84e5] transition-colors duration-150 group-focus-within:border-current ${disabled ? 'bg-slate-100 text-slate-400' : ''} ${prefixClassName}`.trim()}
                    >
                        {prefix}
                    </span>
                ) : null}

                <div className="flex flex-1 min-w-0 items-center gap-2 px-4 h-full">
                    <input
                        ref={inputRef}
                        id={id}
                        type="text"
                        value={value}
                        onChange={(e) => {
                            const cleanedVal = e.target.value.replace(/[^a-zA-Z\s'.-]/g, '');
                            onChange?.(cleanedVal);
                            setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete="off"
                        className={`h-full flex-1 min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-[#a1a8b7] ${disabled ? 'cursor-default bg-slate-100 text-slate-400 pointer-events-none' : 'text-slate-700'} ${inputClassName}`.trim()}
                        {...props}
                    />
                </div>

                <div className="flex h-full items-center gap-1.5 pr-3 pl-1 shrink-0">
                    {value && !disabled ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label="Hapus kota"
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    ) : null}
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
            </div>

            {feedbackMessage ? (
                <p className="mt-1.5 text-xs sm:text-sm leading-5 text-[#d65959]">
                    {feedbackMessage}
                </p>
            ) : null}

            {open && (
                <LookupDropdownSurface
                    onClose={() => setOpen(false)}
                    maxHeightLimit={220}
                    className="border-[#cad1dd] shadow-lg rounded-[4px]"
                    anchorRef={rootRef}
                >
                    <div className="overflow-y-auto w-full flex-1 min-h-0">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className="flex w-full flex-col px-4 py-2 text-left hover:bg-[#eef5ff] border-b border-[#f0f4f9] last:border-b-0"
                                >
                                    <span className="text-xs sm:text-sm font-medium text-[#131a28]">
                                        {highlightText(item.city, value)}
                                    </span>
                                    <span className="text-[10px] sm:text-xs text-[#7b8597]">
                                        {highlightText(item.province, value)}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-4 text-center text-xs sm:text-sm text-slate-400">
                                Tidak ada hasil yang cocok.
                            </div>
                        )}
                    </div>
                </LookupDropdownSurface>
            )}
        </div>
    );
}
