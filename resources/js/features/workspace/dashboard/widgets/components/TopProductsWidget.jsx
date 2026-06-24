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
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5 rounded-[8px] border border-chart-grid-light bg-ui-bg-hover px-2.5 py-2 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
            <div className="relative h-12 w-12 shrink-0">
                <img
                    src={getProductImageUrl(item.name)}
                    alt={item.name}
                    className="h-12 w-12 rounded-[6px] border border-ui-border-light object-cover"
                />
                <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue-hover text-[10px] font-bold text-white shadow-sm">
                    {index + 1}
                </span>
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brand-darker">{item.name}</p>
                <p className="mt-1 text-sm text-text-light">
                    {item.units} • {item.share}
                </p>
            </div>
            <p className="col-start-2 text-left text-sm font-semibold text-brand-darker lg:col-start-auto lg:text-right">
                {item.revenue}
            </p>
        </div>
    );
}

export function TopProductsWidget({ widget }) {
    if (!(widget.items ?? []).length) {
        return <DashboardWidgetEmptyState description="Data produk terlaris akan muncul setelah tersedia." />;
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
