export default function BrandMark({ name, className = '', badgeClassName = '', textClassName = '' }) {
    return (
        <div className={`inline-flex items-center gap-2 text-[#5b5a67] ${className}`.trim()}>
            <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f2356d] text-base font-bold text-white shadow-[0_4px_12px_rgba(15,23,42,0.12)] ${badgeClassName}`.trim()}
            >
                A
            </span>
            <span className={`text-[26px] font-semibold italic tracking-tight ${textClassName}`.trim()}>
                {name}
            </span>
        </div>
    );
}
