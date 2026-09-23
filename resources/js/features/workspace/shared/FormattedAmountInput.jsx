import TextInput from '@/components/ui/TextInput';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

export default function FormattedAmountInput({
    value,
    onChange,
    allowDecimal = true,
    allowNegative = false,
    inputMode = 'decimal',
    prefix = null,
    containerClassName,
    ...props
}) {
    const rawValue = typeof value === 'object' && value !== null
        ? (value.target ? value.target.value : (value.value ?? ''))
        : value;
    const formattedValue = formatAmountInput(rawValue || '0', { allowDecimal, allowNegative });

    function handleChange(event) {
        const val = event?.target ? event.target.value : event;
        const nextValue = formatAmountInput(val, { allowDecimal, allowNegative, isInput: true });

        onChange?.({
            target: {
                name: event?.target?.name || props.name,
                value: nextValue,
            },
            currentTarget: {
                name: event?.target?.name || props.name,
                value: nextValue,
            },
        });
    }

    function handleBlur(event) {
        const val = event?.target ? event.target.value : event;
        const finalValue = formatAmountInput(val || '0', { allowDecimal, allowNegative, isInput: false });

        onChange?.({
            target: {
                name: event?.target?.name || props.name,
                value: finalValue,
            },
            currentTarget: {
                name: event?.target?.name || props.name,
                value: finalValue,
            },
        });

        props.onBlur?.({
            target: {
                name: event?.target?.name || props.name,
                value: finalValue,
            },
            currentTarget: {
                name: event?.target?.name || props.name,
                value: finalValue,
            },
        });
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            return;
        }
        const allowedKeys = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
            'Tab', 'Escape', 'Home', 'End',
        ];
        if (event.ctrlKey || event.metaKey) return;
        if (allowedKeys.includes(event.key)) return;
        if (/^[0-9]$/.test(event.key)) return;
        if (allowDecimal && (event.key === ',' || event.key === '.')) return;
        if (allowNegative && event.key === '-') return;
        event.preventDefault();
    }

    const hasExplicitAlign = /(?:^|\s)text-(?:left|right|center|justify)(?:\s|$)/.test(props.inputClassName || '');
    const resolvedInputClassName = `${hasExplicitAlign ? '' : 'text-right'} ${props.inputClassName ?? ''}`.trim();

    return (
        <TextInput
            {...props}
            prefix={prefix}
            isCurrency={props.isCurrency ?? true}
            maxLength={props.maxLength ?? 18}
            value={formattedValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            inputMode={inputMode}
            containerClassName={containerClassName ?? 'w-full max-w-[240px]'}
            inputClassName={resolvedInputClassName}
        />
    );
}

