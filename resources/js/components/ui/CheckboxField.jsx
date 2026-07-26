import { useId } from 'react';
import Checkbox from './Checkbox';
import { useToggleFieldError } from './FormErrorContext';

export default function CheckboxField({
    id,
    label,
    error = '',
    message = '',
    hint = '',
    disabled = false,
    size = 'sm',
    align = 'start',
    className = '',
    containerClassName = '',
    inputClassName = '',
    labelClassName = '',
    messageClassName = '',
    checked,
    children,
    onChange,
    ...props
}) {
    const generatedId = useId();
    const elementId = id || generatedId;

    const {
        resolvedError,
        feedbackMessage: resolvedFeedback,
        alignClassName,
        widthClass,
        contextKey,
        clearError,
    } = useToggleFieldError({ error, name: props.name, id: elementId, size, align, containerClassName });

    const feedbackMessage = resolvedFeedback || message || hint;

    function handleChange(event) {
        clearError(contextKey);
        onChange?.(event);
    }

    const hasContent = Boolean(label || children || feedbackMessage);

    return (
        <div className={`${widthClass} ${containerClassName}`.trim()}>
            <div className={`flex ${alignClassName} ${hasContent ? 'gap-2.5 sm:gap-3' : ''} text-xs sm:text-sm leading-6`.trim()}>
                <Checkbox
                    id={elementId}
                    checked={checked}
                    disabled={disabled}
                    size={size}
                    aria-invalid={Boolean(resolvedError)}
                    inputClassName={inputClassName}
                    onChange={handleChange}
                    {...props}
                />
                {hasContent && (
                    <label
                        htmlFor={elementId}
                        className={`min-w-0 select-none ${disabled ? 'cursor-not-allowed text-gray-500 pointer-events-none' : 'cursor-pointer text-slate-600'} ${labelClassName} ${className}`.trim()}
                    >
                        <span className={`${disabled ? 'text-gray-500' : 'text-brand-dark'}`.trim()}>
                            {label}
                            {children}
                        </span>

                        {feedbackMessage ? (
                            <span className={`mt-1 block text-[11px] sm:text-xs leading-5 ${resolvedError ? 'text-error-text' : 'text-slate-500'} ${messageClassName}`.trim()}>
                                {feedbackMessage}
                            </span>
                        ) : null}
                    </label>
                )}
            </div>
        </div>
    );
}
