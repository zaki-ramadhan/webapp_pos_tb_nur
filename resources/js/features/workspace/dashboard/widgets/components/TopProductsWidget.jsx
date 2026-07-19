import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';
import { getProductImageUrl } from '@/features/workspace/dashboard/analytics/AnalyticsShared';

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

function TopProductRow({ item, index }) {
    return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] border border-chart-grid-light bg-ui-bg-hover px-2.5 py-1.5">
            <div className="relative h-9 w-9 shrink-0">
                <img
                    src={item.imageUrl || getProductImageUrl(item.name)}
                    alt={item.name}
                    className="h-9 w-9 rounded-[4px] border border-ui-border-light object-cover"
                />
                <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-blue-hover text-[9px] font-bold text-white shadow-sm">
                    {index + 1}
                </span>
            </div>
            <div className="min-w-0">
                <p className="truncate text-xs sm:text-sm font-medium text-brand-darker">{item.name}</p>
                <p className="mt-0.5 text-[11px] sm:text-xs text-text-light">
                    {item.units} • {item.share}
                </p>
            </div>
            <p className="text-right text-xs sm:text-sm font-semibold text-brand-darker">
                {item.revenue}
            </p>
        </div>
    );
}

export function TopProductsWidget({ widget }) {
    if (!(widget.items ?? []).length) {
        return (
            <DashboardWidgetEmptyState
                title="Belum ada data"
                description="Belum ada peringkat barang terlaris."
            />
        );
    }

    return (
        <div className="flex h-full flex-col gap-4 min-h-0">
            <WidgetPeriod value={widget.period} />

            <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 [scrollbar-width:thin]">
                {(widget.items ?? []).map((item, index) => (
                    <TopProductRow key={item.name} item={item} index={index} />
                ))}
            </div>
        </div>
    );
}
