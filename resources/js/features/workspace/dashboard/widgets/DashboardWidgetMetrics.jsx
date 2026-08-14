import { useEffect, useRef, useState, useTransition } from 'react';
import { router } from '@inertiajs/react';
import { Bar } from 'react-chartjs-2';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveChartObject } from '@/features/workspace/dashboard/widgets/dashboardChartUtils';
import {
    BreakdownDoughnutChart,
    SummarySectionChart,
    TrendLineChart,
} from '@/features/workspace/dashboard/widgets/DashboardWidgetCharts';

export function WidgetPeriodNavigator({ periodText, asOfDate, widgetId, stepMode = 'day' }) {
    const todayStr = new Date().toISOString().split('T')[0];
    const [activeDate, setActiveDate] = useState(asOfDate || todayStr);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (asOfDate) {
            setActiveDate(asOfDate);
        }
    }, [asOfDate]);

    const isAtToday = activeDate >= todayStr;

    const navigatePeriod = async (direction) => {
        if (isLoading) return;
        const d = new Date(activeDate);
        if (stepMode === 'year') {
            d.setFullYear(d.getFullYear() + direction);
        } else {
            d.setDate(d.getDate() + direction * 7);
        }

        let nextStr = d.toISOString().split('T')[0];
        if (nextStr > todayStr) {
            nextStr = todayStr;
        }

        setIsLoading(true);
        if (widgetId) {
            window.dispatchEvent(new CustomEvent('pos:widget-loading-state', { detail: { widgetId, isLoading: true } }));
        }

        try {
            const url = widgetId
                ? `/api/workspace/dashboard/widget-data?widget_id=${widgetId}&as_of_date=${nextStr}`
                : `/api/workspace/dashboard/widgets-data?as_of_date=${nextStr}`;

            const res = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (res.ok) {
                const data = await res.json();
                setActiveDate(nextStr);
                if (data?.widget && data?.widgetId) {
                    try {
                        const savedJson = localStorage.getItem('pos_tb_nur_widget_dates');
                        const datesMap = savedJson ? JSON.parse(savedJson) : {};
                        datesMap[data.widgetId] = nextStr;
                        localStorage.setItem('pos_tb_nur_widget_dates', JSON.stringify(datesMap));
                    } catch (e) {}

                    window.dispatchEvent(new CustomEvent('pos:update-single-widget', { detail: data }));
                } else if (data?.widgets) {
                    window.dispatchEvent(new CustomEvent('pos:update-dashboard-widgets', { detail: data }));
                }
            }
        } catch (e) {
            // Handle error silently
        } finally {
            setIsLoading(false);
            if (widgetId) {
                window.dispatchEvent(new CustomEvent('pos:widget-loading-state', { detail: { widgetId, isLoading: false } }));
            }
        }
    };

    return (
        <div className="flex items-center justify-end gap-1 text-xs font-medium text-slate-600 select-none">
            <button
                type="button"
                onClick={() => navigatePeriod(-1)}
                disabled={isLoading}
                className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
            >
                <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />
            </button>
            <span className="px-1 text-[11px] sm:text-xs text-slate-700 font-medium whitespace-nowrap">
                {periodText}
            </span>
            <button
                type="button"
                onClick={() => navigatePeriod(1)}
                disabled={isLoading || isAtToday}
                className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 transition disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            </button>
        </div>
    );
}

