import { Bar } from 'react-chartjs-2';
import { usePersistentTooltip } from './usePersistentTooltip';
import { formatCompactLabel, parsePercentValue } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { buildSingleHueEmphasisPalette, resolveChartObject } from '@/features/workspace/dashboard/widgets/dashboardChartUtils';


const analyticsBarPaletteOptions = {
    mutedAlpha: 0.28,
    midAlpha: 0.55,
    hoverMutedAlpha: 0.44,
    hoverMidAlpha: 0.7,
};

export default function IntegratedMatrixChart({ rules }) {
    if (!rules || rules.length === 0) {
        return null;
    }
    const { chartRef, handleChartClick, handleChartHover } = usePersistentTooltip();
    const chartData = rules.map((rule) => {
        const ant = rule.antecedentAbc ?? 'C';
        const cons = rule.consequentAbc ?? 'C';
        let labelTactic = 'Penataan Rak';
        let barColor = '#6366f1'; // Indigo
        let hoverColor = '#4f46e5';

        if (ant === 'A' && cons === 'A') {
            labelTactic = 'A → A Paket Bundling';
            barColor = '#059669'; // Emerald Green
            hoverColor = '#047857';
        } else if ((ant === 'A' && cons === 'C') || (ant === 'C' && cons === 'A')) {
            labelTactic = 'A ↔ C Jual Silang';
            barColor = '#2563eb'; // Royal Blue
            hoverColor = '#1d4ed8';
        } else if (ant === 'B' || cons === 'B') {
            labelTactic = `${ant} → ${cons} Paket Pelengkap`;
            barColor = '#d97706'; // Amber Gold
            hoverColor = '#b45309';
        } else {
            labelTactic = 'C → C Penataan Rak';
            barColor = '#6366f1'; // Indigo
            hoverColor = '#4f46e5';
        }

        return {
            id: rule.id,
            label: `[${ant}] ${formatCompactLabel(rule.antecedent)} → [${cons}] ${formatCompactLabel(rule.consequent)}`,
            fullLabel: `${rule.antecedent} [Kat ${ant}] → ${rule.consequent} [Kat ${cons}]`,
            confidence: parsePercentValue(rule.confidence),
            support: rule.support,
            lift: rule.lift,
            antecedentAbc: ant,
            consequentAbc: cons,
            labelTactic,
            barColor,
            hoverColor,
        };
    });

    const confidenceValues = chartData.map((item) => item.confidence);

    const data = {
        labels: chartData.map((item) => item.label),
        datasets: [
            {
                label: 'Confidence',
                data: confidenceValues,
                backgroundColor: chartData.map((item) => item.barColor),
                hoverBackgroundColor: chartData.map((item) => item.hoverColor),
                borderColor: chartData.map((item) => item.barColor),
                hoverBorderColor: chartData.map((item) => item.hoverColor),
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
                backgroundColor: 'var(--color-white)',
                titleColor: 'var(--color-brand-darker)',
                bodyColor: 'var(--color-chart-text)',
                borderColor: 'var(--color-chart-border)',
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
                    color: 'var(--color-table-row-border)',
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: 'var(--color-chart-ticks)',
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
                    color: 'var(--color-brand-darker)',
                    font: {
                        size: 12,
                    },
                    padding: 6,
                },
            },
        },
    };

    // Detect which tactic categories actually exist in current rules
    const hasAC = chartData.some((item) => (item.antecedentAbc === 'A' && item.consequentAbc === 'C') || (item.antecedentAbc === 'C' && item.consequentAbc === 'A') || item.labelTactic.includes('Jual Silang'));
    const hasAA = chartData.some((item) => item.antecedentAbc === 'A' && item.consequentAbc === 'A');
    const hasB = chartData.some((item) => item.antecedentAbc === 'B' || item.consequentAbc === 'B');
    const hasCC = chartData.some((item) => item.antecedentAbc === 'C' && item.consequentAbc === 'C');

    const activeLegends = [
        hasAC && {
            color: '#2563eb',
            title: 'A ↔ C / C ↔ A Jual Silang (Prioritas Utama)',
            desc: 'Barang aksesoris (C) terikat dengan produk inti (A).',
        },
        hasAA && {
            color: '#059669',
            title: 'A ↔ A Paket Bundling (Sangat Kuat)',
            desc: 'Paket bundling antar-produk inti omzet terbesar (A).',
        },
        hasB && {
            color: '#d97706',
            title: 'B ↔ A / B ↔ C Paket Pelengkap (Rutin)',
            desc: 'Kombinasi produk menengah (B) dengan produk lainnya.',
        },
        hasCC && {
            color: '#6366f1',
            title: 'C ↔ C Display Rak (Pendukung)',
            desc: 'Penataan letak rak perkakas/aksesoris berdampingan.',
        },
    ].filter(Boolean);

    return (
        <div onContextMenu={(e) => e.preventDefault()} className="space-y-4 rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2">
            <div className="overflow-x-auto custom-scrollbar rounded-[8px] border border-abc-card-border bg-white p-3 shadow-abc-card">
                <div className="h-[260px] min-w-[650px] sm:h-[280px] sm:min-w-[750px]">
                    <Bar ref={chartRef} data={resolveChartObject(data)} options={resolveChartObject(options)} />
                </div>
            </div>

            <div className={`grid gap-3 border border-slate-100 bg-white rounded-lg p-3 shadow-widget-medium ${activeLegends.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : activeLegends.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                {activeLegends.map((leg, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: leg.color }} />
                        <div>
                            <p className="text-sm font-semibold text-brand-darker leading-4">{leg.title}</p>
                            <p className="text-sm text-slate-500 mt-1">{leg.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
