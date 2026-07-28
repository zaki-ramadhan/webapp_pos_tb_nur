export function buildGeneratedDocNumber(prefix) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map((n) => String(n).padStart(2, '0'))
        .join('');

    return prefix ? `${prefix}.${year}.${month}.${time}` : `${year}.${month}.${time}`;
}
