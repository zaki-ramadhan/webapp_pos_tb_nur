import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';

export default function TransferValueInput({
    id,
    name,
    prefix,
    value,
    onChange = null,
    onBlur = null,
    readOnly = false,
    maxWidthClassName = 'max-w-[320px]',
}) {
    return (
        <div className={maxWidthClassName}>
            <FormattedAmountInput
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                readOnly={readOnly}
                prefix={prefix}
                maxLength={18}
                className="h-[40px] rounded-[4px] border-ui-border"
                prefixClassName="min-w-[32px] bg-input-prefix-bg px-3 text-xs sm:text-sm text-table-row-text"
                inputClassName="text-right text-xs sm:text-sm text-brand-dark font-normal"
                containerClassName="w-full !max-w-none"
            />
        </div>
    );
}
