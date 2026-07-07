import { useRef, useState, useEffect } from 'react';

import { useFormError } from './FormErrorContext';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

function unformatAmount(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'number') return val;
    let str = String(val);
    let clean = str.replace(/\./g, '').replace(/,/g, '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? str : parsed;
}

function sanitizeInput(val, type, id = '', name = '', placeholder = '', prefix = '', lettersOnly = false) {
    if (typeof val === 'string' && val.startsWith(' ')) {
        val = val.trimStart();
    }
    const prefixStr = typeof prefix === 'string' ? prefix.toLowerCase() : '';
    const searchStr = `${id} ${name} ${placeholder} ${prefixStr}`.toLowerCase();

    const isCurrency = searchStr.includes('price') ||
                       searchStr.includes('amount') ||
                       searchStr.includes('limit') ||
                       searchStr.includes('kurs') ||
                       searchStr.includes('jumlah') ||
                       searchStr.includes('nominal') ||
                       searchStr.includes('cost') ||
                       searchStr.includes('piutang') ||
                       searchStr.includes('utang') ||
                       searchStr.includes('nilai') ||
                       searchStr.includes('length') ||
                       searchStr.includes('width') ||
                       searchStr.includes('height') ||
                       searchStr.includes('weight') ||
                       searchStr.includes('panjang') ||
                       searchStr.includes('lebar') ||
                       searchStr.includes('tinggi') ||
                       searchStr.includes('berat') ||
                       prefixStr === 'rp';

    if (isCurrency) {
        return formatAmountInput(val, { allowDecimal: true, isInput: true });
    }

    return val;
}

