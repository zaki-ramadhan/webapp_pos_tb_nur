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

export default function IntegratedMatrixChart({ rules }) {
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
        <div onContextMenu={(e) => e.preventDefault()} className="space-y-4 rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2">
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
