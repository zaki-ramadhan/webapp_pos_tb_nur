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

const compactHeadlineLabelClassName = 'text-sm text-text-muted';
const compactHeadlineValueClassName =
    'text-lg font-semibold leading-none text-brand-darker md:text-xl xl:text-2xl 2xl:text-3xl';

function MetricLegendItem({ item }) {
    return (
        <div className="flex items-start gap-2 text-sm text-layout-text">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full md:h-3 md:w-3" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 flex-1 break-words leading-5">{item.label}</span>
            <span className="shrink-0">
                <span className="flex items-center gap-2 text-right text-tab-view-active-text">
                    <span>{item.value}</span>
                    {item.percent ? (
                        <span className="inline-flex rounded-full bg-table-row-border px-2 py-0.5 text-sm text-text-light">
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
        <div className="flex flex-1 flex-col h-full min-h-0 justify-between">
            {widget.period ? (
                <div className="mb-3 flex justify-start text-sm text-tab-inactive-text sm:justify-end">{widget.period}</div>
            ) : null}
            <div className="flex-1 min-h-0 flex flex-col">
                <TrendLineChart
                    labels={widget.labels ?? []}
                    series={widget.series ?? []}
                    accent={widget.accent}
                    valueFormat={widget.valueFormat ?? 'number'}
                    heightClassName="flex-1 min-h-[140px]"
                />
            </div>
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
        <div className="grid gap-4 lg:grid-cols-[164px_minmax(0,1fr)] lg:items-stretch lg:gap-4 h-full min-h-0 flex-1">
            <div className="flex flex-col justify-center items-center gap-3 h-full pb-1 text-center">
                <BreakdownDoughnutChart items={legend} percentage={percentage} />
                {compare || trend || growth ? (
                    <div className="flex items-center gap-1.5 flex-wrap justify-center mt-1">
                        {compare ? <p className="text-sm leading-5 text-text-muted">{compare}</p> : null}
                        <TrendIndicator trend={trend} growth={growth} />
                    </div>
                ) : null}
            </div>

            <div className="flex h-full flex-col justify-center gap-3">
                <div className="min-h-0 overflow-y-auto">
                    <MetricLegendList items={legend} />
                </div>

                <div className="border-t border-chart-grid-light pt-2.5 text-brand-dark">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={compactHeadlineLabelClassName}>{totalLabel}</span>
                        <div className="flex items-baseline gap-2">
                            <span className={compactHeadlineValueClassName}>{totalValue}</span>
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
        <div className="grid gap-4 lg:grid-cols-[164px_minmax(0,1fr)] lg:items-stretch lg:gap-4 h-full min-h-0 flex-1">
            <div className="flex flex-col justify-center items-center gap-3 h-full pb-1 text-center">
                <BreakdownDoughnutChart items={legend} percentage={percentage} />
                {compare || trend || growth ? (
                    <div className="flex items-center gap-1.5 flex-wrap justify-center mt-1">
                        {compare ? <p className="text-sm leading-5 text-text-muted">{compare}</p> : null}
                        <TrendIndicator trend={trend} growth={growth} />
                    </div>
                ) : null}
            </div>

            <div className="flex h-full flex-col justify-center gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-table-row-border pb-2.5 text-brand-dark">
                    <span className={compactHeadlineLabelClassName}>Beban</span>
                    <div className="flex items-baseline gap-2">
                        <span className={compactHeadlineValueClassName}>{totalValue}</span>
                        <TrendIndicator trend={trend} growth={growth} />
                    </div>
                </div>

                <div className="min-h-0 overflow-y-auto">
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
                <div className="grid flex-1 gap-x-10 gap-y-3.5 lg:grid-cols-2">
                    {sections.map((section, idx) => (
                        <div key={section.title} className={idx === 0 ? 'lg:border-r lg:border-bg-workspace-light lg:pr-8' : 'lg:pl-2'}>
                            <h4 className="text-sm font-semibold text-brand-darker md:text-base xl:text-base">{section.title}</h4>
                            <div className="mt-2.5 space-y-1.5">
                                {section.items.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between gap-2.5 text-sm">
                                        <span className="text-chart-ticks">{item.label}</span>
                                        <span className="font-medium" style={{ color: item.color ?? 'var(--color-brand-darker)' }}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="min-w-0 border-t border-bg-workspace-light pt-3 2xl:min-w-[178px] 2xl:border-t-0 2xl:pt-0">
                    <div className="space-y-2.5">
                        <div className="flex items-end justify-between gap-2.5 2xl:flex-col 2xl:items-end 2xl:gap-1">
                            <p className={compactHeadlineLabelClassName}>{resolvedHeadline.label}</p>
                            <div className="flex items-baseline gap-2 flex-wrap justify-end">
                                <p className={compactHeadlineValueClassName}>{resolvedHeadline.value}</p>
                                <TrendIndicator trend={resolvedHeadline.trend} growth={resolvedHeadline.growth} />
                            </div>
                        </div>
                        <div className="flex items-end justify-between gap-2.5 border-t border-bg-workspace-light pt-2.5 2xl:flex-col 2xl:items-end 2xl:gap-1">
                            <p className="text-sm text-text-muted">{resolvedHeadline.secondaryLabel}</p>
                            <div className="flex items-baseline gap-2 flex-wrap justify-end">
                                <p className="text-base font-semibold leading-none text-brand-darker md:text-lg xl:text-xl 2xl:text-2xl">
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
