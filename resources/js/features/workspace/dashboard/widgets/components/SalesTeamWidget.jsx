import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';
import UserAvatar from '@/features/workspace/shared/UserAvatar';

function WidgetPeriod({ value, align = 'right' }) {
    if (!value) {
        return null;
    }

    return (
        <div className={`text-sm text-layout-text ${align === 'right' ? 'text-right' : 'text-left'}`.trim()}>
            {value}
        </div>
    );
}

function SalesTeamRow({ row }) {
    return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-t border-table-row-border py-2 first:border-t-0 first:pt-0 last:pb-0 lg:grid-cols-[auto_minmax(0,1fr)_120px_56px] lg:items-center">
            <UserAvatar
                name={row.name}
                imageUrl={row.avatarUrl}
                showStatusIndicator={false}
                className="h-8 w-8 text-[11px] shrink-0 font-semibold text-text-muted bg-bg-workspace-light"
            />
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brand-darker">{row.name}</p>
                <p className="mt-0.5 text-xs text-slate-900">{row.role}</p>
            </div>
            <div className="col-start-2 flex items-center gap-2 lg:col-start-auto lg:justify-end">
                <span className="text-sm text-text-muted">{row.totalValue}</span>
                <span className="inline-flex rounded-full bg-brand-blue-light px-2 py-0.5 text-sm text-blue-620">
                    {row.targetPercent}
                </span>
            </div>
            <div className="col-start-2 text-left text-sm font-medium text-brand-darker lg:col-start-auto lg:text-right">
                {row.targetValue}
            </div>
        </div>
    );
}

export function SalesTeamWidget({ widget }) {
    if (!(widget.rows ?? []).length) {
        return (
            <DashboardWidgetEmptyState
                title="Belum ada data"
                description="Daftar penjual belum terdaftar."
            />
        );
    }

    return (
        <div className="flex h-full flex-col gap-4 min-h-0">
            <WidgetPeriod value={widget.period} />

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] gap-4 border-b border-table-row-border pb-2 text-sm font-semibold text-brand-darker md:grid-cols-[minmax(0,1fr)_120px_56px] shrink-0">
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
