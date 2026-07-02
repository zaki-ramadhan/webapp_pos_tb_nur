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

    function handleKeyDown(event) {
        const allowedKeys = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
            'Tab', 'Escape', 'Enter', 'Home', 'End',
        ];
        if (event.ctrlKey || event.metaKey) return;
        if (allowedKeys.includes(event.key)) return;
        if (/^[0-9]$/.test(event.key)) return;
        if (allowDecimal && (event.key === ',' || event.key === '.')) return;
        if (allowNegative && event.key === '-') return;
        event.preventDefault();
    }

    return (
        <TextInput
            {...props}
            value={formattedValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            inputMode={inputMode}
            containerClassName={`w-full max-w-[240px] ${props.containerClassName ?? ''}`.trim()}
        />
    );
}

