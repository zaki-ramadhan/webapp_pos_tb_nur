export default function DashboardChartShell({
    children,
    heightClassName = 'h-[200px] sm:h-[220px] lg:h-[232px]',
    className = '',
}) {
    return (
        <div className={`rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2 ${className}`.trim()}>
            <div
                className={`rounded-[8px] border border-[#dce3ed] bg-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.04)] ${heightClassName}`.trim()}
            >
                {children}
            </div>
        </div>
    );
}
