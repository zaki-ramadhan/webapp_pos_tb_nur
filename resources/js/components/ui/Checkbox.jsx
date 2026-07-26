import { useEffect, useRef } from 'react';

const SIZE_CLASSES = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
};

const ICON_SIZE_CLASSES = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
};

export function Checkbox({
    id,
    checked = false,
    indeterminate = false,
    onChange,
    disabled = false,
    size = 'md',
    className = '',
    inputClassName = '',
    name,
    value,
    'aria-label': ariaLabel,
    'aria-invalid': ariaInvalid,
    ...props
}) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = Boolean(indeterminate);
        }
    }, [indeterminate]);

    const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
    const iconSizeClass = ICON_SIZE_CLASSES[size] ?? ICON_SIZE_CLASSES.md;

    function handleChange(e) {
        if (disabled) return;
        onChange?.(e);
    }

    const isCheckedOrIndeterminate = checked || indeterminate;

    return (
        <label
            htmlFor={id}
            className={`group relative inline-flex shrink-0 select-none items-center justify-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`.trim()}
        >
            <input
                ref={inputRef}
                id={id}
                type="checkbox"
                name={name}
                value={value}
                checked={Boolean(checked)}
                disabled={disabled}
                onChange={handleChange}
                aria-label={ariaLabel}
                aria-invalid={ariaInvalid}
                className="peer sr-only"
                {...props}
            />

            <span
                className={`flex shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-all duration-150 ease-in-out focus-within:ring-2 focus-within:ring-[#15529A]/30 ${sizeClass} ${
                    isCheckedOrIndeterminate
                        ? 'border-[#15529A] bg-[#15529A] text-white shadow-xs'
                        : 'border-slate-400 bg-white group-hover:border-slate-600 peer-focus-visible:ring-2 peer-focus-visible:ring-[#15529A]/40'
                } ${ariaInvalid ? 'border-error-border' : ''} ${inputClassName}`.trim()}
            >
                {indeterminate ? (
                    <svg
                        className={`${iconSizeClass} stroke-current stroke-[3]`}
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                ) : checked ? (
                    <svg
                        className={`${iconSizeClass} stroke-current stroke-[3]`}
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                ) : null}
            </span>
        </label>
    );
}

export default Checkbox;
