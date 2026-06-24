import { CloseIcon, SearchIcon } from '@/features/workspace/shared/Icons';

export default function PreferencesLookupField({
    value = '',
    placeholder = '',
    disabled = false,
    clearable = true,
    className = '',
    tokenClassName = '',
    onClear,
}) {
    const hasValue = Boolean(value);

    return (
        <div
            className={`flex min-h-[38px] w-full items-center gap-2 rounded-[6px] border border-ui-border bg-white px-2 py-1 transition-[border-color,box-shadow] duration-150 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)] ${disabled ? 'cursor-default bg-slate-100 text-slate-400 pointer-events-none' : ''} ${className}`.trim()}
        >
            <div className="min-w-0 flex-1">
                {hasValue ? (
                    <span
                        className={`inline-flex max-w-full items-center gap-2 rounded-[4px] border border-blue-6ea4ef bg-info-bg px-2 py-0.5 text-sm md:text-sm leading-5 text-blue-172554 ${tokenClassName}`.trim()}
                    >
                        <span className="min-w-0 whitespace-pre-line break-words">{value}</span>
                        {clearable && !disabled ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClear?.();
                                }}
                                className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-text-dark hover:bg-blue-6ea4ef/20 transition-colors focus:outline-none"
                                aria-label="Hapus"
                            >
                                <CloseIcon className="h-3.5 w-3.5" />
                            </button>
                        ) : null}
                    </span>
                ) : (
                    <span className="px-2 text-xs sm:text-sm text-slate-400">{placeholder}</span>
                )}
            </div>

            <button
                type="button"
                disabled={disabled}
                aria-label="Cari akun"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-text-dark disabled:cursor-default disabled:text-slate-300 disabled:pointer-events-none focus:outline-none"
            >
                <SearchIcon className="h-5 w-5 text-current" />
            </button>
        </div>
    );
}
