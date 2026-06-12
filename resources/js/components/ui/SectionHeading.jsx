export default function SectionHeading({
    title,
    subtitle = null,
    align = 'center',
    className = '',
}) {
    const alignClass = align === 'left' ? 'text-left' : 'text-center';

    return (
        <div className={`${alignClass} ${className}`.trim()}>
            <h1 className="text-[22px] font-semibold text-[#56527b] leading-tight">{title}</h1>
            {subtitle ? <p className="mt-0.5 text-[15px] leading-relaxed text-slate-400">{subtitle}</p> : null}
        </div>
    );
}
