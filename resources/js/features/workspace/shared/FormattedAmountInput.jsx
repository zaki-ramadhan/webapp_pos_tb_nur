import TextInput from '@/components/ui/TextInput';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

export default function FormattedAmountInput({
    value,
    onChange,
    allowDecimal = true,
    allowNegative = false,
    inputMode = 'decimal',
    ...props
}) {
    const formattedValue = formatAmountInput(value || '0', { allowDecimal, allowNegative });

    function handleChange(event) {
        const nextValue = formatAmountInput(event.target.value, { allowDecimal, allowNegative });

        onChange?.({
            target: {
                name: event.target.name,
                value: nextValue,
            },
            currentTarget: {
                name: event.target.name,
                value: nextValue,
            },
        });
    }

    return (
        <TextInput
            {...props}
            value={formattedValue}
            onChange={handleChange}
            inputMode={inputMode}
        />
    );
}
