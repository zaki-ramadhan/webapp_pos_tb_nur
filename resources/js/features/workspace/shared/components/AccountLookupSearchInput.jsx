import { useRef } from 'react';
import TextInput from '@/components/ui/TextInput';
import { CloseIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';

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
        ? 'border-[#e39191] focus-within:border-[#d65959] focus-within:shadow-[0_0_0_3px_rgba(214,89,89,0.14)]'
        : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    return (
        <div
            onMouseDown={focusInputFromWrapper}
            className={`group flex w-full items-center overflow-hidden rounded-[4px] border ${toneClassName} transition-[border-color,box-shadow] duration-150 ${disabled ? 'bg-slate-100 text-slate-400' : 'bg-white'} ${className}`.trim()}
        >
            <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                {hasSelectedValue ? (
                    <span className="inline-flex max-w-full items-center gap-2 rounded-[4px] border border-[#8ab2ea] bg-[#eef5ff] px-2 py-1 text-sm text-[#295089]">
                        <span className="truncate">{selectedValue}</span>
                        <button
                            type="button"
                            onClick={() => {
                                if (!disabled) {
                                    onClear?.();
                                }
                            }}
                            disabled={disabled}
                            aria-label={`Hapus ${searchLabel.toLowerCase()}`}
                            className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#295089] disabled:text-slate-300"
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </span>
                ) : null}

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
                    className={`h-full min-w-[2.5rem] flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[#a1a8b7] disabled:cursor-not-allowed disabled:text-slate-400 ${disabled ? 'text-slate-400' : 'text-slate-700'} ${inputClassName}`.trim()}
                />
            </div>

            <span
                className={`flex h-full items-center px-3 transition-colors duration-150 ${disabled ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-[var(--color-input-focus)]'} ${trailingClassName}`.trim()}
            >
                <div className="flex items-center gap-1">
                    {loading ? (
                        <RefreshIcon className="h-5 w-5 animate-spin text-[#1f2436]" />
                    ) : (
                        <SearchIcon className="h-5 w-5 text-[#1f2436]" />
                    )}
                </div>
            </span>
        </div>
    );
}
