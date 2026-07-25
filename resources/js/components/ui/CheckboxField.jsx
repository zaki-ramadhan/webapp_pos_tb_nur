import { useId } from 'react';
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
    children,
    onChange,
    ...props
}) {
    const generatedId = useId();
    const elementId = id || generatedId;

    const {
        resolvedError,
        feedbackMessage: resolvedFeedback,
        sizeClassName,
        alignClassName,
        inputOffsetClassName,
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
            <div className={`flex ${alignClassName} ${hasContent ? 'gap-3.5' : ''} text-xs sm:text-sm leading-6`.trim()}>
                <input
                    id={elementId}
                    type="checkbox"
                    disabled={disabled}
                    aria-invalid={Boolean(resolvedError)}
                    className={`${inputOffsetClassName} shrink-0 rounded-[4px] border border-slate-400 text-[#15529A] focus:ring-2 focus:ring-[#15529A]/30 accent-[#15529A] disabled:border-gray-200 disabled:bg-ui-bg-panel disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed ${sizeClassName} ${resolvedError ? 'border-error-border' : ''} ${inputClassName}`.trim()}
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
