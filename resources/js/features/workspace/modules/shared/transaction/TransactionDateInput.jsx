import { useEffect, useRef, useState } from 'react';
import Calendar from 'react-calendar';

import TextInput from '@/components/ui/TextInput';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { CalendarIcon } from '@/features/workspace/shared/Icons';

function normalizeDateValue(value) {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
        return normalizedValue;
    }

    const dateParts = normalizedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

    if (!dateParts) {
        return '';
    }

    const [, day, month, year] = dateParts;

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function formatDateValue(value) {
    const normalizedValue = normalizeDateValue(value);

    if (!normalizedValue) {
        return String(value ?? '');
    }

    const [year, month, day] = normalizedValue.split('-');

    return `${day}/${month}/${year}`;
}

function parseNormalizedDate(value) {
    const normalizedValue = normalizeDateValue(value);

    if (!normalizedValue) {
        return null;
    }

    const [year, month, day] = normalizedValue.split('-').map(Number);

    return new Date(year, month - 1, day);
}

function toNativeDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function buildTodayDate() {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function resolveCalendarDate(value) {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return value ?? null;
}

export default function TransactionDateInput({
    id,
    value,
    onChange,
    className = '',
    inputClassName = 'text-sm text-brand-dark',
    trailingClassName = 'w-[42px] shrink-0 justify-center px-0',
    disabled = false,
    ariaLabel = 'Pilih tanggal',
    ...props
}) {
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
    const defaultMaxWidth = hasMaxWidth ? '' : 'max-w-[180px]';

    const wrapperClassName = `relative ${defaultWidth} ${defaultMaxWidth} ${layoutClasses.join(' ')}`.trim();
    const hasHeight = styleClasses.some((c) => c.startsWith('h-') || c.startsWith('min-h-') || c.startsWith('max-h-'));
    const finalStyleClasses = [...new Set([
        hasHeight ? '' : 'h-[40px]',
        'rounded-[4px]',
        'border-ui-border',
        ...styleClasses,
    ])].filter(Boolean).join(' ');

    const [displayValue, setDisplayValue] = useState(() => formatDateValue(value));
    const [nativeValue, setNativeValue] = useState(() => normalizeDateValue(value));
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [activeStartDate, setActiveStartDate] = useState(() => parseNormalizedDate(value) ?? buildTodayDate());
    const autoInitializedRef = useRef(false);
    const selectedDate = parseNormalizedDate(nativeValue);
    const calendarValue = selectedDate ?? buildTodayDate();

    useEffect(() => {
        setDisplayValue(formatDateValue(value));
        setNativeValue(normalizeDateValue(value));
    }, [value]);

    useEffect(() => {
        setActiveStartDate(parseNormalizedDate(value) ?? buildTodayDate());
    }, [value]);

    useEffect(() => {
        const normalizedValue = normalizeDateValue(value);

        if (normalizedValue) {
            autoInitializedRef.current = false;
            return;
        }

        if (!onChange || disabled || autoInitializedRef.current) {
            return;
        }

        autoInitializedRef.current = true;
        applyDate(buildTodayDate());
    }, [disabled, onChange, value]);

    function applyDate(nextDate) {
        if (!nextDate) {
            return;
        }

        const nextNativeValue = toNativeDateValue(nextDate);
        const nextDisplayValue = formatDateValue(nextNativeValue);

        setDisplayValue(nextDisplayValue);
        setNativeValue(nextNativeValue);
        onChange?.(nextDisplayValue, nextNativeValue);
    }

    function handleCalendarChange(nextValue) {
        const nextDate = resolveCalendarDate(nextValue);

        if (!nextDate) {
            return;
        }

        applyDate(nextDate);
        setCalendarOpen(false);
    }

    function handleCalendarOpen() {
        setActiveStartDate(parseNormalizedDate(nativeValue) ?? buildTodayDate());
        setCalendarOpen(true);
    }

    return (
        <>
            <div className={wrapperClassName}>
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
                    onClick={handleCalendarOpen}
                    disabled={disabled}
                    aria-label={ariaLabel}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer rounded-[4px] disabled:cursor-not-allowed"
                >
                    <span className="sr-only">{ariaLabel}</span>
                </button>
            </div>
            <WorkspaceDialog
                open={calendarOpen}
                onClose={() => setCalendarOpen(false)}
                title="Pilih Tanggal"
                closeLabel="Tutup pemilih tanggal"
                maxWidthClassName="w-fit max-w-[352px]"
                contentClassName="flex justify-center bg-white px-0 pt-0 pb-4"
            >
                <Calendar
                    locale="id-ID"
                    value={calendarValue}
                    activeStartDate={activeStartDate}
                    next2Label={null}
                    prev2Label={null}
                    onChange={handleCalendarChange}
                    onActiveStartDateChange={({ activeStartDate: nextActiveStartDate }) => {
                        if (nextActiveStartDate) {
                            setActiveStartDate(nextActiveStartDate);
                        }
                    }}
                />
            </WorkspaceDialog>
        </>
    );
}
