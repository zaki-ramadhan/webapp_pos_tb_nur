import { CloseIcon, SearchIcon } from '@/features/workspace/shared/Icons';

export default function PreferencesLookupField({
    value = '',
    placeholder = '',
    disabled = false,
    clearable = true,
    className = '',
    tokenClassName = '',
}) {
    const hasValue = Boolean(value);

    return (
        <div
            className={`flex min-h-[44px] w-full items-center gap-2 rounded-[6px] border border-[#cfd6e2] bg-white px-2 py-1 transition-[border-color,box-shadow] duration-150 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)] ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''} ${className}`.trim()}
        >
            <div className="min-w-0 flex-1">
                {hasValue ? (
                    <span
                        className={`inline-flex max-w-full items-start gap-2 rounded-[4px] border border-[#6ea4ef] bg-[#eef6ff] px-2 py-0.5 text-[14px] leading-5 text-[#172554] ${tokenClassName}`.trim()}
                    >
                        <span className="min-w-0 whitespace-pre-line break-words">{value}</span>
                        {clearable ? <CloseIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#1f2937]" /> : null}
                    </span>
                ) : (
                    <span className="px-2 text-[15px] text-slate-400">{placeholder}</span>
                )}
            </div>

            <button
                type="button"
                disabled={disabled}
                aria-label="Cari akun"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-[#1f2937] disabled:cursor-not-allowed disabled:text-slate-300"
            >
                <SearchIcon className="h-5 w-5 text-current" />
            </button>
        </div>
    );
}
