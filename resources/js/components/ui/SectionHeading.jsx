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
            {subtitle ? <p className="mt-0.5 text-base leading-relaxed text-slate-400">{subtitle}</p> : null}
        </div>
    );
}
