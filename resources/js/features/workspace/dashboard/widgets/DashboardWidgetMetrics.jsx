import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Bar } from 'react-chartjs-2';
import { resolveChartObject } from '@/features/workspace/dashboard/widgets/dashboardChartUtils';
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

function CompareText({ text }) {
    if (!text) return null;
    return (
        <p className="text-[11px] md:text-xs leading-normal text-brand-darker font-normal">
            {text}
        </p>
    );
}

function MetricLegendItem({ item }) {
    const renderFormattedValue = (val) => {
        if (typeof val === 'string' && val.startsWith('Rp ')) {
            return (
                <>
                    <span className="text-text-muted mr-1">Rp</span>
                    <span className="font-semibold text-brand-darker">{val.substring(3)}</span>
                </>
            );
        }
        return <span className="font-semibold text-brand-darker">{val}</span>;
    };

    return (
        <div className="flex items-center gap-2 text-sm text-brand-darker font-medium">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full md:h-3 md:w-3 border border-black/45" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 flex-1 break-words leading-5">{item.label}</span>
            <span className="shrink-0">
                <span className="flex items-center gap-2 text-right text-brand-darker font-semibold">
                    {renderFormattedValue(item.value)}
                    {item.percent ? (
                        <span className="inline-flex rounded-full bg-table-row-border px-2 py-0.5 text-xs font-semibold text-brand-darker">
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
    const [localWidget, setLocalWidget] = useState(widget);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    useEffect(() => {
        const getYearFromPeriod = (p) => {
            const match = p ? p.match(/\b(20\d{2})\b/) : null;
            return match ? parseInt(match[1], 10) : null;
        };
        const currentPropYear = getYearFromPeriod(widget.period);

        if (selectedYear === null || widget.id !== localWidget.id || currentPropYear === selectedYear) {
            setLocalWidget(widget);
        }
    }, [widget, selectedYear, localWidget.id]);

    const handlePrevYear = () => {
        const yearMatch = localWidget.period ? localWidget.period.match(/\b(20\d{2})\b/) : null;
        const currentYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
        fetchWidgetData(currentYear - 1);
    };

    const handleNextYear = () => {
        const yearMatch = localWidget.period ? localWidget.period.match(/\b(20\d{2})\b/) : null;
        const currentYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
        fetchWidgetData(currentYear + 1);
    };

    const fetchWidgetData = (targetYear) => {
        setIsLoading(true);
        const widgetId = localWidget.id;
        const url = `${window.location.pathname}?widget_id=${widgetId}&year=${targetYear}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.id) {
                    setLocalWidget(data);
                    
                    const getYearFromPeriod = (p) => {
                        const match = p ? p.match(/\b(20\d{2})\b/) : null;
                        return match ? parseInt(match[1], 10) : null;
                    };
                    const defaultYear = getYearFromPeriod(widget.period);
                    if (targetYear === defaultYear) {
                        setSelectedYear(null);
                    } else {
                        setSelectedYear(targetYear);
                    }
                }
            })
            .catch((err) => console.error('Failed to load widget data:', err))
            .finally(() => setIsLoading(false));
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 animate-pulse h-full">
                <div className="h-6 w-1/4 rounded bg-slate-300" />
                <div className="flex-1 rounded-[6px] bg-slate-200 min-h-[180px]" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col h-full min-h-0 justify-between gap-3">
            {localWidget.period && (
                <div className="flex justify-end text-xs font-semibold items-center gap-1 select-none">
                    <span onClick={handlePrevYear} className="text-blue-600 cursor-pointer font-bold hover:text-blue-800 p-1">‹</span>
                    <span className="text-black font-normal">{localWidget.period}</span>
                    <span onClick={handleNextYear} className="text-blue-600 cursor-pointer font-bold hover:text-blue-800 p-1">›</span>
                </div>
            )}
            <div className="flex-1 min-h-0 flex flex-col">
                <TrendLineChart
                    labels={localWidget.labels ?? []}
                    series={localWidget.series ?? []}
                    accent={localWidget.accent}
                    valueFormat={localWidget.valueFormat ?? 'number'}
                    heightClassName="flex-1 min-h-[140px]"
                />
            </div>
        </div>
    );
}

export function RingBreakdownMetric({ widget }) {
    const [localWidget, setLocalWidget] = useState(widget);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    useEffect(() => {
        const getYearFromPeriod = (p) => {
            const match = p ? p.match(/\b(20\d{2})\b/) : null;
            return match ? parseInt(match[1], 10) : null;
        };
        const currentPropYear = getYearFromPeriod(widget.period);

        if (selectedYear === null || widget.id !== localWidget.id || currentPropYear === selectedYear) {
            setLocalWidget(widget);
        }
    }, [widget, selectedYear, localWidget.id]);

    const {
        percentage = '0%',
        compare,
        legend = [],
        totalLabel = '-',
        totalValue = 'Rp 0',
        trend,
        growth,
        period,
    } = localWidget;

    const isLoss = totalLabel.toLowerCase().includes('rugi');
    const valueColorClass = isLoss ? 'text-rose-600' : 'text-brand-darker';
    const valueClass = `text-lg font-bold leading-none ${valueColorClass} md:text-xl xl:text-2xl 2xl:text-3xl`;

    const handlePrevYear = () => {
        const yearMatch = period ? period.match(/\b(20\d{2})\b/) : null;
        const currentYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
        fetchWidgetData(currentYear - 1);
    };

    const handleNextYear = () => {
        const yearMatch = period ? period.match(/\b(20\d{2})\b/) : null;
        const currentYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
        fetchWidgetData(currentYear + 1);
    };

    const fetchWidgetData = (targetYear) => {
        setIsLoading(true);
        const widgetId = localWidget.id;
        const url = `${window.location.pathname}?widget_id=${widgetId}&year=${targetYear}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.id) {
                    setLocalWidget(data);
                    
                    const getYearFromPeriod = (p) => {
                        const match = p ? p.match(/\b(20\d{2})\b/) : null;
                        return match ? parseInt(match[1], 10) : null;
                    };
                    const defaultYear = getYearFromPeriod(widget.period);
                    if (targetYear === defaultYear) {
                        setSelectedYear(null);
                    } else {
                        setSelectedYear(targetYear);
                    }
                }
            })
            .catch((err) => console.error('Failed to load widget data:', err))
            .finally(() => setIsLoading(false));
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-6 animate-pulse h-full">
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-8 border-slate-200 bg-transparent" />
                <div className="flex-1 w-full space-y-3">
                    <div className="h-4 w-3/4 rounded bg-slate-300" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="h-3 w-2/3 rounded bg-slate-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 justify-between gap-3 flex-1">
            {/* Header: Period */}
            {period && (
                <div className="flex justify-end text-xs font-semibold items-center gap-1 select-none">
                    <span onClick={handlePrevYear} className="text-blue-600 cursor-pointer font-bold hover:text-blue-800 p-1">‹</span>
                    <span className="text-black font-normal">{period}</span>
                    <span onClick={handleNextYear} className="text-blue-600 cursor-pointer font-bold hover:text-blue-800 p-1">›</span>
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
    const [localWidget, setLocalWidget] = useState(widget);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    useEffect(() => {
        const getYearFromPeriod = (p) => {
            const match = p ? p.match(/\b(20\d{2})\b/) : null;
            return match ? parseInt(match[1], 10) : null;
        };
        const currentPropYear = getYearFromPeriod(widget.period);

        if (selectedYear === null || widget.id !== localWidget.id || currentPropYear === selectedYear) {
            setLocalWidget(widget);
        }
    }, [widget, selectedYear, localWidget.id]);

    const {
        percentage = '0%',
        compare,
        legend = [],
        totalValue = 'Rp 0',
        trend,
        growth,
        period,
    } = localWidget;

    const handlePrevYear = () => {
        const yearMatch = period ? period.match(/\b(20\d{2})\b/) : null;
        const currentYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
        fetchWidgetData(currentYear - 1);
    };

    const handleNextYear = () => {
        const yearMatch = period ? period.match(/\b(20\d{2})\b/) : null;
        const currentYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
        fetchWidgetData(currentYear + 1);
    };

    const fetchWidgetData = (targetYear) => {
        setIsLoading(true);
        const widgetId = localWidget.id;
        const url = `${window.location.pathname}?widget_id=${widgetId}&year=${targetYear}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.id) {
                    setLocalWidget(data);
                    
                    const getYearFromPeriod = (p) => {
                        const match = p ? p.match(/\b(20\d{2})\b/) : null;
                        return match ? parseInt(match[1], 10) : null;
                    };
                    const defaultYear = getYearFromPeriod(widget.period);
                    if (targetYear === defaultYear) {
                        setSelectedYear(null);
                    } else {
                        setSelectedYear(targetYear);
                    }
                }
            })
            .catch((err) => console.error('Failed to load widget data:', err))
            .finally(() => setIsLoading(false));
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-6 animate-pulse h-full">
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-8 border-slate-200 bg-transparent" />
                <div className="flex-1 w-full space-y-3">
                    <div className="h-4 w-3/4 rounded bg-slate-300" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="h-3 w-2/3 rounded bg-slate-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 justify-between gap-3 flex-1">
            {/* Header: Period */}
            {period && (
                <div className="flex justify-end text-xs font-semibold items-center gap-1 select-none">
                    <span onClick={handlePrevYear} className="text-blue-600 cursor-pointer font-bold hover:text-blue-800 p-1">‹</span>
                    <span className="text-black font-normal">{period}</span>
                    <span onClick={handleNextYear} className="text-blue-600 cursor-pointer font-bold hover:text-blue-800 p-1">›</span>
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
    const [localWidget, setLocalWidget] = useState(widget);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    useEffect(() => {
        const getYearFromPeriod = (p) => {
            const match = p ? p.match(/\b(20\d{2})\b/) : null;
            return match ? parseInt(match[1], 10) : null;
        };
        const currentPropYear = getYearFromPeriod(widget.period);

        if (selectedYear === null || widget.id !== localWidget.id || currentPropYear === selectedYear) {
            setLocalWidget(widget);
        }
    }, [widget, selectedYear, localWidget.id]);

    const {
        sections = [],
        headline,
        period,
    } = localWidget;

    const handlePrevYear = () => {
        const yearMatch = period ? period.match(/\b(20\d{2})\b/) : null;
        const currentYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
        fetchWidgetData(currentYear - 1);
    };

    const handleNextYear = () => {
        const yearMatch = period ? period.match(/\b(20\d{2})\b/) : null;
        const currentYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
        fetchWidgetData(currentYear + 1);
    };

    const fetchWidgetData = (targetYear) => {
        setIsLoading(true);
        const widgetId = localWidget.id;
        const url = `${window.location.pathname}?widget_id=${widgetId}&year=${targetYear}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.id) {
                    setLocalWidget(data);
                    
                    const getYearFromPeriod = (p) => {
                        const match = p ? p.match(/\b(20\d{2})\b/) : null;
                        return match ? parseInt(match[1], 10) : null;
                    };
                    const defaultYear = getYearFromPeriod(widget.period);
                    if (targetYear === defaultYear) {
                        setSelectedYear(null);
                    } else {
                        setSelectedYear(targetYear);
                    }
                }
            })
            .catch((err) => console.error('Failed to load widget data:', err))
            .finally(() => setIsLoading(false));
    };

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
                        barThickness: 24,
                    },
                    {
                        label: itemB.label,
                        data: [valB],
                        backgroundColor: itemB.color,
                        borderColor: itemB.color,
                        borderWidth: 0,
                        borderRadius: 0,
                        borderSkipped: false,
                        barThickness: 24,
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
                    barThickness: 24,
                },
            ],
        };
    };

    const chart1Data = getChartData(val1_1, val1_2, sec1_item1, sec1_item2, total1);
    const chart2Data = getChartData(val2_1, val2_2, sec2_item1, sec2_item2, total2);

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 animate-pulse h-full justify-center">
                <div className="h-6 w-1/4 rounded bg-slate-200" />
                <div className="h-16 rounded bg-slate-100" />
                <div className="h-12 rounded bg-slate-100" />
            </div>
        );
    }

    return (
        <div className="relative flex h-full flex-col gap-4">
            <div className="grid grid-cols-2 gap-x-6 sm:gap-x-10 min-h-0 flex-1">
                {/* Left Column: Pendapatan/Pembelian */}
                <div className="flex flex-col h-full min-w-0">
                    {/* Header: Date Range */}
                    <div className="flex justify-end h-5 items-center shrink-0">
                        {period && (
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs select-none">
                                <span onClick={handlePrevYear} className="text-blue-600 cursor-pointer font-bold hover:text-blue-800 p-1">&lt;</span>
                                <span className="text-black font-normal">{period}</span>
                                <span onClick={handleNextYear} className="text-blue-600 cursor-pointer font-bold hover:text-blue-800 p-1">&gt;</span>
                            </div>
                        )}
                    </div>

                    {/* Headline */}
                    <div className="flex items-baseline justify-between gap-2 mt-1.5 shrink-0">
                        <span className="truncate text-sm sm:text-base font-medium text-tab-active-text">{resolvedHeadline.label}</span>
                        <span className="shrink-0">{renderHeadlineValue(resolvedHeadline.value)}</span>
                    </div>

                    {/* Detail Items & Chart */}
                    <div className="flex flex-col gap-0.5 mt-1.5 min-h-0">
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
                        <div onContextMenu={(e) => e.preventDefault()} className="h-[72px] overflow-hidden shrink-0">
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
                    <div className="flex items-baseline justify-between gap-2 mt-1.5 shrink-0">
                        <span className="truncate text-sm sm:text-base font-medium text-tab-active-text">{resolvedHeadline.secondaryLabel}</span>
                        <span className="shrink-0">{renderHeadlineValue(resolvedHeadline.secondaryValue)}</span>
                    </div>

                    {/* Detail Items & Chart */}
                    <div className="flex flex-col gap-0.5 mt-1.5 min-h-0">
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
                        <div onContextMenu={(e) => e.preventDefault()} className="h-[72px] overflow-hidden shrink-0">
                            <Bar data={resolveChartObject(chart2Data)} options={resolveChartObject(chart2Options)} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
