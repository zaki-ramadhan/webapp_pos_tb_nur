export default function DashboardChartShell({
    children,
    heightClassName = 'h-[200px] sm:h-[220px] lg:h-[232px]',
    className = '',
}) {
    return (
        <div onContextMenu={(e) => e.preventDefault()} className={`rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2 ${className}`.trim()}>
            <div
                className={`rounded-[8px] border border-abc-card-border bg-white p-3 shadow-abc-card ${heightClassName}`.trim()}
            >
                {children}
            </div>
        </div>
    );
}
