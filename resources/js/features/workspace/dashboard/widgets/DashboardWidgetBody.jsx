import {
    AbcAnalysisWidget,
    AprioriAnalysisWidget,
    IntegratedAnalysisWidget,
} from '@/features/workspace/dashboard/DashboardAnalyticsWidgets';
import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';
import {
    ExpenseBreakdownMetric,
    LineTrendMetric,
    RingBreakdownMetric,
    SummaryMetric,
} from '@/features/workspace/dashboard/widgets/DashboardWidgetMetrics';
import {
    CashAvailabilityWidget,
    OrderStatusWidget,
    RecentActivityWidget,
    SalesTeamWidget,
    TopProductsWidget,
} from '@/features/workspace/dashboard/widgets/DashboardSupplementaryWidgets';
import { TrendLineChart, BreakdownDoughnutChart } from '@/features/workspace/dashboard/widgets/DashboardWidgetCharts';

function WidgetEmptyState({ widget }) {
    const emptyState = widget.emptyState ?? {};

    return (
        <DashboardWidgetEmptyState
            title={emptyState.title ?? 'Belum ada data'}
            description={emptyState.description ?? 'Data widget akan muncul setelah tersedia.'}
        />
    );
}

/** Render a chart widget that uses labels + series (line, area, bar). */
function ChartWidget({ widget }) {
    return (
        <div className="flex h-full flex-col gap-3">
            <TrendLineChart
                labels={widget.labels ?? []}
                series={widget.series ?? []}
                accent={widget.accent}
                valueFormat={widget.valueFormat ?? 'currency'}
                heightClassName="h-[220px]"
            />
        </div>
    );
}

