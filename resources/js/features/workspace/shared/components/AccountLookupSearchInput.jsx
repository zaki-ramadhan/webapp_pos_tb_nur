import { useRef } from 'react';
import TextInput from '@/components/ui/TextInput';
import { LoadingIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { LookupChip } from '@/features/workspace/shared/LookupPrimitives';

function extractCleanAccountName(label) {
    if (!label) return '';
    const match = label.match(/^\[.*?\]\s*(.*)$/);
    return match ? match[1].trim() : label.trim();
}

export default function AccountLookupSearchInput({
    value = '',
    selectedValue = '',
    placeholder,
    searchLabel,
    hasSelectedValue,
    disabled = false,
    error = false,
    className = 'h-11',
    inputClassName = '',
    trailingClassName = '',
    loading = false,
    id,
    onFocus,
    onChange,
    onClear,
    onBeforeOpen = null,
    containerRef = null,
}) {
    const inputRef = useRef(null);
    const internalContainerRef = useRef(null);
    const effectiveContainerRef = containerRef || internalContainerRef;
    const isSelected = hasSelectedValue ?? Boolean(selectedValue);

    function focusInputFromWrapper(event) {
        if (disabled) {
            return;
        }

        if (onBeforeOpen && onBeforeOpen() === false) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        const target = event.target;

        if (
            target instanceof HTMLElement &&
            target.closest('input, button, a, select, textarea, [role="button"]') !== null
        ) {
            return;
        }

        inputRef.current?.focus();
    }

    const toneClassName = error
        ? 'border-danger focus-within:border-danger focus-within:shadow-input-error-focus'
        : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    // Kalau ada chip, wrapper non-interaktif (kursor pointer biasa) — harus clear dulu
    const wrapperCursor = disabled ? 'cursor-default' : isSelected ? 'cursor-default' : 'cursor-text';

    return (
        <div
            ref={effectiveContainerRef}
            onMouseDown={isSelected ? undefined : focusInputFromWrapper}
            aria-invalid={error}
            className={`group flex w-full items-center overflow-hidden rounded-md border ${toneClassName} transition-[border-color,box-shadow] duration-150 ${disabled ? 'bg-slate-100 text-slate-400 cursor-default' : `bg-white ${wrapperCursor}`} ${className}`.trim()}
        >
            <div className={`flex h-full min-w-0 flex-1 items-center gap-2 pl-1 pr-3 ${wrapperCursor}`.trim()}>
                {isSelected ? (
                    <LookupChip
                        label={extractCleanAccountName(selectedValue)}
                        onClear={() => {
                            if (!disabled) {
                                onClear?.();
                                setTimeout(() => {
                                    inputRef.current?.focus();
                                }, 0);
                            }
                        }}
                        disabled={disabled}
                        clearAriaLabel={`Hapus ${searchLabel.toLowerCase()}`}
                    />
                ) : null}

                {isSelected ? null : (
                    <input
                        ref={inputRef}
                        id={id}
                        value={value}
                        onFocus={(event) => {
                            if (onBeforeOpen && onBeforeOpen() === false) {
                                event.target.blur();
                                return;
                            }
                            onFocus?.(event);
                        }}
                        onChange={(event) => {
                            let val = event.target.value;
                            if (typeof val === 'string') {
                                if (val.startsWith(' ')) {
                                    val = val.trimStart();
                                }
                                val = val.replace(/[ \t]{2,}/g, ' ');
                            }
                            onChange(val);
                        }}
                        disabled={disabled}
                        placeholder={isSelected ? '' : placeholder}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className={`h-full min-w-[2.5rem] flex-1 bg-transparent py-0 text-sm outline-none placeholder:${error ? 'text-red-400' : 'text-disabled-border-t'} cursor-text disabled:cursor-not-allowed disabled:text-slate-400 ${disabled ? 'text-slate-400' : 'text-slate-700'} indent-2 ${inputClassName}`.trim()}
                    />
                )}
            </div>

            <span
                className={`flex h-full items-center px-3 transition-colors duration-150 ${disabled ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-[var(--color-input-focus)]'} ${trailingClassName}`.trim()}
            >
                <div className="flex items-center gap-1">
                    {loading ? (
                        <LoadingIcon className="h-5 w-5 animate-spin text-brand-dark" />
                    ) : (
                        <SearchIcon className="h-5 w-5 text-brand-dark" />
                    )}
                </div>
            </span>
        </div>
    );
}
