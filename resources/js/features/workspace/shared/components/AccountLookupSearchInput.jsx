import { useRef } from 'react';
import TextInput from '@/components/ui/TextInput';
import { CloseIcon, LoadingIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function extractCleanAccountName(label) {
    if (!label) return '';
    const match = label.match(/^\[.*?\]\s*(.*)$/);
    return match ? match[1].trim() : label.trim();
}

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
        ? 'border-danger focus-within:border-danger focus-within:shadow-input-error-focus'
        : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    return (
        <div
            ref={containerRef}
            onMouseDown={focusInputFromWrapper}
            aria-invalid={error}
            className={`group flex w-full items-center overflow-hidden rounded-md border ${toneClassName} transition-[border-color,box-shadow] duration-150 ${disabled ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-white cursor-text'} ${className}`.trim()}
        >
            <div className={`flex h-full min-w-0 flex-1 items-center gap-2 pl-1 pr-3 ${disabled ? 'cursor-default' : 'cursor-text'}`.trim()}>
                {hasSelectedValue ? (
                    <span className="inline-flex max-w-full items-center gap-2 rounded-md border border-border-chip-blue bg-bg-chip-blue px-2 py-1 text-sm text-text-chip-blue-dark">
                        <span className="truncate">{extractCleanAccountName(selectedValue)}</span>
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
