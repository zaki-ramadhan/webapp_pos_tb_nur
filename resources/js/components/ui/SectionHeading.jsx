export default function SectionHeading({
    title,
    subtitle = null,
    align = 'center',
    className = '',
}) {
    const alignClass = align === 'left' ? 'text-left' : 'text-center';

    return (
        <div className={`${alignClass} ${className}`.trim()}>
            <h1 className="text-[22px] font-semibold text-[#56527b]">{title}</h1>
            {subtitle ? <p className="mt-1 text-lg text-slate-400">{subtitle}</p> : null}
        </div>
    );
}
