import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';
import { OrderStatusStackChart } from '@/features/workspace/dashboard/widgets/DashboardWidgetCharts';

function OrderLegendItem({ item }) {
    return (
        <div className="flex items-center gap-2 text-sm text-tab-active-text">
            <span className="h-4 w-10 rounded-[2px]" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
        </div>
    );
}

export function OrderStatusWidget({ widget }) {
    const segments = widget.segments ?? [];

    if (!segments.length) {
        return <DashboardWidgetEmptyState title="Belum ada data" description="Status pesanan belum tersedia." />;
    }

    return (
        <div className="flex h-full flex-col gap-3">
            <div className="flex items-end justify-between gap-3 border-b border-table-row-border pb-3 shrink-0">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-darker sm:text-base md:text-base">{widget.primaryLabel}</p>
                </div>
                <p className="text-base font-semibold leading-none text-text-darkest sm:text-lg md:text-xl">{widget.primaryValue}</p>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-3 min-h-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-red-650 sm:text-base md:text-base">{widget.statusTitle}</p>
                </div>

                <OrderStatusStackChart segments={segments} />

                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1">
                    {segments.map((segment) => (
                        <OrderLegendItem key={segment.label} item={segment} />
                    ))}
                </div>
            </div>
        </div>
    );
}
