import { isClearOrCloseElement } from './utils/textInputHelpers';
import useTextInputState from './hooks/useTextInputState';

export default function TextInput({
    id,
    type = 'text',
    isCurrency: isCurrencyProp,
    allowDecimal = true,
    allowNegative = false,
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
    readOnly = false,
    interactiveReadOnly = false,
    tabIndex,
    onChange,
    value,
    defaultValue,
    clearable = true,
    onClear = null,
    ...props
}) {
    const state = useTextInputState({
        id,
        type,
        isCurrency: isCurrencyProp,
        allowDecimal,
        allowNegative,
        placeholder,
        prefix,
        error,
        message,
        disabled,
        readOnly,
        interactiveReadOnly,
        onChange,
        value,
        defaultValue,
        ...props
    });

    const prefixStr = typeof prefix === 'string' ? prefix.toLowerCase() : '';
    const hasHeightClass = className.split(' ').some(c => c.startsWith('h-') || c.startsWith('min-h-') || c.startsWith('max-h-'));
    const heightClass = hasHeightClass ? '' : 'h-11';
    
    const toneClassName = state.resolvedError
        ? state.isNonInteractive
            ? 'border-danger'
            : 'border-danger focus-within:border-danger focus-within:shadow-input-error-focus'
        : state.isNonInteractive
            ? 'border-slate-400'
            : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';
            
    const disabledClassName = state.isNonInteractive
        ? 'bg-ui-bg-panel text-gray-500'
        : state.resolvedError
            ? 'bg-red-500/[0.06]'
            : 'bg-white';

    const cleanedClassName = state.resolvedError
        ? className.replace(/\bborder-[^\s]+\b/g, '')
        : className;

    const resolvedType = type === 'number' ? 'text' : type;
    const resolvedInputMode = props.inputMode ?? (type === 'number' ? 'decimal' : undefined);
    const resolvedMin = type === 'number' ? 0 : undefined;

    function focusInputFromWrapper(event) {
        if (state.isNonInteractive) {
            return;
        }
        const target = event.target;
        if (
            target instanceof HTMLElement &&
            (target.closest('input, button, a, select, textarea, [role="button"]') !== null)
        ) {
            return;
        }
        state.inputRef.current?.focus();
    }

    const hasWidth = containerClassName.includes('w-') || className.includes('w-') || props.style?.width;
    const widthClass = hasWidth ? '' : 'w-full';

    const isCurrencyPrefix = prefixStr === 'rp';
    const hasPrefixMinW = prefixClassName.includes('min-w-');
    const prefixMinWClass = hasPrefixMinW ? '' : (isCurrencyPrefix ? 'min-w-0 justify-center' : 'min-w-[86px]');
    const hasPrefixPx = prefixClassName.includes('px-') || prefixClassName.includes('pl-') || prefixClassName.includes('pr-');
    const prefixPxClass = hasPrefixPx ? '' : 'px-2';
    const hasPrefixColor = prefixClassName.includes('text-');
    const prefixColorClass = hasPrefixColor ? '' : 'text-black';

    const hasTrailingPx = trailingClassName.includes('px-') || trailingClassName.includes('pl-') || trailingClassName.includes('pr-');

    const isClearOrClose = isClearOrCloseElement(trailing);
    const showTrailing = trailing
        ? !(state.isNonInteractive && isClearOrClose)
        : (clearable && onChange && !state.isNonInteractive && state.localValue !== undefined && state.localValue !== null && state.localValue !== '');

    const computedStyle = { ...props.style };
    if (!hasWidth && state.resolvedMaxLength) {
        const prefixWidth = prefix ? (typeof prefix === 'string' ? prefix.length + 2 : 5) : 0;
        const trailingWidth = showTrailing ? 3 : 2;
        const paddingBuffer = state.isPostal ? 10 : 2;
        const totalCh = state.resolvedMaxLength + prefixWidth + trailingWidth + paddingBuffer;
        computedStyle.maxWidth = `${totalCh}ch`;
    }

    return (
        <div className={`${widthClass} ${containerClassName}`.trim()} style={computedStyle}>
            <div
                onMouseDown={focusInputFromWrapper}
                aria-invalid={Boolean(state.resolvedError)}
                className={`group flex ${heightClass} w-full items-center overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabledClassName} ${state.isNonInteractive ? 'cursor-default' : 'cursor-text'} ${cleanedClassName}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex h-full ${prefixMinWClass} items-center border-r border-slate-400 ${prefixPxClass} text-xs sm:text-sm ${prefixColorClass} transition-colors duration-150 group-focus-within:border-current ${disabled ? 'bg-ui-bg-panel text-gray-500' : ''} ${prefixClassName}`.trim()}
                    >
                        {prefix}
                    </span>
                ) : null}

                <input
                    ref={state.inputRef}
                    {...props}
                    id={id}
                    type={resolvedType}
                    inputMode={resolvedInputMode}
                    placeholder={placeholder}
                    value={state.localValue}
                    disabled={disabled}
                    readOnly={readOnly}
                    tabIndex={readOnly && !interactiveReadOnly ? -1 : tabIndex}
                    aria-invalid={Boolean(state.resolvedError)}
                    className={`h-full flex-1 min-w-0 ${inputClassName.includes('px-') || inputClassName.includes('pl-') ? '' : showTrailing ? 'pl-4 pr-1' : 'px-4'} text-xs sm:text-sm outline-none placeholder:${state.resolvedError ? 'text-red-400' : 'text-disabled-border-t'} ${state.isNonInteractive ? 'cursor-default bg-ui-bg-panel text-gray-500 pointer-events-none' : state.resolvedError ? 'bg-transparent text-red-800' : 'text-black bg-white'} ${inputClassName}`.trim()}
                    onChange={state.handleWrappedChange}
                    onFocus={(e) => {
                        state.isFocusedRef.current = true;
                        props.onFocus?.(e);
                    }}
                    onBlur={state.handleWrappedBlur}
                    maxLength={state.resolvedMaxLength}
                    minLength={state.isPostal ? 5 : props.minLength}
                    min={resolvedMin}
                    onKeyDown={state.handleWrappedKeyDown}
                />

                {showTrailing ? (
                    <span
                        className={`flex h-full items-center ${hasTrailingPx ? '' : 'pl-1 pr-2'} transition-colors duration-150 ${state.isNonInteractive ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-[var(--color-input-focus)]'} ${trailingClassName}`.trim()}
                    >
                        {trailing ?? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (state.inputRef.current) {
                                        state.inputRef.current.value = '';
                                        state.inputRef.current.focus();
                                    }
                                    state.setLocalValue('');
                                    onChange?.({
                                        target: {
                                            id: id ?? '',
                                            name: props.name ?? '',
                                            value: '',
                                        },
                                    });
                                }}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                                aria-label="Hapus"
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </span>
                ) : null}
            </div>

            {state.feedbackMessage ? (
                <p className={`mt-1.5 text-[11px] sm:text-xs leading-5 ${state.resolvedError ? 'text-error-border' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {state.feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
