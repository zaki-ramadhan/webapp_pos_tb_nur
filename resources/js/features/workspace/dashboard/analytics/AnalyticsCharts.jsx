import '@/features/workspace/dashboard/analytics/chartSetup';

import { Bar, Chart as ReactChart } from 'react-chartjs-2';

import { formatCompactLabel, parsePercentValue } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { buildSingleHueEmphasisPalette, toRgba } from '@/features/workspace/dashboard/widgets/dashboardChartUtils';

const analyticsBarPaletteOptions = {
    mutedAlpha: 0.28,
    midAlpha: 0.55,
    hoverMutedAlpha: 0.44,
    hoverMidAlpha: 0.7,
};

export function AbcContributionChart({ items }) {
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
                        size: 12,
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
                        size: 12,
                    },
                    callback(value) {
                        return `${value}%`;
                    },
                },
            },
        },
    };

    return (
        <div className="space-y-3 rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2">
            <div className="h-[200px] rounded-[8px] border border-[#dce3ed] bg-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.04)] sm:h-[220px] lg:h-[232px]">
                <ReactChart type="bar" data={data} options={options} />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
                {chartData.map((item, index) => (
                    <div
                        key={item.label}
                        className="rounded-[7px] border border-[#dce3ed] bg-white px-3 py-2.5 shadow-[0_6px_14px_rgba(15,23,42,0.04)]"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex min-w-0 items-center gap-2 text-[12px] font-medium text-[#2b3650]">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="truncate">{item.label}</span>
                            </span>
                            <span className="text-[12px] font-semibold text-[#1f2536]">{item.share}%</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[#75809b]">
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
                barThickness: 26,
                maxBarThickness: 30,
            },
        ],
    };
    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
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
                            `Support: ${item?.support ?? '-'}`,
                            `Lift: ${item?.lift ?? '-'}`,
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
                        size: 12,
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
                        size: 12,
                    },
                },
            },
        },
    };

    return (
        <div className="rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2">
            <div className="h-[200px] rounded-[8px] border border-[#dce3ed] bg-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.04)] sm:h-[220px] lg:h-[232px]">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}
