import { Bar } from 'react-chartjs-2';
import { usePersistentTooltip } from './usePersistentTooltip';
import { formatCompactLabel, parsePercentValue } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { buildSingleHueEmphasisPalette } from '@/features/workspace/dashboard/widgets/dashboardChartUtils';

const analyticsBarPaletteOptions = {
    mutedAlpha: 0.28,
    midAlpha: 0.55,
    hoverMutedAlpha: 0.44,
    hoverMidAlpha: 0.7,
};

export default function AprioriRuleChart({ rules }) {
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
