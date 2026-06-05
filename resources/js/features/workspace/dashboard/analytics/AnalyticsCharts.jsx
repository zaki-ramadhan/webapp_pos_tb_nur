import { useState, useEffect, useRef } from 'react';
import '@/features/workspace/dashboard/analytics/chartSetup';

import { Bar, Chart as ReactChart } from 'react-chartjs-2';

import { formatCompactLabel, parsePercentValue } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { buildSingleHueEmphasisPalette, toRgba } from '@/features/workspace/dashboard/widgets/dashboardChartUtils';

function usePersistentTooltip() {
    const chartRef = useRef(null);
    const [lockedElement, setLockedElement] = useState(null);

    useEffect(() => {
        const handleDocumentClick = (e) => {
            const chart = chartRef.current;
            if (chart && chart.canvas && !chart.canvas.contains(e.target)) {
                setLockedElement(null);
                chart.setActiveElements([]);
                chart.tooltip.setActiveElements([], { x: 0, y: 0 });
                chart.update();
            }
        };

        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [lockedElement]);

    const handleChartClick = (event, elements, chart) => {
        if (elements.length > 0) {
            const element = elements[0];
            const isSame =
                lockedElement &&
                lockedElement.index === element.index &&
                lockedElement.datasetIndex === element.datasetIndex;

            if (isSame) {
                setLockedElement(null);
                chart.setActiveElements([]);
                chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            } else {
                const newLock = {
                    datasetIndex: element.datasetIndex,
                    index: element.index,
                    x: event.x,
                    y: event.y,
                };
                setLockedElement(newLock);
                chart.setActiveElements([element]);
                chart.tooltip.setActiveElements([element], { x: event.x, y: event.y });
            }
            chart.update();
        } else {
            setLockedElement(null);
            chart.setActiveElements([]);
            chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            chart.update();
        }
    };

    const handleChartHover = (event, elements, chart) => {
        if (lockedElement) {
            chart.setActiveElements([lockedElement]);
            chart.tooltip.setActiveElements([lockedElement], { x: lockedElement.x, y: lockedElement.y });
        }
    };

    return {
        chartRef,
        handleChartClick,
        handleChartHover,
    };
}

const analyticsBarPaletteOptions = {
    mutedAlpha: 0.28,
    midAlpha: 0.55,
    hoverMutedAlpha: 0.44,
    hoverMidAlpha: 0.7,
};

export function AbcContributionChart({ items }) {
    const { chartRef, handleChartClick, handleChartHover } = usePersistentTooltip();
    let cumulativeShare = 0;
    const chartData = items.map((item) => {
        cumulativeShare += parsePercentValue(item.share);

        return {
            label: item.label,
            share: parsePercentValue(item.share),
            cumulative: Math.min(cumulativeShare, 100),
            itemCount: item.itemCount,
            color: item.color,
        };
    });
    const labels = chartData.map((item) => item.label);
    const shareValues = chartData.map((item) => item.share);
    const contributionColors = chartData.map((item) => item.color ?? '#6ea0df');
    const data = {
        labels,
        datasets: [
            {
                type: 'bar',
                label: 'Kontribusi',
                data: shareValues,
                backgroundColor: contributionColors,
                hoverBackgroundColor: contributionColors.map((color) => toRgba(color, 0.86)),
                borderColor: contributionColors,
                hoverBorderColor: contributionColors,
                borderWidth: 0.5,
                borderRadius: 4,
                maxBarThickness: 54,
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: handleChartClick,
        onHover: handleChartHover,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1f2536',
                bodyColor: '#62708c',
                borderColor: '#d7ddea',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label(context) {
                        const value = context.parsed.y;
                        return `Kontribusi: ${value}%`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#6f7f99',
                    font: {
                        size: 14,
                    },
                },
            },
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: '#e5ebf4',
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#6f7f99',
                    font: {
                        size: 14,
                    },
                    callback(value) {
                        return `${value}%`;
                    },
                },
            },
        },
    };

    return (
        <div className="space-y-5 rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2">
            <div className="h-[200px] rounded-[8px] border border-[#dce3ed] bg-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.04)] sm:h-[220px] lg:h-[232px]">
                <ReactChart ref={chartRef} type="bar" data={data} options={options} />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
                {chartData.map((item, index) => (
                    <div
                        key={item.label}
                        className="rounded-[7px] border border-[#dce3ed] bg-white px-3 py-2.5 shadow-[0_6px_14px_rgba(15,23,42,0.04)]"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-[#2b3650]">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="truncate">{item.label}</span>
                            </span>
                            <span className="text-sm font-semibold text-[#1f2536]">{item.share}%</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-sm text-[#75809b]">
                            <span className="truncate">{item.itemCount}</span>
                            <span>Akumulasi {Math.round(item.cumulative)}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AprioriRuleChart({ rules }) {
    const { chartRef, handleChartClick, handleChartHover } = usePersistentTooltip();
    const chartData = rules.map((rule) => ({
        id: rule.id,
        label: formatCompactLabel(rule.consequent),
        fullLabel: `${rule.antecedent} -> ${rule.consequent}`,
        confidence: parsePercentValue(rule.confidence),
        support: rule.support,
        lift: rule.lift,
        transactionBase: rule.transactionBase,
    }));
    const confidenceValues = chartData.map((item) => item.confidence);
    const confidencePalette = buildSingleHueEmphasisPalette(confidenceValues, '#6ea0df', analyticsBarPaletteOptions);
    const data = {
        labels: chartData.map((item) => item.label),
        datasets: [
            {
                label: 'Confidence',
                data: confidenceValues,
                backgroundColor: confidencePalette.backgroundColor,
                hoverBackgroundColor: confidencePalette.hoverBackgroundColor,
                borderColor: confidencePalette.borderColor,
                hoverBorderColor: confidencePalette.hoverBorderColor,
                borderWidth: 0.5,
                borderRadius: 4,
                barThickness: 32,
                maxBarThickness: 36,
            },
        ],
    };
    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        onClick: handleChartClick,
        onHover: handleChartHover,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1f2536',
                bodyColor: '#62708c',
                borderColor: '#d7ddea',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    title(items) {
                        if (!items.length) {
                            return '';
                        }

                        return chartData[items[0].dataIndex]?.fullLabel ?? '';
                    },
                    label(context) {
                        const item = chartData[context.dataIndex];

                        return [
                            `Confidence: ${context.parsed.x}%`,
                            `Support: ${item?.support ?? '0'}`,
                            `Lift: ${item?.lift ?? '0'}`,
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                min: 0,
                max: 100,
                grid: {
                    color: '#edf0f6',
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#75809b',
                    font: {
                        size: 14,
                    },
                    callback(value) {
                        return `${value}%`;
                    },
                },
            },
            y: {
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#5f6a85',
                    font: {
                        size: 14,
                    },
                },
                afterFit(scale) {
                    scale.width = 220;
                },
            },
        },
    };

    return (
        <div className="rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2">
            <div className="h-[250px] rounded-[8px] border border-[#dce3ed] bg-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.04)] sm:h-[270px] lg:h-[280px]">
                <Bar ref={chartRef} data={data} options={options} />
            </div>
        </div>
    );
}

export function IntegratedMatrixChart({ rules }) {
    const { chartRef, handleChartClick, handleChartHover } = usePersistentTooltip();
    const chartData = rules.map((rule) => {
        const ant = rule.antecedentAbc ?? 'C';
        const cons = rule.consequentAbc ?? 'C';
        let labelTactic = 'Penataan Rak';

        if (ant === 'A' && cons === 'C') {
            labelTactic = 'A → C Jual Silang';
        } else if (ant === 'A' && cons === 'A') {
            labelTactic = 'A → A Paket Bundling';
        } else if (ant === 'B' && cons === 'B') {
            labelTactic = 'B → B Paket Pelengkap';
        }

        return {
            id: rule.id,
            label: `[${ant}] ${formatCompactLabel(rule.antecedent)} → [${cons}] ${formatCompactLabel(rule.consequent)}`,
            fullLabel: `${rule.antecedent} [Kat ${ant}] → ${rule.consequent} [Kat ${cons}]`,
            confidence: parsePercentValue(rule.confidence),
            support: rule.support,
            lift: rule.lift,
            labelTactic,
        };
    });

    const confidenceValues = chartData.map((item) => item.confidence);
    const confidencePalette = buildSingleHueEmphasisPalette(confidenceValues, '#2d77d1', analyticsBarPaletteOptions);

    const data = {
        labels: chartData.map((item) => item.label),
        datasets: [
            {
                label: 'Confidence',
                data: confidenceValues,
                backgroundColor: confidencePalette.backgroundColor,
                hoverBackgroundColor: confidencePalette.hoverBackgroundColor,
                borderColor: confidencePalette.borderColor,
                hoverBorderColor: confidencePalette.hoverBorderColor,
                borderWidth: 0.5,
                borderRadius: 4,
                barThickness: 22,
                maxBarThickness: 26,
            },
        ],
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        onClick: handleChartClick,
        onHover: handleChartHover,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1f2536',
                bodyColor: '#62708c',
                borderColor: '#d7ddea',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    title(items) {
                        if (!items.length) return '';
                        return chartData[items[0].dataIndex]?.fullLabel ?? '';
                    },
                    label(context) {
                        const item = chartData[context.dataIndex];
                        return [
                            `Taktik: ${item?.labelTactic ?? '-'}`,
                            `Confidence (Peluang): ${context.parsed.x}%`,
                            `Support (Tingkat Kemunculan): ${item?.support ?? '0'}`,
                            `Lift Ratio: ${item?.lift ?? '0'}`,
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                min: 0,
                max: 100,
                grid: {
                    color: '#edf0f6',
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#75809b',
                    font: {
                        size: 14,
                    },
                    callback(value) {
                        return `${value}%`;
                    },
                },
            },
            y: {
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#1f2536',
                    font: {
                        size: 13,
                    },
                },
                afterFit(scale) {
                    scale.width = 340;
                },
            },
        },
    };

    return (
        <div className="space-y-5 rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2">
            <div className="h-[260px] rounded-[8px] border border-[#dce3ed] bg-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.04)] sm:h-[280px]">
                <Bar ref={chartRef} data={data} options={options} />
            </div>

            <div className="grid gap-3 border border-slate-100 bg-white rounded-lg p-3 shadow-[0_2px_6px_rgba(0,0,0,0.02)] grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2d77d1]" />
                    <div>
                        <p className="text-sm font-bold text-[#1f2536] leading-4">A → C Jual Silang (Fokus 100%)</p>
                        <p className="text-sm text-slate-500 mt-1">Barang aksesoris (C) dipicu produk inti (A).</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2d77d1]/75" />
                    <div>
                        <p className="text-sm font-bold text-[#1f2536] leading-4">A → A Paket Bundling (65%)</p>
                        <p className="text-sm text-slate-500 mt-1">Bundling diskon produk inti omzet terbesar.</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2d77d1]/50" />
                    <div>
                        <p className="text-sm font-bold text-[#1f2536] leading-4">B → B Paket Pelengkap (40%)</p>
                        <p className="text-sm text-slate-500 mt-1">Produk pendukung rutin yang stabil.</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2d77d1]/25" />
                    <div>
                        <p className="text-sm font-bold text-[#1f2536] leading-4">Display Rak Rakit (18%)</p>
                        <p className="text-sm text-slate-500 mt-1">Penataan letak rak berdampingan.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
