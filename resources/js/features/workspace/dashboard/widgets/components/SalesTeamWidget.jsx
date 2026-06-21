import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';

function WidgetPeriod({ value, align = 'right' }) {
    if (!value) {
        return null;
    }

    return (
        <div className={`text-sm text-[#4f5678] ${align === 'right' ? 'text-right' : 'text-left'}`.trim()}>
            {value}
        </div>
    );
}

function SalesTeamRow({ row }) {
    const initials = row.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-t border-[#edf1f6] py-3 first:border-t-0 first:pt-0 last:pb-0 lg:grid-cols-[auto_minmax(0,1fr)_120px_56px] lg:items-center">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef2f7] text-sm font-semibold text-[#6b738f]">
                {initials}
            </span>
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#1f2536]">{row.name}</p>
                <p className="mt-1 text-sm text-[#7b8398]">{row.role}</p>
            </div>
            <div className="col-start-2 flex items-center gap-2 lg:col-start-auto lg:justify-end">
                <span className="text-sm text-[#6d7590]">{row.totalValue}</span>
                <span className="inline-flex rounded-full bg-[#dff3ff] px-2 py-0.5 text-sm text-[#1e7ec1]">
                    {row.targetPercent}
                </span>
            </div>
            <div className="col-start-2 text-left text-sm font-medium text-[#1f2536] lg:col-start-auto lg:text-right">
                {row.targetValue}
            </div>
        </div>
    );
}

export function SalesTeamWidget({ widget }) {
    if (!(widget.rows ?? []).length) {
        return <DashboardWidgetEmptyState description="Data penjual akan muncul setelah tersedia." />;
    }

    return (
        <div className="flex h-full flex-col gap-4 min-h-0">
            <WidgetPeriod value={widget.period} />

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] gap-4 border-b border-[#edf1f6] pb-2 text-sm font-semibold text-[#1f2536] md:grid-cols-[minmax(0,1fr)_120px_56px] shrink-0">
                <span>Penjual</span>
                <span className="text-right">Total Penjualan</span>
                <span className="hidden text-right md:block">Target</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-0 pr-1.5 [scrollbar-width:thin]">
                {(widget.rows ?? []).map((row) => (
                    <SalesTeamRow key={row.name} row={row} />
                ))}
            </div>
        </div>
    );
}
