import TextInput from '@/components/ui/TextInput';
import { TableActionIcon } from '@/features/workspace/shared/Icons';

export function DocumentModalCurrencyField({
    value,
    onChange,
    readOnly = false,
    prefix = 'Rp',
    className = '',
    inputClassName = '',
}) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            prefix={prefix}
            className={`h-[36px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            prefixClassName="min-w-[48px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
            inputClassName={`text-right text-xs sm:text-sm text-[#111827] ${inputClassName}`.trim()}
        />
    );
}

export function DocumentModalCurrencyReadonlyField({
    value,
    prefix = 'Rp',
    className = '',
    prefixAction = null,
}) {
    return (
        <div className={`grid gap-3 ${prefixAction ? 'grid-cols-[48px_minmax(0,1fr)]' : 'grid-cols-1'} ${className}`.trim()}>
            {prefixAction ? (
                <button
                    type="button"
                    className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#21539b]"
                    aria-label={prefixAction.ariaLabel ?? 'Aksi harga'}
                >
                    {prefixAction.content}
                </button>
            ) : null}
            <TextInput
                value={value ?? ''}
                readOnly
                prefix={prefix}
                trailing={<TableActionIcon className="h-4 w-4 text-[#111827]" />}
                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                prefixClassName="min-w-[48px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
                inputClassName="text-right text-xs sm:text-sm font-normal text-[#111827]"
                trailingClassName="px-3"
            />
        </div>
    );
}

export function ReadonlyDocumentTextarea({ value, rows = 3, className = '' }) {
    return (
        <textarea
            value={value}
            readOnly
            rows={rows}
            className={`w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none ${className}`.trim()}
        />
    );
}
