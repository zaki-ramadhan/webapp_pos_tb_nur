import { Doughnut } from 'react-chartjs-2';
import {
    hasNonZeroValue,
    normalizeBreakdownItems,
    resolveChartObject,
} from '@/features/workspace/dashboard/widgets/dashboardChartUtils';


const tooltipBaseOptions = {
    backgroundColor: 'var(--color-white)',
    titleColor: 'var(--color-brand-darker)',
    bodyColor: 'var(--color-chart-text)',
    borderColor: 'var(--color-chart-border)',
    borderWidth: 1,
    padding: 10,
};

export default function BreakdownDoughnutChart({ items = [], percentage = '0%', centerLabel = 'Ringkasan' }) {
    const chartData = normalizeBreakdownItems(items);
    const values = chartData.map((item) => item.value);
    const hasData = hasNonZeroValue(values);
    const data = {
        labels: hasData ? chartData.map((item) => item.label) : ['Tidak ada data'],
        datasets: [
            {
                data: hasData ? values : [100],
                backgroundColor: hasData ? chartData.map((item) => item.color) : ['var(--color-chart-grid-light)'],
                borderColor: 'var(--color-white)',
                borderWidth: 3,
                hoverOffset: 4,
                cutout: '72%',
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                ...tooltipBaseOptions,
                displayColors: false,
                callbacks: hasData
                    ? {
                          label(context) {
                              const item = chartData[context.dataIndex];

                              if (!item) {
                                  return '';
                              }

                              return [item.label, item.valueText, item.percentText ? `Porsi: ${item.percentText}` : null].filter(Boolean);
                          },
                      }
                    : {
                          label() {
                              return 'Tidak ada data untuk divisualisasikan';
                          },
                      },
            },
        },
    };

    const sortedNonZeroItems = [...chartData].filter((item) => item.value > 0).sort((a, b) => (b.value || 0) - (a.value || 0));
    const primaryItem = sortedNonZeroItems[0];
    const rawPercentage = String(percentage || '');
    const isNegative = rawPercentage.startsWith('-');
    const resolvedPercentage = (isNegative || percentage === '0%') && primaryItem && primaryItem.percentText
        ? primaryItem.percentText
        : percentage;

    const resolvedCenterLabel = (centerLabel === 'Porsi Utama' || ((isNegative || percentage === '0%') && primaryItem))
        ? (primaryItem ? primaryItem.label : centerLabel)
        : centerLabel;

    return (
        <div onContextMenu={(e) => e.preventDefault()} className="w-full max-w-[152px] p-1 sm:max-w-[160px] lg:max-w-[168px]">
            <div className="group relative h-[132px] sm:h-[140px] lg:h-[148px]">
                <Doughnut data={resolveChartObject(data)} options={resolveChartObject(options)} />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-150 group-hover:opacity-0">
                    <span className="text-lg font-semibold leading-none text-brand-darker sm:text-xl md:text-2xl lg:text-2xl">{resolvedPercentage}</span>
                    <span className="mt-1 px-1 line-clamp-1 max-w-[90%] text-xs text-slate-500 font-medium normal-case tracking-normal">{resolvedCenterLabel}</span>
                </div>
            </div>
        </div>
    );
}
