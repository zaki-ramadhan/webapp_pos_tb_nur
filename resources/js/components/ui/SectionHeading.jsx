export default function SectionHeading({
    title,
    subtitle = null,
    align = 'center',
    className = '',
}) {
    const alignClass = align === 'left' ? 'text-left' : 'text-center';

    return (
        <div className={`${alignClass} ${className}`.trim()}>
            <h1 className="text-2xl font-semibold text-layout-text leading-tight">{title}</h1>
            {subtitle ? <p className="mt-1.5 text-xs sm:text-sm leading-normal text-slate-400">{subtitle}</p> : null}
        </div>
    );
}
