import { useMemo } from 'react';

/**
 * Reusable TimeGrid Component (inspired by Mantine TimeGrid)
 * Supports 24h/12h formats, range highlighting, strict or optional deselect, and disabled states.
 */
export default function TimeGrid({
    data = null,
    value,
    onChange,
    allowDeselect = false,
    disabled = false,
    rangeStart = null,
    rangeEnd = null,
    shouldDisableTime = null,
    format = '24h',
    columns = 'grid-cols-4 sm:grid-cols-6',
    className = '',
    slotClassName = '',
}) {
    // Generate default 24 hours if data not provided
    const slots = useMemo(() => {
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
        return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    }, [data]);

    // Parse normalized hour number (0-23)
    const normalizeHour = (val) => {
        if (val === null || val === undefined || val === '') return null;
        const num = parseInt(String(val).split(':')[0], 10);
        return isNaN(num) ? null : num;
    };

    const selectedHour = normalizeHour(value);
    const startHourNum = normalizeHour(rangeStart);
    const endHourNum = normalizeHour(rangeEnd);

    // Format display text (24h vs 12h)
    const formatDisplay = (slot) => {
        const hour = normalizeHour(slot);
        if (hour === null) return String(slot);

        if (format === '12h') {
            const period = hour >= 12 ? 'PM' : 'AM';
            const h12 = hour % 12 === 0 ? 12 : hour % 12;
            return `${String(h12).padStart(2, '0')}:00 ${period}`;
        }
        return `${String(hour).padStart(2, '0')}:00`;
    };

    const handleClick = (slot) => {
        if (disabled) return;
        if (shouldDisableTime && shouldDisableTime(slot)) return;

        const isCurrentlySelected = selectedHour === normalizeHour(slot);
        if (isCurrentlySelected) {
            if (allowDeselect) {
                onChange?.('');
            }
            return;
        }

        const normalizedSlot = String(normalizeHour(slot)).padStart(2, '0');
        onChange?.(normalizedSlot);
    };

    return (
        <div className={`grid ${columns} gap-1.5 sm:gap-2 ${className}`}>
            {slots.map((slot) => {
                const hourNum = normalizeHour(slot);
                const isSlotDisabled = disabled || (shouldDisableTime ? shouldDisableTime(slot) : false);

                const isSelected = selectedHour !== null && selectedHour === hourNum;
                const isBoundary =
                    (startHourNum !== null && startHourNum === hourNum) ||
                    (endHourNum !== null && endHourNum === hourNum);

                const isInRange =
                    startHourNum !== null &&
                    endHourNum !== null &&
                    ((startHourNum <= endHourNum && hourNum >= startHourNum && hourNum <= endHourNum) ||
                        (startHourNum > endHourNum && (hourNum >= startHourNum || hourNum <= endHourNum)));

                let slotStyle =
                    'border border-slate-200 bg-white text-slate-700 hover:border-brand-blue/50 hover:bg-slate-50';

                if (isSlotDisabled) {
                    slotStyle = 'opacity-35 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400';
                } else if (isSelected || isBoundary) {
                    slotStyle =
                        'bg-brand-blue text-white font-semibold border-brand-blue shadow-2xs ring-2 ring-brand-blue/20';
                } else if (isInRange) {
                    slotStyle =
                        'bg-blue-50/90 text-brand-blue border-blue-200/90 font-medium hover:bg-blue-100/80';
                }

                return (
                    <button
                        key={String(slot)}
                        type="button"
                        onClick={() => handleClick(slot)}
                        disabled={isSlotDisabled}
                        className={`inline-flex items-center justify-center rounded-[6px] px-2.5 py-2 text-xs sm:text-[13px] transition-all cursor-pointer select-none focus:outline-hidden ${slotStyle} ${slotClassName}`}
                    >
                        {formatDisplay(slot)}
                    </button>
                );
            })}
        </div>
    );
}
