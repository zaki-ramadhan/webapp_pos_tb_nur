export const INDONESIAN_MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

export const INDONESIAN_SHORT_MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
];

export const INDONESIAN_WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function formatYmd(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function normalizeDateValue(value) {
    const d = parseDate(value);
    return d ? formatYmd(d) : '';
}

export function parseDate(value) {
    if (!value) return null;
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    const str = String(value).trim();
    if (!str) return null;

    const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
        const [, y, m, d] = ymdMatch;
        return new Date(Number(y), Number(m) - 1, Number(d));
    }

    const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmyMatch) {
        const [, d, m, y] = dmyMatch;
        return new Date(Number(y), Number(m) - 1, Number(d));
    }

    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function formatDateDisplay(value, format = 'DD/MM/YYYY') {
    const date = parseDate(value);
    if (!date) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
    }

    if (format === 'long') {
        return `${date.getDate()} ${INDONESIAN_MONTHS[date.getMonth()]} ${year}`;
    }

    return `${day}/${month}/${year}`;
}

export function isSameDay(d1, d2) {
    if (!d1 || !d2) return false;
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

export function isDateDisabled(date, minDate, maxDate) {
    if (!date) return false;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
}

export function getCalendarGrid(year, month, selectedDate, minDate, maxDate) {
    const today = new Date();
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = startWeekday - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const d = new Date(year, month - 1, day);
        cells.push({
            date: d,
            dayNumber: day,
            isCurrentMonth: false,
            isToday: isSameDay(d, todayNormalized),
            isSelected: isSameDay(d, selectedDate),
            isDisabled: isDateDisabled(d, minDate, maxDate),
            ymd: formatYmd(d),
        });
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        cells.push({
            date: dateObj,
            dayNumber: d,
            isCurrentMonth: true,
            isToday: isSameDay(dateObj, todayNormalized),
            isSelected: isSameDay(dateObj, selectedDate),
            isDisabled: isDateDisabled(dateObj, minDate, maxDate),
            ymd: formatYmd(dateObj),
        });
    }

    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
        const dateObj = new Date(year, month + 1, d);
        cells.push({
            date: dateObj,
            dayNumber: d,
            isCurrentMonth: false,
            isToday: isSameDay(dateObj, todayNormalized),
            isSelected: isSameDay(dateObj, selectedDate),
            isDisabled: isDateDisabled(dateObj, minDate, maxDate),
            ymd: formatYmd(dateObj),
        });
    }

    return cells;
}

export function getDefaultIndonesianPresets() {
    const today = new Date();
    const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return [
        {
            label: 'Kemarin',
            getDate: () => new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        },
        {
            label: 'Hari ini',
            getDate: () => new Date(now),
        },
        {
            label: 'Besok',
            getDate: () => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
        {
            label: 'Awal bulan',
            getDate: () => new Date(now.getFullYear(), now.getMonth(), 1),
        },
        {
            label: 'Akhir bulan',
            getDate: () => new Date(now.getFullYear(), now.getMonth() + 1, 0),
        },
        {
            label: 'Bulan lalu',
            getDate: () => new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
        },
        {
            label: 'Bulan depan',
            getDate: () => new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
        },
    ];
}
