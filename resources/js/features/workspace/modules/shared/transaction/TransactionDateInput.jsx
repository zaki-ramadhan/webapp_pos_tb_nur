import { useEffect, useRef, useState } from 'react';

import PortalDropdown from '@/components/ui/PortalDropdown';
import TextInput from '@/components/ui/TextInput';
import { CalendarIcon } from '@/features/workspace/shared/Icons';
import DatePickerPopover from './DatePickerPopover';
import {
    formatYmd,
    normalizeDateValue,
    parseDate,
} from './datePickerUtils';

function formatDateValue(value, format = 'DD/MM/YYYY') {
    const normalizedValue = normalizeDateValue(value);

    if (!normalizedValue) {
        return String(value ?? '');
    }

    const [year, month, day] = normalizedValue.split('-');

    if (format === 'YYYY-MM-DD') {
        return normalizedValue;
    }

    return `${day}/${month}/${year}`;
}

function buildTodayDate() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export default function TransactionDateInput({
    id,
    value,
    onChange,
    minDate,
    maxDate,
    presets = true,
    clearable = false,
    format = 'DD/MM/YYYY',
    align = 'start',
    className = '',
    inputClassName = 'text-sm text-brand-dark',
    trailingClassName = 'w-[42px] shrink-0 justify-center px-0',
    disabled = false,
    ariaLabel = 'Pilih tanggal',
    disableAutoInit = false,
    ...props
}) {
    const parsedMinDate = minDate instanceof Date ? minDate : (minDate ? parseDate(minDate) : null);
    const parsedMaxDate = maxDate instanceof Date ? maxDate : (maxDate ? parseDate(maxDate) : null);

    const classes = className.split(' ').filter(Boolean);
    const layoutClasses = [];
    const styleClasses = [];

    classes.forEach((c) => {
        if (
            c.startsWith('w-') ||
            c.startsWith('max-w-') ||
            c.startsWith('min-w-') ||
            c.startsWith('m-') ||
            c.startsWith('mx-') ||
            c.startsWith('my-') ||
            c.startsWith('mt-') ||
            c.startsWith('mb-') ||
            c.startsWith('ml-') ||
            c.startsWith('mr-')
        ) {
            layoutClasses.push(c);
        } else {
            styleClasses.push(c);
        }
    });

    const hasWidth = layoutClasses.some((c) => c.startsWith('w-'));
    const hasMaxWidth = layoutClasses.some((c) => c.startsWith('max-w-'));

    const defaultWidth = hasWidth ? '' : 'w-full';
    const defaultMaxWidth = hasMaxWidth ? '' : 'max-w-[160px]';

    const wrapperClassName = `relative ${defaultWidth} ${defaultMaxWidth} ${layoutClasses.join(' ')}`.trim();
    const hasHeight = styleClasses.some((c) => c.startsWith('h-') || c.startsWith('min-h-') || c.startsWith('max-h-'));
    const finalStyleClasses = [...new Set([
        hasHeight ? '' : 'h-[40px]',
        'rounded-[4px]',
        'border-ui-border',
        ...styleClasses,
    ])].filter(Boolean).join(' ');

    const wrapperRef = useRef(null);
    const [displayValue, setDisplayValue] = useState(() => formatDateValue(value, format));
    const [nativeValue, setNativeValue] = useState(() => normalizeDateValue(value));
    const [calendarOpen, setCalendarOpen] = useState(false);
    const autoInitializedRef = useRef(false);
    const selectedDate = parseDate(nativeValue);

    useEffect(() => {
        setDisplayValue(formatDateValue(value, format));
        setNativeValue(normalizeDateValue(value));
    }, [value, format]);

    useEffect(() => {
        if (parsedMinDate && nativeValue) {
            const current = parseDate(nativeValue);
            if (current && current < parsedMinDate) {
                applyDate(parsedMinDate);
            }
        }
    }, [parsedMinDate]);

    useEffect(() => {
        if (parsedMaxDate && nativeValue) {
            const current = parseDate(nativeValue);
            if (current && current > parsedMaxDate) {
                applyDate(parsedMaxDate);
            }
        }
    }, [parsedMaxDate]);

    useEffect(() => {
        const normalizedValue = normalizeDateValue(value);

        if (normalizedValue) {
            autoInitializedRef.current = false;
            return;
        }

        if (disableAutoInit || !onChange || disabled || autoInitializedRef.current) {
            return;
        }

        autoInitializedRef.current = true;
        const defaultInitDate = parsedMinDate && buildTodayDate() < parsedMinDate ? parsedMinDate : buildTodayDate();
        applyDate(defaultInitDate);
    }, [disabled, onChange, value, disableAutoInit, parsedMinDate]);

    function applyDate(nextDate) {
        if (!nextDate) {
            return;
        }

        let clampedDate = nextDate;
        if (parsedMinDate && clampedDate < parsedMinDate) {
            clampedDate = parsedMinDate;
        }
        if (parsedMaxDate && clampedDate > parsedMaxDate) {
            clampedDate = parsedMaxDate;
        }

        const nextNativeValue = formatYmd(clampedDate);
        const nextDisplayValue = formatDateValue(nextNativeValue, format);

        setDisplayValue(nextDisplayValue);
        setNativeValue(nextNativeValue);
        onChange?.(nextDisplayValue, nextNativeValue);
    }

    function handleDateSelect(ymd) {
        const nextDate = parseDate(ymd);
        if (!nextDate) return;
        applyDate(nextDate);
        setCalendarOpen(false);
    }

    function handleClear() {
        setDisplayValue('');
        setNativeValue('');
        onChange?.('', '');
        setCalendarOpen(false);
    }

    return (
        <>
            <div ref={wrapperRef} className={wrapperClassName}>
                <TextInput
                    value={displayValue}
                    readOnly
                    interactiveReadOnly
                    disabled={disabled}
                    trailing={<CalendarIcon className="h-4 w-4 -translate-x-px text-brand-dark" />}
                    className={finalStyleClasses}
                    inputClassName={`cursor-pointer ${inputClassName}`.trim()}
                    trailingClassName={`pointer-events-none ${trailingClassName}`.trim()}
                    {...props}
                />
                <button
                    id={id}
                    type="button"
                    onClick={() => !disabled && setCalendarOpen((prev) => !prev)}
                    disabled={disabled}
                    aria-label={ariaLabel}
                    aria-expanded={calendarOpen}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer rounded-[4px] disabled:cursor-not-allowed"
                >
                    <span className="sr-only">{ariaLabel}</span>
                </button>
            </div>

            <PortalDropdown
                open={calendarOpen}
                onClose={() => setCalendarOpen(false)}
                anchorRef={wrapperRef}
                align={align}
                side="auto"
                minHeightNeeded={380}
                maxHeightLimit={520}
                className="border border-slate-200 rounded-[8px] shadow-2xl bg-white overflow-hidden"
                panelClassName="overflow-hidden"
            >
                <DatePickerPopover
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                    onClose={() => setCalendarOpen(false)}
                    minDate={parsedMinDate}
                    maxDate={parsedMaxDate}
                    presets={presets}
                    clearable={clearable}
                    onClear={handleClear}
                />
            </PortalDropdown>
        </>
    );
}
