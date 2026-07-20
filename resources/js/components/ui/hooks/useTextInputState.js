import { useEffect, useRef, useState } from 'react';
import { useFormError } from '../FormErrorContext';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';
import { sanitizeInput, unformatAmount } from '../utils/textInputHelpers';

export default function useTextInputState({
    id,
    type = 'text',
    isCurrency: isCurrencyProp,
    allowDecimal = true,
    allowNegative = false,
    placeholder = '',
    prefix = null,
    error = '',
    message = '',
    disabled = false,
    readOnly = false,
    interactiveReadOnly = false,
    onChange,
    value,
    defaultValue,
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

    const isCurrency = isCurrencyProp ?? (
                       searchStr.includes('price') ||
                       searchStr.includes('amount') ||
                       searchStr.includes('limit') ||
                       searchStr.includes('kurs') ||
                       searchStr.includes('jumlah') ||
                       searchStr.includes('nominal') ||
                       searchStr.includes('cost') ||
                       searchStr.includes('piutang') ||
                       searchStr.includes('utang') ||
                       searchStr.includes('nilai') ||
                       searchStr.includes('qty') ||
                       searchStr.includes('quantity') ||
                       searchStr.includes('kuantitas') ||
                       prefixStr === 'rp'
    );

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
            return formatAmountInput(val, { allowDecimal, allowNegative });
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
                    nextVal = formatAmountInput(nextVal, { allowDecimal, allowNegative });
                }
                setLocalValue(nextVal);
            }
        }
    }, [value, isCurrency, localValue, isEmpty, allowDecimal, allowNegative]);

    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);
    const isNonInteractive = disabled || (readOnly && !interactiveReadOnly);

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
        const sanitizedValue = sanitizeInput(originalValue, type, id, name, placeholder, prefixVal, props.lettersOnly, { isCurrency, allowDecimal, allowNegative });

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

    return {
        inputRef,
        isFocusedRef,
        localValue,
        setLocalValue,
        resolvedMaxLength,
        resolvedError,
        feedbackMessage,
        isNonInteractive,
        isCurrency,
        isPostal,
        handleWrappedChange,
        handleWrappedKeyDown,
        handleWrappedBlur,
    };
}
