import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Bar } from 'react-chartjs-2';
import { resolveChartObject } from '@/features/workspace/dashboard/widgets/dashboardChartUtils';
import {
    BreakdownDoughnutChart,
    SummarySectionChart,
    TrendLineChart,
} from '@/features/workspace/dashboard/widgets/DashboardWidgetCharts';

export function TrendIndicator({ trend, growth, tone = null, className = '' }) {
    if (!trend) {
        return null;
    }

    const isUp = trend === 'up' || trend === 'rising' || trend === 'positive';
    const arrow = isUp ? '▲' : '▼';
    const isSuccess = tone ? tone === 'success' : isUp;
    const textClass = isSuccess ? 'text-emerald-600' : 'text-rose-600';
    const bgClass = isSuccess ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100';

    return (
        <span
            className={`inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[9px] font-medium leading-none ${textClass} ${bgClass} ${className}`}
        >
            <span>{arrow}</span>
            <span>{growth}</span>
        </span>
    );
}

function CompareText({ text }) {
    if (!text) {
        return null;
    }

    return <span className="text-[11px] md:text-xs text-text-light">{text}</span>;
}

function MetricLegendItem({ item }) {
    const { label = '', value = '0', percent = '', color = '#000' } = item;

    return (
        <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex min-w-0 items-center gap-1.5 pr-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span className="truncate text-text-light">{label}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 font-semibold text-tab-active-text">
                <span>{value}</span>
                {percent && <span className="text-[10px] sm:text-xs font-normal text-text-light">({percent})</span>}
            </div>
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
        <div className="flex flex-1 flex-col h-full min-h-0 justify-between gap-3">
            {widget.period && (
                <div className="flex justify-end text-xs font-normal items-center select-none text-black">
                    {widget.period}
                </div>
            )}
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

export function RingBreakdownMetric({ widget }) {
    const {
        percentage = '0%',
        compare,
        legend = [],
        totalLabel = '-',
        totalValue = 'Rp 0',
        trend,
        growth,
        period,
    } = widget;

    const isLoss = totalLabel.toLowerCase().includes('rugi');
    const valueColorClass = isLoss ? 'text-rose-600' : 'text-emerald-600';
    const valueClass = `text-lg font-bold leading-none ${valueColorClass} md:text-xl xl:text-2xl 2xl:text-3xl`;

    return (
        <div className="flex flex-col h-full min-h-0 justify-between gap-3 flex-1">
            {/* Header: Period */}
            {period && (
                <div className="flex justify-end text-xs font-normal items-center select-none text-black">
                    {period}
                </div>
            )}

            {/* Middle Section: Chart and Legend aligned center */}
            <div className="grid gap-4 lg:grid-cols-[164px_minmax(0,1fr)] lg:items-center lg:gap-4 min-h-0 flex-1">
                {/* Left: Chart */}
                <div className="flex flex-col items-center justify-center">
                    <BreakdownDoughnutChart items={legend} percentage={percentage} />
                </div>

                {/* Right: Legend */}
                <div className="min-h-0 overflow-y-auto flex flex-col justify-center">
                    <MetricLegendList items={legend} />
                </div>
            </div>

            {/* Footer Section: Compare (left) and Total (right) */}
            <div className="border-t border-chart-grid-light pt-2.5 text-brand-dark flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <CompareText text={compare} />
                    <TrendIndicator trend={trend} growth={growth} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-darker">{totalLabel}</span>
                    <div className="flex items-baseline gap-2">
                        <span className={valueClass}>{totalValue}</span>
                        <TrendIndicator trend={trend} growth={growth} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ExpenseBreakdownMetric({ widget }) {
    const {
        percentage = '0%',
        compare,
        legend = [],
        totalValue = 'Rp 0',
        trend,
        growth,
        period,
    } = widget;

    return (
        <div className="flex flex-col h-full min-h-0 justify-between gap-3 flex-1">
            {/* Header: Period */}
            {period && (
                <div className="flex justify-end text-xs font-normal items-center select-none text-black">
                    {period}
                </div>
            )}

            {/* Middle Section: Chart and Legend aligned center */}
            <div className="grid gap-4 lg:grid-cols-[164px_minmax(0,1fr)] lg:items-center lg:gap-4 min-h-0 flex-1">
                {/* Left: Chart */}
                <div className="flex flex-col items-center justify-center">
                    <BreakdownDoughnutChart items={legend} percentage={percentage} />
                </div>

                {/* Right: Legend */}
                <div className="min-h-0 overflow-y-auto flex flex-col justify-center">
                    <MetricLegendList items={legend} />
                </div>
            </div>

            {/* Footer Section: Compare (left) and Total (right) */}
            <div className="border-t border-chart-grid-light pt-2.5 text-brand-dark flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <CompareText text={compare} />
                    <TrendIndicator trend={trend} growth={growth} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-darker">Beban</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold leading-none text-brand-darker md:text-xl xl:text-2xl 2xl:text-3xl">{totalValue}</span>
                        <TrendIndicator trend={trend} growth={growth} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SummaryMetric({ widget }) {
    const {
        sections = [],
        headline,
        period,
    } = widget;

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

    const parseValue = (valStr) => {
        if (!valStr) return 0;
        const clean = valStr.replace(/[^\d]/g, '');
        return parseInt(clean, 10) || 0;
    };

    const renderHeadlineValue = (val) => {
        if (typeof val === 'string') {
            const clean = val.replace(/^Rp\s*/i, '');
            return (
                <span className="font-medium text-brand-darker text-base sm:text-lg md:text-xl">
                    <span className="text-xs sm:text-sm font-medium text-brand-darker mr-0.5">Rp</span>
                    {clean}
                </span>
            );
        }
        return val;
    };

    const section1 = sections[0] ?? { title: '', items: [] };
    const section2 = sections[1] ?? { title: '', items: [] };

    const sec1_item1 = section1.items[0] ?? { label: '', value: 'Rp 0', color: '#22c55e' };
    const sec1_item2 = section1.items[1] ?? { label: '', value: 'Rp 0', color: '#eab308' };

    const sec2_item1 = section2.items[0] ?? { label: '', value: 'Rp 0', color: '#f59e0b' };
    const sec2_item2 = section2.items[1] ?? { label: '', value: 'Rp 0', color: '#ef4444' };

    const val1_1 = parseValue(sec1_item1.value);
    const val1_2 = parseValue(sec1_item2.value);
    const total1 = val1_1 + val1_2;

    const val2_1 = parseValue(sec2_item1.value);
    const val2_2 = parseValue(sec2_item2.value);
    const total2 = val2_1 + val2_2;

    const getChartOptions = (total) => ({
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            },
        },
        scales: {
            x: {
                stacked: true,
                display: false,
                min: 0,
                max: total > 0 ? total : 1,
                grid: {
                    display: false,
                },
            },
            y: {
                stacked: true,
                display: false,
                grid: {
                    display: false,
                },
            },
        },
        layout: {
            padding: 0,
        },
    });

    const chart1Options = getChartOptions(total1);
    const chart2Options = getChartOptions(total2);

    const getChartData = (valA, valB, itemA, itemB, total) => {
        if (total > 0) {
            return {
                labels: ['Status'],
                datasets: [
                    {
                        label: itemA.label,
                        data: [valA],
                        backgroundColor: itemA.color,
                        borderColor: itemA.color,
                        borderWidth: 0,
                        borderRadius: 0,
                        borderSkipped: false,
                        barThickness: 36,
                    },
                    {
                        label: itemB.label,
                        data: [valB],
                        backgroundColor: itemB.color,
                        borderColor: itemB.color,
                        borderWidth: 0,
                        borderRadius: 0,
                        borderSkipped: false,
                        barThickness: 36,
                    },
                ],
            };
        }

        return {
            labels: ['Status'],
            datasets: [
                {
                    label: 'Belum ada data',
                    data: [1],
                    backgroundColor: 'var(--color-chart-grid-light)',
                    borderColor: 'var(--color-chart-grid-light)',
                    borderWidth: 0,
                    borderRadius: 0,
                    borderSkipped: false,
                    barThickness: 36,
                },
            ],
        };
    };

    const chart1Data = getChartData(val1_1, val1_2, sec1_item1, sec1_item2, total1);
    const chart2Data = getChartData(val2_1, val2_2, sec2_item1, sec2_item2, total2);

    return (
        <div className="relative flex h-full flex-col gap-4">
            <div className="grid grid-cols-2 gap-x-3 sm:gap-x-6 min-h-0 flex-1">
                {/* Left Column: Pendapatan/Pembelian */}
                <div className="flex flex-col h-full min-w-0">
                    {/* Header: Date Range */}
                    <div className="flex justify-end h-5 items-center shrink-0">
                        {period && (
                            <div className="text-[11px] sm:text-xs text-black font-normal select-none">
                                {period}
                            </div>
                        )}
                    </div>

                    {/* Headline */}
                    <div className="flex items-baseline justify-between gap-2 mt-3 shrink-0">
                        <span className="truncate text-sm sm:text-base font-medium text-tab-active-text">{resolvedHeadline.label}</span>
                        <span className="shrink-0">{renderHeadlineValue(resolvedHeadline.value)}</span>
                    </div>

                    {/* Detail Items & Chart */}
                    <div className="flex flex-col gap-0.5 mt-4 min-h-0">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-medium shrink-0">
                            <div className="flex flex-col items-start gap-1.5">
                                <span className="text-text-light font-normal text-[11px] sm:text-xs">{sec1_item1.label}</span>
                                <span style={{ color: sec1_item1.color }}>{sec1_item1.value}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="text-text-light font-normal text-[11px] sm:text-xs">{sec1_item2.label}</span>
                                <span style={{ color: sec1_item2.color }}>{sec1_item2.value}</span>
                            </div>
                        </div>
                        <div onContextMenu={(e) => e.preventDefault()} className="h-[48px] overflow-hidden shrink-0">
                            <Bar data={resolveChartObject(chart1Data)} options={resolveChartObject(chart1Options)} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Belum Lunas */}
                <div className="flex flex-col h-full min-w-0">
                    {/* Header: Hari Ini */}
                    <div className="flex justify-end h-5 items-center shrink-0">
                        <div className="text-[11px] sm:text-xs text-black font-normal">
                            Hari ini
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="flex items-baseline justify-between gap-2 mt-3 shrink-0">
                        <span className="truncate text-sm sm:text-base font-medium text-tab-active-text">{resolvedHeadline.secondaryLabel}</span>
                        <span className="shrink-0">{renderHeadlineValue(resolvedHeadline.secondaryValue)}</span>
                    </div>

                    {/* Detail Items & Chart */}
                    <div className="flex flex-col gap-0.5 mt-4 min-h-0">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-medium shrink-0">
                            <div className="flex flex-col items-start gap-1.5">
                                <span className="text-text-light font-normal text-[11px] sm:text-xs">{sec2_item1.label}</span>
                                <span style={{ color: sec2_item1.color }}>{sec2_item1.value}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="text-text-light font-normal text-[11px] sm:text-xs">{sec2_item2.label}</span>
                                <span style={{ color: sec2_item2.color }}>{sec2_item2.value}</span>
                            </div>
                        </div>
                        <div onContextMenu={(e) => e.preventDefault()} className="h-[48px] overflow-hidden shrink-0">
                            <Bar data={resolveChartObject(chart2Data)} options={resolveChartObject(chart2Options)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
