import TextInput from '@/components/ui/TextInput';

export default function TransferValueInput({
    prefix,
    value,
    onChange = null,
    onBlur = null,
    readOnly = false,
    maxWidthClassName = 'max-w-[276px]',
}) {
    return (
        <div className={maxWidthClassName}>
            <TextInput
                type="number"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                readOnly={readOnly}
                prefix={prefix}
                className="h-[34px] rounded-[4px] border-ui-border"
                prefixClassName="min-w-[42px] justify-center border-r-ui-border-medium bg-ui-bg-hover px-2 text-xs sm:text-sm text-text-light"
                inputClassName="text-right text-xs sm:text-sm text-brand-dark"
            />
        </div>
    );
}
