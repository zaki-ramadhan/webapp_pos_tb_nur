import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';
import { OrderStatusStackChart } from '@/features/workspace/dashboard/widgets/DashboardWidgetCharts';

function OrderLegendItem({ item }) {
    return (
        <div className="flex items-center gap-2 text-sm text-[#374151]">
            <span className="h-4 w-10 rounded-[2px]" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
        </div>
    );
}

export function OrderStatusWidget({ widget }) {
    const segments = widget.segments ?? [];

    if (!segments.length) {
        return <DashboardWidgetEmptyState description="Status pesanan akan muncul setelah tersedia." />;
    }

    return (
        <div className="flex h-full flex-col gap-3">
            <div className="flex items-end justify-between gap-3 border-b border-[#edf1f6] pb-3 shrink-0">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1f2536] sm:text-base md:text-base">{widget.primaryLabel}</p>
                </div>
                <p className="text-base font-semibold leading-none text-[#111827] sm:text-lg md:text-xl">{widget.primaryValue}</p>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-3 min-h-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#ff4f1f] sm:text-base md:text-base">{widget.statusTitle}</p>
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
