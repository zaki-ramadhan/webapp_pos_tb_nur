export function formatDisplayDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

export function buildTodayDisplayDate() {
    const today = new Date();

    return formatDisplayDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
}

export function buildFirstDayOfMonthDisplayDate() {
    const today = new Date();

    return formatDisplayDate(new Date(today.getFullYear(), today.getMonth(), 1));
}

export function buildThirtyDaysAgoDisplayDate() {
    const d = new Date();
    d.setDate(d.getDate() - 30);

    return formatDisplayDate(d);
}
