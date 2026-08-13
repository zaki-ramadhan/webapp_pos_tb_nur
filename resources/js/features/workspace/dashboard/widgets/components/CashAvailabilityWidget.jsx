import { TrendLineChart } from '@/features/workspace/dashboard/widgets/DashboardWidgetCharts';
import { TrendIndicator, WidgetPeriodNavigator } from '@/features/workspace/dashboard/widgets/DashboardWidgetMetrics';

export function CashAvailabilityWidget({ widget }) {
    const balanceStr = String(widget.balanceValue ?? '');
    const isNegative =
        widget.rawBalance !== undefined
            ? Number(widget.rawBalance) < 0
            : balanceStr.includes('-') || balanceStr.includes('(') || balanceStr.startsWith('Rp -');

    return (
        <div className="flex flex-1 min-h-0 flex-col justify-between gap-3">
            {/* Top row: Date Range Navigator */}
            {widget.period && (
                <div className="flex justify-end shrink-0">
                    <WidgetPeriodNavigator periodText={widget.period} asOfDate={widget.asOfDate} widgetId={widget.id} />
                </div>
            )}

            {/* Second row: Estimasi Saldo Kas Berjalan & Nominal */}
            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 border-b border-slate-100 pb-1.5">
                <span className="text-xs sm:text-sm font-medium text-brand-darker">{widget.balanceLabel ?? 'Estimasi Saldo Kas Berjalan'}</span>
                <div className="flex items-baseline gap-2">
                    <span className={`text-base font-semibold leading-none sm:text-lg ${isNegative ? 'text-rose-600 font-bold' : 'text-brand-darker'}`}>
                        {widget.balanceValue}
                    </span>
                    <TrendIndicator trend={widget.trend} growth={widget.growth} />
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0 flex flex-col">
                <TrendLineChart
                    labels={widget.labels ?? []}
                    series={widget.series ?? []}
                    accent={isNegative ? '#e11d48' : widget.accent}
                    valueFormat={widget.valueFormat ?? 'currency'}
                    heightClassName="flex-1 min-h-[160px]"
                />
            </div>
        </div>
    );
}
