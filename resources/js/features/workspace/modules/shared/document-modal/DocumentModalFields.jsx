import TextInput from '@/components/ui/TextInput';
import { TableActionIcon } from '@/features/workspace/shared/Icons';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';

export function DocumentModalCurrencyField({
    value,
    onChange,
    readOnly = false,
    prefix = 'Rp',
    className = '',
    inputClassName = '',
    ...props
}) {
    return (
        <FormattedAmountInput
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            prefix={prefix}
            maxLength={11}
            className={`h-[36px] rounded-[4px] border-ui-border ${className}`.trim()}
            prefixClassName="min-w-[48px] justify-center bg-input-prefix-bg-compact px-0 text-text-inactive"
            inputClassName={`text-right text-xs sm:text-sm text-text-darkest ${inputClassName}`.trim()}
            {...props}
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
                    className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue-accent"
                    aria-label={prefixAction.ariaLabel ?? 'Aksi harga'}
                >
                    {prefixAction.content}
                </button>
            ) : null}
            <TextInput
                value={value ?? ''}
                readOnly
                prefix={prefix}
                trailing={<TableActionIcon className="h-4 w-4 text-text-darkest" />}
                className="h-[34px] rounded-[4px] border-ui-border"
                prefixClassName="min-w-[48px] justify-center bg-input-prefix-bg-compact px-0 text-text-inactive"
                inputClassName="text-right text-xs sm:text-sm font-normal text-text-darkest"
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
            className={`w-full resize-none rounded-[4px] border border-ui-border px-4 py-3 text-xs sm:text-sm text-brand-dark outline-none ${className}`.trim()}
        />
    );
}
