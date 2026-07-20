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
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[32px_minmax(0,1fr)_130px_90px] gap-3 items-center border-t border-table-row-border py-2 first:border-t-0 first:pt-0 last:pb-0">
            <UserAvatar
                name={row.name}
                imageUrl={row.avatarUrl}
                showStatusIndicator={false}
                className="h-8 w-8 text-[11px] shrink-0 font-semibold text-text-muted bg-bg-workspace-light"
            />
            <div className="min-w-0 ml-1.5">
                <p className="truncate text-sm font-medium text-brand-darker">{row.name}</p>
                <p className="mt-0.5 text-xs text-slate-900 truncate">{row.role}</p>
            </div>
            <div className="flex items-center gap-1.5 justify-end min-w-0">
                <span className="text-sm font-medium text-brand-darker truncate">{row.totalValue}</span>
                <span className="inline-flex shrink-0 rounded-full bg-brand-blue-light px-1.5 py-0.5 text-[11px] font-semibold text-blue-620">
                    {row.targetPercent}
                </span>
            </div>
            <div className="hidden sm:block text-right text-sm font-medium text-brand-darker truncate">
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

            <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[32px_1fr_130px_90px] gap-3 border-b border-slate-200 pb-2 text-sm font-medium text-brand-darker shrink-0">
                <span className="sm:col-start-2">Penjual</span>
                <span className="text-right">Total Penjualan</span>
                <span className="hidden sm:block text-right">Target</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-0 pr-1.5 [scrollbar-width:thin]">
                {(widget.rows ?? []).map((row) => (
                    <SalesTeamRow key={row.name} row={row} />
                ))}
            </div>
        </div>
    );
}
