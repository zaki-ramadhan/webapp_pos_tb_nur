import TextInput from '@/components/ui/TextInput';

export default function TransferValueInput({
    prefix,
    value,
    onChange = null,
    readOnly = false,
    maxWidthClassName = 'max-w-[276px]',
}) {
    return (
        <div className={maxWidthClassName}>
            <TextInput
                type="number"
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                prefix={prefix}
                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                prefixClassName="min-w-[42px] justify-center border-r-[#d8dde7] bg-[#fbfcfe] px-2 text-xs sm:text-sm text-[#9097aa]"
                inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
            />
        </div>
    );
}
