export default function DashboardChartShell({
    children,
    heightClassName = 'h-[200px] sm:h-[220px] lg:h-[232px]',
    className = '',
}) {
    return (
        <div onContextMenu={(e) => e.preventDefault()} className={`w-full ${heightClassName} ${className}`.trim()}>
            {children}
        </div>
    );
}
