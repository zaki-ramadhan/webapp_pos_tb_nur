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
    return <p className="text-sm text-text-light">{children}</p>;
}

export function CashAvailabilityWidget({ widget }) {
    return (
        <div className="flex h-full flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <span className="text-sm font-medium text-brand-darker">{widget.balanceLabel}</span>
                <div className="flex flex-wrap items-baseline gap-2 sm:justify-end">
                    <span className="text-base font-semibold leading-none text-brand-darker sm:text-lg">
                        {widget.balanceValue}
                    </span>
                    <TrendIndicator trend={widget.trend} growth={widget.growth} />
                    <WidgetPeriod value={widget.period} />
                </div>
            </div>
            <TrendLineChart
                labels={widget.labels ?? []}
                series={widget.series ?? []}
                accent={widget.accent}
                valueFormat={widget.valueFormat ?? 'currency'}
                heightClassName="h-[188px] sm:h-[200px]"
            />
        </div>
    );
}
