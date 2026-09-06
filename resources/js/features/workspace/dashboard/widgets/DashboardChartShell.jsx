export default function DashboardChartShell({
    children,
    heightClassName = 'h-[190px] sm:h-[195px]',
    className = '',
}) {
    return (
        <div onContextMenu={(e) => e.preventDefault()} className={`relative w-full overflow-hidden ${heightClassName} ${className}`.trim()}>
            {children}
        </div>
    );
}