function isClearOrCloseElement(element) {
    if (!element) return false;
    if (typeof element === 'object' && element.type) {
        const typeName = element.type.name || (element.type.render && element.type.render.name) || '';
        if (typeName === 'CloseIcon' || typeName === 'Close') {
            return true;
        }
        if (element.props) {
            if (element.props.className && element.props.className.includes('CloseIcon')) {
                return true;
            }
            if (element.props['aria-label'] && /close|clear|hapus/i.test(element.props['aria-label'])) {
                return true;
            }
            const children = element.props.children;
            if (typeof children === 'string' && (children === 'x' || children === '×')) {
                return true;
            }
        }
    }
    return false;
}

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
    const name = props.name ?? '';
    const prefixStr = typeof prefix === 'string' ? prefix.toLowerCase() : '';
    const searchStr = `${id || ''} ${name} ${placeholder} ${prefixStr}`.toLowerCase();

    const isPostal = searchStr.includes('postal') ||
                     searchStr.includes('kodepos') ||
                     searchStr.includes('zip') ||
                     searchStr.includes('k.pos') ||
                     searchStr.includes('kode pos');

    const isPhone = searchStr.includes('phone') ||
                    searchStr.includes('telp') ||
                    searchStr.includes('telepon') ||
                    searchStr.includes('whatsapp') ||
                    searchStr.includes('wa') ||
                    searchStr.includes('fax') ||
                    searchStr.includes('hp') ||
                    searchStr.includes('kontak') ||
                    searchStr.includes('contact');

    const isCurrency = searchStr.includes('price') ||
                       searchStr.includes('amount') ||
                       searchStr.includes('limit') ||
                       searchStr.includes('kurs') ||
                       searchStr.includes('jumlah') ||
                       searchStr.includes('nominal') ||
                       searchStr.includes('cost') ||
                       searchStr.includes('piutang') ||
                       searchStr.includes('utang') ||
                       searchStr.includes('nilai') ||
                       prefixStr === 'rp';

    const isCodeOrNumber = searchStr.includes('code') ||
                           searchStr.includes('kode') ||
                           searchStr.includes('number') ||
                           searchStr.includes('nomor') ||
                           searchStr.includes('no') ||
                           searchStr.includes('reference') ||
                           searchStr.includes('external') ||
                           searchStr.includes('sku') ||
                           searchStr.includes('npwp') ||
                           type === 'number';

    const defaultMaxLength = isPostal ? 5 : (isPhone ? 30 : (isCurrency ? 18 : (isCodeOrNumber ? 120 : 255)));
    const resolvedMaxLength = props.maxLength ?? defaultMaxLength;

    const inputRef = useRef(null);
    const isFocusedRef = useRef(false);
    const [localValue, setLocalValue] = useState(() => {
        const val = value ?? defaultValue ?? '';
        if (isCurrency && val !== '') {
            return formatAmountInput(val, { allowDecimal: true });
        }
        if (type === 'number') {
            return val || '0';
        }
        return val;
    });
    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, props.name, id);

    const isEmpty = value === '' || value === null || value === undefined;
    useEffect(() => {
        if (value !== undefined) {
            if (!isFocusedRef.current || isEmpty) {
                const currentVal = isCurrency ? unformatAmount(localValue) : localValue;
                const incomingVal = isCurrency ? unformatAmount(value) : value;

                if (String(currentVal) === String(incomingVal)) {
                    return;
                }

                let nextVal = value ?? '';
                if (isCurrency && nextVal !== '') {
                    nextVal = formatAmountInput(nextVal, { allowDecimal: true });
                }
                setLocalValue(nextVal);
            }
        }
    }, [value, isCurrency, localValue, isEmpty]);

    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);
    const hasHeightClass = className.split(' ').some(c => c.startsWith('h-') || c.startsWith('min-h-') || c.startsWith('max-h-'));
    const heightClass = hasHeightClass ? '' : 'h-11';
    const isNonInteractive = disabled || (readOnly && !interactiveReadOnly);
    const toneClassName = resolvedError
        ? isNonInteractive
            ? 'border-danger'
            : 'border-danger focus-within:border-danger focus-within:shadow-input-error-focus'
        : isNonInteractive
            ? 'border-slate-400'
            : 'border-slate-400 focus-within:border-[var(--color-input-focus)] focus-within:shadow-[0_0_0_3px_var(--color-input-focus-ring)]';
    const disabledClassName = isNonInteractive
        ? 'bg-ui-bg-panel text-gray-500'
        : resolvedError
            ? 'bg-red-500/[0.06]'
            : 'bg-white';

    const cleanedClassName = resolvedError
        ? className.replace(/\bborder-[^\s]+\b/g, '')
        : className;

    const resolvedType = type === 'number' ? 'text' : type;
    const resolvedInputMode = props.inputMode ?? (type === 'number' ? 'decimal' : undefined);
    const resolvedMin = type === 'number' ? 0 : undefined;

    function handleWrappedChange(event) {
        const inputEl = event.target;
        const selectionStart = inputEl.selectionStart;
        const rawValue = inputEl.value;

        let digitsBeforeCursor = 0;
        for (let i = 0; i < selectionStart; i++) {
            if (/\d/.test(rawValue[i])) {
                digitsBeforeCursor++;
            }
        }

        let originalValue = rawValue;
        if (resolvedMaxLength && originalValue.length > resolvedMaxLength) {
            originalValue = originalValue.slice(0, resolvedMaxLength);
        }
        const name = props.name ?? '';
        const prefixVal = typeof prefix === 'string' ? prefix : '';
        const sanitizedValue = sanitizeInput(originalValue, type, id, name, placeholder, prefixVal, props.lettersOnly);

        setLocalValue(sanitizedValue);
        clearError(contextKey);
        if (onChange) {
            onChange({
                target: {
                    id: id || '',
                    name: props.name || '',
                    value: sanitizedValue,
                },
                currentTarget: {
                    id: id || '',
                    name: props.name || '',
                    value: sanitizedValue,
                },
                preventDefault: () => {
                    event.preventDefault?.();
                },
                stopPropagation: () => {
                    event.stopPropagation?.();
                },
                isDefaultPrevented: () => event.isDefaultPrevented?.() ?? false,
                isPropagationStopped: () => event.isPropagationStopped?.() ?? false,
                persist: () => {},
            });
        }

        if (isCurrency) {
            requestAnimationFrame(() => {
                if (!inputEl) return;
                const newFormattedValue = inputEl.value;
                let newCursorPosition = 0;
                let digitsFound = 0;
                for (let i = 0; i < newFormattedValue.length; i++) {
                    if (/\d/.test(newFormattedValue[i])) {
                        digitsFound++;
                    }
                    if (digitsFound === digitsBeforeCursor) {
                        newCursorPosition = i + 1;
                        break;
                    }
                    newCursorPosition = i + 1;
                }
                inputEl.setSelectionRange(newCursorPosition, newCursorPosition);
            });
        }
    }

    function handleWrappedKeyDown(event) {
        const isStrictNumeric = type === 'number' || isCurrency;

        if (isStrictNumeric) {
            const allowedKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape', 'Enter', 'Home', 'End'
            ];

            if (event.ctrlKey || event.metaKey) {
                const key = event.key.toLowerCase();
                if (key === 'a' || key === 'c' || key === 'v' || key === 'x' || key === 'z') {
                    props.onKeyDown?.(event);
                    return;
                }
            }

            if (allowedKeys.includes(event.key)) {
                props.onKeyDown?.(event);
                return;
            }

            if (event.key === '0') {
                const val = event.target.value;
                const start = event.target.selectionStart;
                const end = event.target.selectionEnd;

                if (!(start === 0 && end === val.length)) {
                    const isNegative = val.startsWith('-');
                    const startOfInt = isNegative ? 1 : 0;
                    const unsignedVal = isNegative ? val.slice(1) : val;
                    const parts = unsignedVal.split(/[,.]/);
                    const integerPart = parts[0];

                    if (start === startOfInt && integerPart.length > 0) {
                        event.preventDefault();
                        return;
                    }

                    if (integerPart === '0') {
                        const decimalIndex = val.indexOf(',');
                        const dotIndex = val.indexOf('.');
                        const separatorIndex = decimalIndex !== -1 ? decimalIndex : dotIndex;

                        if (separatorIndex === -1 || start <= separatorIndex) {
                            event.preventDefault();
                            return;
                        }
                    }
                }
            }

            const isDigit = /^[0-9]$/.test(event.key);
            const isSeparator = event.key === '.' || event.key === ',';

            if (!isDigit && !isSeparator) {
                event.preventDefault();
                return;
            }
        }

        props.onKeyDown?.(event);
    }

    function handleWrappedBlur(event) {
        isFocusedRef.current = false;

        if (readOnly || disabled) {
            props.onBlur?.(event);
            return;
        }

        let val = event.target.value;
        if (isCurrency && val !== '') {
            const formatted = formatAmountInput(val, { allowDecimal: true, isInput: true });
            setLocalValue(formatted);
        }

        const name = props.name ?? '';
        const searchStr = `${id} ${name} ${placeholder}`.toLowerCase();

        const isNumeric = type === 'number' ||
                          searchStr.includes('price') ||
                          searchStr.includes('amount') ||
                          searchStr.includes('percentage') ||
                          searchStr.includes('rate') ||
                          searchStr.includes('limit') ||
                          searchStr.includes('age') ||
                          searchStr.includes('days') ||
                          searchStr.includes('qty') ||
                          searchStr.includes('quantity') ||
                          searchStr.includes('value') ||
                          searchStr.includes('kurs') ||
                          searchStr.includes('jumlah') ||
                          searchStr.includes('persen') ||
                          searchStr.includes('nominal') ||
                          searchStr.includes('cost') ||
                          searchStr.includes('piutang') ||
                          searchStr.includes('utang') ||
                          searchStr.includes('years') ||
                          searchStr.includes('months') ||
                          searchStr.includes('tahun') ||
                          searchStr.includes('bulan') ||
                          searchStr.includes('hari') ||
                          searchStr.includes('umur') ||
                          searchStr.includes('length') ||
                          searchStr.includes('width') ||
                          searchStr.includes('height') ||
                          searchStr.includes('weight') ||
                          searchStr.includes('panjang') ||
                          searchStr.includes('lebar') ||
                          searchStr.includes('tinggi') ||
                          searchStr.includes('berat') ||
                          searchStr.includes('dimensi') ||
                          searchStr.includes('dimension') ||
                          searchStr.includes('ukuran') ||
                          searchStr.includes('size') ||
                          searchStr.includes('volume') ||
                          searchStr.includes('jarak') ||
                          searchStr.includes('tebal') ||
                          searchStr.includes('thickness');

        let finalValue = val;
        if (isNumeric) {
            const numVal = parseFloat(val);
            if (val === '0' || numVal === 0) {
                finalValue = '';
                setLocalValue('');
                if (onChange) {
                    onChange({
                        target: {
                            id: id || '',
                            name: props.name || '',
                            value: '',
                        },
                        currentTarget: {
                            id: id || '',
                            name: props.name || '',
                            value: '',
                        },
                        preventDefault: () => {
                            event.preventDefault?.();
                        },
                        stopPropagation: () => {
                            event.stopPropagation?.();
                        },
                        isDefaultPrevented: () => event.isDefaultPrevented?.() ?? false,
                        isPropagationStopped: () => event.isPropagationStopped?.() ?? false,
                        persist: () => {},
                    });
                }
            }
        }
        if (props.onBlur) {
            props.onBlur({
                target: {
                    id: id || '',
                    name: props.name || '',
                    value: finalValue,
                },
                currentTarget: {
                    id: id || '',
                    name: props.name || '',
                    value: finalValue,
                },
                preventDefault: () => {
                    event.preventDefault?.();
                },
                stopPropagation: () => {
                    event.stopPropagation?.();
                },
                isDefaultPrevented: () => event.isDefaultPrevented?.() ?? false,
                isPropagationStopped: () => event.isPropagationStopped?.() ?? false,
                persist: () => {},
            });
        }
    }

    function focusInputFromWrapper(event) {
        if (isNonInteractive) {
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
        ? !(isNonInteractive && isClearOrClose)
        : (clearable && onChange && !isNonInteractive && localValue !== undefined && localValue !== null && localValue !== '');

    const computedStyle = { ...props.style };
    if (!hasWidth && resolvedMaxLength) {
        const prefixWidth = prefix ? (typeof prefix === 'string' ? prefix.length + 2 : 5) : 0;
        const trailingWidth = showTrailing ? 3 : 2;
        const paddingBuffer = isPostal ? 10 : 2;
        const totalCh = resolvedMaxLength + prefixWidth + trailingWidth + paddingBuffer;
        computedStyle.maxWidth = `${totalCh}ch`;
    }

    return (
        <div className={`${widthClass} ${containerClassName}`.trim()} style={computedStyle}>
            <div
                onMouseDown={focusInputFromWrapper}
                aria-invalid={Boolean(resolvedError)}
                className={`group flex ${heightClass} w-full items-center overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-150 ${toneClassName} ${disabledClassName} ${isNonInteractive ? 'cursor-default' : 'cursor-text'} ${cleanedClassName}`.trim()}
            >
                {prefix ? (
                    <span
                        className={`flex h-full ${prefixMinWClass} items-center border-r border-slate-400 ${prefixPxClass} text-xs sm:text-sm ${prefixColorClass} transition-colors duration-150 group-focus-within:border-current ${disabled ? 'bg-ui-bg-panel text-gray-500' : ''} ${prefixClassName}`.trim()}
                    >
                        {prefix}
                    </span>
                ) : null}

                <input
                    ref={inputRef}
                    {...props}
                    id={id}
                    type={resolvedType}
                    inputMode={resolvedInputMode}
                    placeholder={placeholder}
                    value={localValue}
                    disabled={disabled}
                    readOnly={readOnly}
                    tabIndex={readOnly && !interactiveReadOnly ? -1 : tabIndex}
                    aria-invalid={Boolean(resolvedError)}
                    className={`h-full flex-1 min-w-0 ${inputClassName.includes('px-') || inputClassName.includes('pl-') ? '' : showTrailing ? 'pl-4 pr-1' : 'px-4'} text-xs sm:text-sm outline-none placeholder:text-disabled-border-t ${isNonInteractive ? 'cursor-default bg-ui-bg-panel text-gray-500 pointer-events-none' : resolvedError ? 'bg-transparent text-red-800' : 'text-black bg-white'} ${inputClassName}`.trim()}
                    onChange={handleWrappedChange}
                    onFocus={(e) => {
                        isFocusedRef.current = true;
                        props.onFocus?.(e);
                    }}
                    onBlur={handleWrappedBlur}
                    maxLength={resolvedMaxLength}
                    minLength={isPostal ? 5 : props.minLength}
                    min={resolvedMin}
                    onKeyDown={handleWrappedKeyDown}
                />

                {showTrailing ? (
                    <span
                        className={`flex h-full items-center ${hasTrailingPx ? '' : 'pl-1 pr-2'} transition-colors duration-150 ${isNonInteractive ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-[var(--color-input-focus)]'} ${trailingClassName}`.trim()}
                    >
                        {trailing ?? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (inputRef.current) {
                                        inputRef.current.value = '';
                                        inputRef.current.focus();
                                    }
                                    setLocalValue('');
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

            {feedbackMessage ? (
                <p className={`mt-1.5 text-[11px] sm:text-xs leading-5 ${resolvedError ? 'text-error-border' : 'text-slate-500'} ${messageClassName}`.trim()}>
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
