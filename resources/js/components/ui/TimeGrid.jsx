export default function TimeGrid({
    data = null,
    value,
    onChange,
    allowDeselect = false,
    disabled = false,
    columns = 'grid-cols-4',
    className = '',
    slotClassName = '',
}) {
    const slots = data ?? Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const selected = value ? String(value).split(':')[0].padStart(2, '0') : null;

    const handleClick = (slot) => {
        if (disabled) return;
        const normalized = String(slot).split(':')[0].padStart(2, '0');
        if (selected === normalized) {
            if (allowDeselect) {
                onChange?.('');
            }
            return;
        }
        onChange?.(normalized);
    };

    return (
        <div className={`grid ${columns} gap-1.5 ${className}`}>
            {slots.map((slot) => {
                const normalized = String(slot).split(':')[0].padStart(2, '0');
                const isSelected = selected === normalized;

                return (
                    <button
                        key={normalized}
                        type="button"
                        onClick={() => handleClick(normalized)}
                        disabled={disabled}
                        className={`inline-flex items-center justify-center rounded-[6px] py-1.5 px-2 text-xs font-medium transition-colors cursor-pointer select-none focus:outline-hidden ${
                            isSelected
                                ? 'bg-brand-blue text-white font-semibold shadow-2xs border border-brand-blue'
                                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        } ${slotClassName}`}
                    >
                        {normalized}:00
                    </button>
                );
            })}
        </div>
    );
}