export function TrendIndicator({ trend, growth, tone = null, className = '' }) {
    if (!trend || !growth) {
        return null;
    }

    const cleanGrowth = String(growth).trim();
    if (
        cleanGrowth === '0%' ||
        cleanGrowth === '0' ||
        cleanGrowth === '0.0%' ||
        cleanGrowth === '+0%' ||
        cleanGrowth === '-0%' ||
        trend === 'flat' ||
        trend === 'neutral' ||
        trend === 'same'
    ) {
        return null;
    }

    const isUp = trend === 'up' || trend === 'rising' || trend === 'positive';
    const arrow = isUp ? '▲' : '▼';

    // Logika Finansial: Untuk Beban Toko (tone === 'expense'), NAIK = BURUK (Merah), TURUN = HEMAT (Hijau)
    const isSuccess = tone === 'expense'
        ? !isUp
        : (tone ? tone === 'success' : isUp);

    const textClass = isSuccess ? 'text-emerald-600' : 'text-rose-600';
    const bgClass = isSuccess ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100';

    return (
        <span
            className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] font-semibold leading-none ${textClass} ${bgClass} ${className}`}
        >
            <span>{arrow}</span>
            <span>{cleanGrowth}</span>
        </span>
    );
}

function CompareText({ text }) {
    if (!text) {
        return null;
    }

    return <span className="text-[11px] md:text-xs text-black font-normal">{text}</span>;
}

function MetricLegendItem({ item }) {
    const { label = '', value = '0', percent = '', color = '#000', trend, growth, tone } = item;

    const isZeroGrowth =
        !growth ||
        growth === '0%' ||
        growth === '0' ||
        growth === '0.0%' ||
        growth === '+0%' ||
        growth === '-0%' ||
        trend === 'flat' ||
        trend === 'neutral' ||
        trend === 'same';

    let textClass = 'text-tab-active-text';
    if (!isZeroGrowth && trend) {
        const isUp = trend === 'up' || trend === 'rising' || trend === 'positive';
        const isSuccess = tone === 'expense' ? !isUp : (tone ? tone === 'success' : isUp);
        textClass = isSuccess ? 'text-emerald-600' : 'text-rose-600';
    }

    return (
        <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex min-w-0 items-center gap-1.5 pr-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span className="truncate text-black">{label}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 font-semibold">
                <span className={textClass}>{value}</span>
                {percent && <span className="text-[10px] sm:text-xs font-normal text-black">({percent})</span>}
                <TrendIndicator trend={trend} growth={growth} tone={tone} />
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
    const hasLegend = Array.isArray(widget.series) && widget.series.length > 1;

    const firstSeriesData = widget.series?.[0]?.data ?? [];
    const isNegative = firstSeriesData.some((val) => Number(val) < 0);
    const accentColor = isNegative ? '#f87171' : widget.accent;

    return (
        <div className="flex flex-1 flex-col h-full min-h-0 justify-between gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
                {/* Left side: Legend items (e.g. Kas Masuk & Kas Keluar) */}
                {hasLegend ? (
                    <div className="flex items-center gap-3 text-xs font-medium">
                        {widget.series.map((s) => (
                            <div key={s.name} className="flex items-center gap-1.5">
                                <span
                                    className="h-3 w-3 rounded-[2px] border-2 shrink-0"
                                    style={{
                                        borderColor: s.color || '#3b82f6',
                                        backgroundColor: 'transparent',
                                    }}
                                />
                                <span className="text-slate-700 text-xs font-medium">{s.name}</span>
                            </div>
                        ))}
                    </div>
                ) : <div />}

                {/* Right side: Period Navigator */}
                {widget.period && (
                    <WidgetPeriodNavigator periodText={widget.period} asOfDate={widget.asOfDate} widgetId={widget.id} stepMode={widget.stepMode ?? 'day'} />
                )}
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                <TrendLineChart
                    labels={widget.labels ?? []}
                    series={widget.series ?? []}
                    accent={accentColor}
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

    const isZeroTotal = !totalValue || totalValue === 'Rp 0' || totalValue === '0' || totalValue === 'Rp 0,00';
    const isZeroGrowth =
        !growth ||
        growth === '0%' ||
        growth === '0' ||
        growth === '0.0%' ||
        growth === '+0%' ||
        growth === '-0%' ||
        trend === 'flat' ||
        trend === 'neutral';

    const isLoss = totalLabel.toLowerCase().includes('rugi');
    const valueColorClass = (isZeroTotal || isZeroGrowth)
        ? 'text-brand-darker'
        : (isLoss ? 'text-rose-600' : 'text-emerald-600');
    const valueClass = `text-base font-semibold leading-none ${valueColorClass} sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-xl`;

    return (
        <div className="flex flex-col h-full min-h-0 justify-between gap-3 flex-1">
            {/* Header: Period Navigator (Yearly mode) */}
            {period && (
                <WidgetPeriodNavigator periodText={period} asOfDate={widget.asOfDate} widgetId={widget.id} stepMode="year" />
            )}

            {/* Middle Section: Chart and Legend aligned center */}
            <div className="grid gap-4 lg:grid-cols-[164px_minmax(0,1fr)] lg:items-center lg:gap-4 min-h-0 flex-1">
                {/* Left: Chart */}
                <div className="flex flex-col items-center justify-center">
                    <BreakdownDoughnutChart items={legend} percentage={percentage} centerLabel="Margin Laba" />
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

    const isZeroExpense = !totalValue || totalValue === 'Rp 0' || totalValue === '0' || totalValue === 'Rp 0,00';
    const isZeroGrowth =
        !growth ||
        growth === '0%' ||
        growth === '0' ||
        growth === '0.0%' ||
        growth === '+0%' ||
        growth === '-0%' ||
        trend === 'flat' ||
        trend === 'neutral';

    const isExpenseUp = trend === 'up' || trend === 'rising';
    const expenseValueColorClass = (isZeroExpense || isZeroGrowth)
        ? 'text-brand-darker'
        : (isExpenseUp ? 'text-rose-600' : 'text-emerald-600');
    const valueClass = `text-base font-semibold leading-none ${expenseValueColorClass} sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-xl`;

    return (
        <div className="flex flex-col h-full min-h-0 justify-between gap-3 flex-1">
            {/* Header: Period Navigator (Yearly mode) */}
            {period && (
                <WidgetPeriodNavigator periodText={period} asOfDate={widget.asOfDate} widgetId={widget.id} stepMode="year" />
            )}

            {/* Middle Section: Chart and Legend aligned center */}
            <div className="grid gap-4 lg:grid-cols-[164px_minmax(0,1fr)] lg:items-center lg:gap-4 min-h-0 flex-1">
                {/* Left: Chart */}
                <div className="flex flex-col items-center justify-center">
                    <BreakdownDoughnutChart items={legend} percentage={percentage} centerLabel="Porsi Utama" />
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
                    <TrendIndicator trend={trend} growth={growth} tone="expense" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-darker">Beban</span>
                    <div className="flex items-baseline gap-2">
                        <span className={valueClass}>{totalValue}</span>
                        <TrendIndicator trend={trend} growth={growth} tone="expense" />
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
                    label: 'Tidak ada data',
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
                    {/* Header: Date Range Navigator */}
                    <div className="flex justify-end h-5 items-center shrink-0">
                        {period && (
                            <WidgetPeriodNavigator periodText={period} asOfDate={widget.asOfDate} widgetId={widget.id} />
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
