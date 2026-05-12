export default function BrandMark({
    name,
    className = '',
    badgeClassName = '',
    textClassName = '',
    variant = 'default',
}) {
    if (variant === 'decorative') {
        return (
            <div className={`inline-flex items-center justify-center ${className}`.trim()}>
                <span
                    className={`block h-1.5 w-16 rounded-full bg-[linear-gradient(90deg,rgba(47,95,159,0.18)_0%,rgba(47,95,159,0.92)_50%,rgba(47,95,159,0.18)_100%)] shadow-[0_4px_18px_rgba(35,73,123,0.18)] ${badgeClassName}`.trim()}
                    aria-hidden="true"
                />
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2.5 text-[#35507c] ${className}`.trim()}>
            <span
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#2f5f9f_0%,#23497b_100%)] px-2 text-[12px] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_6px_14px_rgba(15,23,42,0.16)] ${badgeClassName}`.trim()}
            >
                TB
            </span>
            <span className={`text-[24px] font-bold tracking-[-0.02em] ${textClassName}`.trim()}>{name}</span>
        </div>
    );
}
