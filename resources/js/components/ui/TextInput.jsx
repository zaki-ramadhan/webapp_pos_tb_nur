import { useRef } from 'react';

export default function TextInput({
    id,
    type = 'text',
    placeholder = '',
    prefix = null,
    trailing = null,
    error = '',
    message = '',
    disabled = false,
    className = '',
    containerClassName = '',
    prefixClassName = '',
    inputClassName = '',
    trailingClassName = '',
    messageClassName = '',
    ...props
}) {
    const inputRef = useRef(null);
    const feedbackMessage = error || message;
    const toneClassName = error
        ? 'border-[#e39191] focus-within:border-[#d65959] focus-within:shadow-[0_0_0_3px_rgba(214,89,89,0.14)]'
        : 'border-slate-300 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';
    const disabledClassName = disabled ? 'bg-slate-100 text-slate-400' : 'bg-white';

    function focusInputFromWrapper(event) {
        if (disabled) {
            return;
        }

        const target = event.target;

        if (
            target instanceof HTMLElement &&
            (target.closest('input, button, a, select, textarea, [role="button"]') !== null)
        ) {
            return;
        }

        inputRef.current?.focus();
    }

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
            <div
                onMouseDown={focusInputFromWrapper}
                className={`group flex h-11 w-full items-center overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabledClassName} ${className}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex h-full min-w-[86px] items-center border-r border-slate-300 px-5 text-[15px] text-[#5a84e5] transition-colors duration-150 group-focus-within:border-current ${disabled ? 'bg-slate-100 text-slate-400' : ''} ${prefixClassName}`.trim()}
                    >
                        {prefix}
                    </span>
                ) : null}

                <input
                    ref={inputRef}
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    className={`h-full flex-1 px-4 text-sm outline-none placeholder:text-slate-300 disabled:cursor-not-allowed disabled:text-slate-400 ${disabled ? 'bg-slate-100 text-slate-400' : 'text-slate-700'} ${inputClassName}`.trim()}
                    {...props}
                />

                {trailing ? (
                    <span
                        className={`flex h-full items-center px-3 transition-colors duration-150 ${disabled ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-[var(--color-input-focus)]'} ${trailingClassName}`.trim()}
                    >
                        {trailing}
                    </span>
                ) : null}
            </div>

            {feedbackMessage ? (
                <p className={`mt-1.5 text-[13px] leading-5 ${error ? 'text-[#d65959]' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
