import { useRef } from 'react';
import TextInput from '@/components/ui/TextInput';
import { CloseIcon, LoadingIcon, SearchIcon } from '@/features/workspace/shared/Icons';

export default function AccountLookupSearchInput({
    value,
    selectedValue = '',
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
    error = false,
    id,
    containerRef = null,
}) {
    const inputRef = useRef(null);
    const hasSelectedValue = Boolean(selectedValue);

    function focusInputFromWrapper(event) {
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

    const toneClassName = error
        ? 'border-red-150 focus-within:border-error-border focus-within:shadow-input-error-focus'
        : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    return (
        <div
            ref={containerRef}
            onMouseDown={focusInputFromWrapper}
            className={`group flex w-full items-center overflow-hidden rounded-[4px] border ${toneClassName} transition-[border-color,box-shadow] duration-150 ${disabled ? 'bg-slate-100 text-slate-400' : 'bg-white'} ${className}`.trim()}
        >
            <div className="flex min-w-0 flex-1 items-center gap-2 pl-1.5 pr-3">
                {hasSelectedValue ? (
                    <span className="inline-flex max-w-full items-center gap-2 rounded-[4px] border border-border-chip-blue bg-bg-chip-blue px-2 py-1 text-sm text-text-chip-blue-dark">
                        <span className="truncate">{selectedValue}</span>
                        <button
                            type="button"
                            onClick={() => {
                                if (!disabled) {
                                    onClear?.();
                                    setTimeout(() => {
                                        inputRef.current?.focus();
                                    }, 0);
                                }
                            }}
                            disabled={disabled}
                            aria-label={`Hapus ${searchLabel.toLowerCase()}`}
                            className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-text-chip-blue-dark disabled:text-slate-300"
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </span>
                ) : null}

                {hasSelectedValue ? null : (
                    <input
                        ref={inputRef}
                        id={id}
                        value={value}
                        onFocus={onFocus}
                        onChange={(event) => onChange(event.target.value)}
                        disabled={disabled}
                        placeholder={hasSelectedValue ? '' : placeholder}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className={`h-full min-w-[2.5rem] flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-disabled-border-t disabled:cursor-not-allowed disabled:text-slate-400 ${disabled ? 'text-slate-400' : 'text-slate-700'} ${inputClassName}`.trim()}
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
