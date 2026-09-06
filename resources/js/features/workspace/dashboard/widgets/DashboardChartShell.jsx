export default function DashboardChartShell({
    children,
    heightClassName = 'h-full w-full',
    className = '',
}) {
    return (
        <div onContextMenu={(e) => e.preventDefault()} className={`relative w-full h-full min-h-0 flex-1 overflow-hidden ${heightClassName} ${className}`.trim()}>
            {children}
        </div>
    );
}
