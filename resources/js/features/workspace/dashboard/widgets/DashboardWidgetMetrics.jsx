import {
    BreakdownDoughnutChart,
    SummarySectionChart,
    TrendLineChart,
} from '@/features/workspace/dashboard/widgets/DashboardWidgetCharts';

export function TrendIndicator({ trend, growth, className = '' }) {
    if (!trend) {
        return null;
    }

    const isUp = trend === 'up' || trend === 'rising' || trend === 'positive';
    const arrow = isUp ? '▲' : '▼';
    const textClass = isUp ? 'text-emerald-600' : 'text-rose-600';
    const bgClass = isUp ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100';

    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${bgClass} ${textClass} ${className}`.trim()}>
            <span>{arrow}</span>
            {growth ? <span>{growth}</span> : null}
        </span>
    );
}

const compactHeadlineLabelClassName = 'text-sm text-[#6c748e]';
const compactHeadlineValueClassName =
    'text-[18px] font-semibold leading-none text-[#1f2536] md:text-[21px] xl:text-[23px] 2xl:text-[28px]';

function MetricLegendItem({ item }) {
    return (
        <div className="flex items-start gap-2 text-sm text-[#4f5678]">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full md:h-3 md:w-3" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 flex-1 break-words leading-5">{item.label}</span>
            <span className="shrink-0">
                <span className="flex items-center gap-2 text-right text-[#5e6884]">
                    <span>{item.value}</span>
                    {item.percent ? (
                        <span className="inline-flex rounded-full bg-[#eef2f8] px-2 py-0.5 text-sm text-[#7b8299]">
                            {item.percent}
                        </span>
                    ) : null}
                </span>
                {item.percent ? (
                    <span className="sr-only">{item.percent}</span>
                ) : null}
            </span>
        </div>
    );
}

function MetricLegendList({ items = [] }) {
    return (
        <div className="space-y-2">
            {items.map((item) => <MetricLegendItem key={item.label} item={item} />)}
        </div>
    );
}

export function LineTrendMetric({ widget }) {
    return (
        <div className="h-[228px] min-w-0 overflow-hidden">
            {widget.period ? (
                <div className="mb-6 flex justify-start text-sm text-[#5d637d] sm:justify-end">{widget.period}</div>
            ) : null}
            <TrendLineChart
                labels={widget.labels ?? []}
                series={widget.series ?? []}
                accent={widget.accent}
                valueFormat={widget.valueFormat ?? 'number'}
                heightClassName="h-[142px] sm:h-[152px]"
            />
        </div>
    );
}

export function RingBreakdownMetric({
    percentage = '0%',
    compare,
    legend = [],
    totalLabel = '-',
    totalValue = 'Rp 0',
    trend,
    growth,
}) {
    return (
        <div className="grid gap-4 lg:grid-cols-[156px_minmax(0,1fr)] lg:items-start lg:gap-4">
            <div className="flex flex-col justify-between gap-3">
                <BreakdownDoughnutChart items={legend} percentage={percentage} />
                <div className="flex items-center gap-1.5 flex-wrap">
                    {compare ? <p className="text-sm leading-5 text-[#6b738f]">{compare}</p> : null}
                    <TrendIndicator trend={trend} growth={growth} />
                </div>
            </div>

            <div className="flex h-full flex-col">
                <MetricLegendList items={legend} />

                <div className="mt-auto border-t border-[#e6ebf4] pt-4 text-[#1e2437]">
                    <div className="text-left sm:text-right">
                        <p className={compactHeadlineLabelClassName}>{totalLabel}</p>
                        <div className="mt-1 flex items-baseline justify-start gap-2 sm:justify-end flex-wrap">
                            <p className={compactHeadlineValueClassName}>{totalValue}</p>
                            <TrendIndicator trend={trend} growth={growth} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ExpenseBreakdownMetric({
    percentage = '0%',
    compare,
    legend = [],
    totalValue = 'Rp 0',
    trend,
    growth,
}) {
    return (
        <div className="grid gap-4 lg:grid-cols-[156px_minmax(0,1fr)] lg:items-start lg:gap-4">
            <div className="flex flex-col justify-between gap-3">
                <BreakdownDoughnutChart items={legend} percentage={percentage} />
                <div className="flex items-center gap-1.5 flex-wrap">
                    {compare ? <p className="text-sm leading-5 text-[#6b738f]">{compare}</p> : null}
                    <TrendIndicator trend={trend} growth={growth} />
                </div>
            </div>

            <div>
                <div className="flex flex-col gap-3 border-b border-[#edf0f6] pb-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h4 className="text-[15px] font-semibold text-[#1f2536] md:text-[17px]">Beban</h4>
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <p className={compactHeadlineValueClassName}>{totalValue}</p>
                        <TrendIndicator trend={trend} growth={growth} />
                    </div>
                </div>

                <div className="mt-4">
                    <MetricLegendList items={legend} />
                </div>
            </div>
        </div>
    );
}

export function SummaryMetric({ sections = [], headline }) {
    const resolvedHeadline = {
        label: headline?.label ?? '-',
        value: headline?.value ?? 'Rp 0',
        secondaryLabel: headline?.secondaryLabel ?? '-',
        secondaryValue: headline?.secondaryValue ?? 'Rp 0',
        trend: headline?.trend,
        growth: headline?.growth,
        secondaryTrend: headline?.secondaryTrend,
        secondaryGrowth: headline?.secondaryGrowth,
    };

    return (
        <div className="flex h-full flex-col gap-3">
            <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between 2xl:gap-4">
                <div className="grid flex-1 gap-3 lg:grid-cols-2">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-[14px] font-semibold text-[#1f2536] md:text-[15px] xl:text-[16px]">{section.title}</h4>
                            <div className="mt-2.5 space-y-1.5">
                                {section.items.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between gap-2.5 text-sm">
                                        <span className="text-[#747c95]">{item.label}</span>
                                        <span className="font-medium" style={{ color: item.color ?? '#1f2536' }}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="min-w-0 border-t border-[#eef2f7] pt-3 2xl:min-w-[178px] 2xl:border-t-0 2xl:pt-0">
                    <div className="space-y-2.5">
                        <div className="flex items-end justify-between gap-2.5 2xl:flex-col 2xl:items-end 2xl:gap-1">
                            <p className={compactHeadlineLabelClassName}>{resolvedHeadline.label}</p>
                            <div className="flex items-baseline gap-2 flex-wrap justify-end">
                                <p className={compactHeadlineValueClassName}>{resolvedHeadline.value}</p>
                                <TrendIndicator trend={resolvedHeadline.trend} growth={resolvedHeadline.growth} />
                            </div>
                        </div>
                        <div className="flex items-end justify-between gap-2.5 border-t border-[#eef2f7] pt-2.5 2xl:flex-col 2xl:items-end 2xl:gap-1">
                            <p className="text-sm text-[#6c748e]">{resolvedHeadline.secondaryLabel}</p>
                            <div className="flex items-baseline gap-2 flex-wrap justify-end">
                                <p className="text-[16px] font-semibold leading-none text-[#1f2536] md:text-[18px] xl:text-[20px] 2xl:text-[22px]">
                                    {resolvedHeadline.secondaryValue}
                                </p>
                                <TrendIndicator trend={resolvedHeadline.secondaryTrend} growth={resolvedHeadline.secondaryGrowth} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <SummarySectionChart sections={sections} valueFormat="currency" />
            </div>
        </div>
    );
}
