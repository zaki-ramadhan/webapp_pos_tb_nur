import { ChevronDown } from 'lucide-react';

import { useFormError } from './FormErrorContext';

export default function SelectField({
    id,
    value,
    defaultValue,
    error = '',
    message = '',
    disabled = false,
    className = '',
    containerClassName = '',
    selectClassName = '',
    iconClassName = '',
    messageClassName = '',
    children,
    onChange,
    ...props
}) {
    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, props.name, id);
    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);
    const resolvedContainerClassName = containerClassName || 'w-full';
    const toneClassName = resolvedError
        ? 'border-[#e39191] focus-within:border-[#d65959] focus-within:shadow-[0_0_0_3px_rgba(214,89,89,0.14)]'
        : 'border-slate-300 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';

    function handleChange(event) {
        clearError(contextKey);
        onChange?.(event);
    }

    return (
        <div className={resolvedContainerClassName}>
            <div
                className={`group flex h-11 w-full items-center overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabled ? 'bg-slate-100' : ''} ${className}`.trim()}
            >
                <select
                    id={id}
                    value={value}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    aria-invalid={Boolean(resolvedError)}
                    className={`h-full w-full appearance-none bg-transparent px-4 text-sm outline-none disabled:cursor-not-allowed ${disabled ? 'text-slate-400' : 'text-slate-700'} ${selectClassName}`.trim()}
                    onChange={handleChange}
                    {...props}
                >
                    {children}
                </select>

                <span
                    className={`pointer-events-none mr-3 transition-colors duration-150 ${disabled ? 'text-slate-300' : 'text-slate-300 group-focus-within:text-[var(--color-input-focus)]'} ${iconClassName}`.trim()}
                >
                    <ChevronDown aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} absoluteStrokeWidth />
                </span>
            </div>

            {feedbackMessage ? (
                <p className={`mt-1.5 text-[13px] leading-5 ${resolvedError ? 'text-[#d65959]' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