/** Render a donut/pie widget that uses datasets + legend + summary. */
function DonutChartWidget({ widget }) {
    // Map datasets → legend items for BreakdownDoughnutChart
    const datasets = widget.datasets ?? [];
    const rawData = datasets[0]?.data ?? [];
    const bgColors = datasets[0]?.backgroundColor ?? [];
    const labels = widget.labels ?? [];

    const legendItems = labels.map((label, i) => ({
        label: widget.legend?.[i]?.label ?? label,
        value: widget.legend?.[i]?.value ?? rawData[i],
        percent: widget.legend?.[i]?.percentage,
        color: bgColors[i] ?? '#94a3b8',
    }));

    const percentage =
        widget.summary?.[0]?.percentage ??
        (rawData.length ? rawData[0] + '%' : '0%');

    return (
        <div className="flex h-full flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <BreakdownDoughnutChart items={legendItems} percentage={percentage} />
                <div className="flex flex-1 flex-col gap-2">
                    {legendItems.map((item) => (
                        <div key={item.label} className="flex items-start gap-2 text-sm text-[#4f5678]">
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="min-w-0 flex-1 break-words leading-5">{item.label}</span>
                            <span className="shrink-0 text-right text-[#5e6884]">
                                {item.value}
                                {item.percent ? (
                                    <span className="ml-1 inline-flex rounded-full bg-[#eef2f8] px-2 py-0.5 text-xs text-[#7b8299]">
                                        {item.percent}
                                    </span>
                                ) : null}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            {(widget.summary ?? []).map((s) => (
                <div key={s.label} className="mt-auto flex items-center justify-between gap-2 border-t border-[#eef2f7] pt-3">
                    <span className="text-sm text-[#6c748e]">{s.label}</span>
                    <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${s.indicatorColor ?? 'bg-green-500'}`} />
                        <span className="text-[15px] font-semibold text-[#1f2536]">{s.value}</span>
                        <span className="text-sm text-[#6c748e]">{s.percentage}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Render a summary-cards widget (primary value + grid of cards). */
function SummaryCardsWidget({ widget }) {
    const toneMap = {
        rose: 'text-rose-600 bg-rose-50',
        amber: 'text-amber-600 bg-amber-50',
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-emerald-600 bg-emerald-50',
    };

    return (
        <div className="flex h-full flex-col gap-4">
            <div className="border-b border-[#edf1f6] pb-3">
                <p className="text-sm text-[#6c748e]">{widget.primaryLabel}</p>
                <p className="mt-1 text-[20px] font-semibold text-[#1f2536] sm:text-[22px]">{widget.primaryValue}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {(widget.cards ?? []).map((card) => (
                    <div key={card.label} className={`rounded-[10px] px-3 py-3 ${toneMap[card.tone] ?? 'text-[#1f2536] bg-[#f7f9fc]'}`}>
                        <p className="text-xs font-medium">{card.label}</p>
                        <p className="mt-1 text-[15px] font-semibold leading-tight">{card.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Render an activity-list widget (date + title list). */
function ActivityListWidget({ widget }) {
    const items = widget.items ?? [];

    if (!items.length) {
        return <DashboardWidgetEmptyState description="Belum ada kegiatan yang terdaftar." />;
    }

    return (
        <div className="flex h-full flex-col gap-0">
            {items.map((item, index) => (
                <div key={item.id ?? index} className="flex gap-4 border-b border-[#edf1f6] py-3 first:pt-0 last:border-b-0 last:pb-0">
                    <div className="shrink-0 rounded-[8px] bg-[#f0f4fb] px-3 py-2 text-center">
                        <p className="text-xs text-[#7b8398]">{item.date}</p>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center">
                        <p className="text-sm text-[#1f2536] leading-snug">{item.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function DashboardWidgetBody({
    widget,
    analyticsDetailsExpanded,
    onToggleAnalyticsDetails,
}) {
    if (widget.emptyState?.enabled) {
        return <WidgetEmptyState widget={widget} />;
    }

    if (widget.type === 'note') {
        return (
            <DashboardWidgetEmptyState
                title={widget.noteTitle ?? 'Belum ada data'}
                description={widget.noteDescription ?? widget.note ?? 'Data widget belum tersedia.'}
            />
        );
    }

    if (widget.type === 'blank') {
        return <WidgetEmptyState widget={widget} />;
    }

    // --- Legacy types (used by older widget configs) ---
    if (widget.type === 'line') return <LineTrendMetric widget={widget} />;
    if (widget.type === 'ring-breakdown') {
        return (
            <RingBreakdownMetric
                percentage={widget.percentage}
                compare={widget.compare}
                legend={widget.legend}
                totalLabel={widget.totalLabel}
                totalValue={widget.totalValue}
                trend={widget.trend}
                growth={widget.growth}
            />
        );
    }
    if (widget.type === 'expense') {
        return (
            <ExpenseBreakdownMetric
                percentage={widget.percentage}
                compare={widget.compare}
                legend={widget.legend}
                totalValue={widget.totalValue}
                trend={widget.trend}
                growth={widget.growth}
            />
        );
    }
    if (widget.type === 'summary') return <SummaryMetric sections={widget.sections ?? []} headline={widget.headline ?? {}} />;

    // --- Current backend types ---
    if (widget.type === 'line-chart' || widget.type === 'area-chart' || widget.type === 'bar-chart') {
        return <ChartWidget widget={widget} />;
    }
    if (widget.type === 'donut-chart' || widget.type === 'pie-chart') {
        return <DonutChartWidget widget={widget} />;
    }
    if (widget.type === 'summary-cards') return <SummaryCardsWidget widget={widget} />;
    if (widget.type === 'performance-table' || widget.type === 'sales-team') return <SalesTeamWidget widget={widget} />;
    if (widget.type === 'product-share-list' || widget.type === 'top-products') return <TopProductsWidget widget={widget} />;
    if (widget.type === 'cash-availability') return <CashAvailabilityWidget widget={widget} />;
    if (widget.type === 'order-status') return <OrderStatusWidget widget={widget} />;
    if (widget.type === 'recent-activity' || widget.type === 'activity-timeline') return <RecentActivityWidget widget={widget} />;
    if (widget.type === 'activity-list') return <ActivityListWidget widget={widget} />;

    // --- Analytics ---
    if (widget.type === 'abc-analysis') {
        return <AbcAnalysisWidget widget={widget} expanded={analyticsDetailsExpanded} onToggle={onToggleAnalyticsDetails} />;
    }
    if (widget.type === 'apriori-analysis') {
        return <AprioriAnalysisWidget widget={widget} expanded={analyticsDetailsExpanded} onToggle={onToggleAnalyticsDetails} />;
    }
    if (widget.type === 'integrated-analysis') {
        return <IntegratedAnalysisWidget widget={widget} expanded={analyticsDetailsExpanded} onToggle={onToggleAnalyticsDetails} />;
    }

    return null;
}
