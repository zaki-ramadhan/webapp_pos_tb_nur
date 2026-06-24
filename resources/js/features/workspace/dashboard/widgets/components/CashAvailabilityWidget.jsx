import { TrendLineChart } from '@/features/workspace/dashboard/widgets/DashboardWidgetCharts';
import { TrendIndicator } from '@/features/workspace/dashboard/widgets/DashboardWidgetMetrics';

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

function MetricCaption({ children }) {
    return <p className="text-sm text-blue-7c839b">{children}</p>;
}

export function CashAvailabilityWidget({ widget }) {
    return (
        <div className="flex h-full flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <MetricCaption>{widget.balanceLabel}</MetricCaption>
                    <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                        <p className="text-lg font-semibold leading-none text-brand-darker sm:text-xl md:text-2xl xl:text-2xl">
                            {widget.balanceValue}
                        </p>
                        <TrendIndicator trend={widget.trend} growth={widget.growth} />
                    </div>
                </div>
                <WidgetPeriod value={widget.period} />
            </div>
            <TrendLineChart
                labels={widget.labels ?? []}
                series={widget.series ?? []}
                accent={widget.accent}
                valueFormat={widget.valueFormat ?? 'currency'}
                heightClassName="h-[152px] sm:h-[164px]"
            />
        </div>
    );
}
