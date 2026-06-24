import { Bar } from 'react-chartjs-2';
import {
    hasNonZeroValue,
    parseDisplayNumber,
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

export default function OrderStatusStackChart({ segments = [] }) {
    const normalizedSegments = (segments ?? []).map((segment, index) => ({
        id: segment.id ?? `${segment.label ?? 'segment'}-${index}`,
        label: segment.label ?? `Segmen ${index + 1}`,
        value: segment.numericValue ?? parseDisplayNumber(segment.value ?? 0),
        valueText: segment.value ?? '0',
        color: segment.color ?? 'var(--color-table-border)',
    }));
    const totalValue = normalizedSegments.reduce((sum, segment) => sum + Math.max(segment.value, 0), 0);
    const hasData = hasNonZeroValue(normalizedSegments.map((segment) => segment.value));
    const chartSegments = hasData
        ? normalizedSegments
        : [
              {
                  id: 'empty-order-status',
                  label: 'Belum ada data',
                  value: 1,
                  valueText: 'Belum ada data',
                  color: 'var(--color-chart-grid-light)',
              },
          ];
    const data = {
        labels: ['Status'],
        datasets: chartSegments.map((segment) => ({
            label: segment.label,
            data: [Math.max(segment.value, 0)],
            backgroundColor: segment.color,
            borderColor: segment.color,
            borderWidth: 1,
            borderRadius: 0,
            borderSkipped: false,
            barThickness: 36,
        })),
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
                ...tooltipBaseOptions,
                displayColors: false,
                callbacks: {
                    title() {
                        return '';
                    },
                    label(context) {
                        const segment = chartSegments[context.datasetIndex];

                        if (!segment) {
                            return '';
                        }

                        return `${segment.label}: ${segment.valueText}`;
                    },
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                display: false,
                border: {
                    display: false,
                },
                grid: {
                    display: false,
                },
            },
            y: {
                stacked: true,
                display: false,
                border: {
                    display: false,
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div onContextMenu={(e) => e.preventDefault()} className="relative">
            <div className="h-[72px] overflow-hidden rounded-[6px]">
                <Bar data={resolveChartObject(data)} options={resolveChartObject(options)} />
            </div>
            {hasData ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[72px] items-center px-3">
                    {normalizedSegments.map((segment) => {
                        const widthPercent = totalValue > 0 ? (Math.max(segment.value, 0) / totalValue) * 100 : 0;

                        return (
                            <div
                                key={segment.id}
                                className="flex h-full items-center justify-center px-2 text-center text-sm font-medium text-white"
                                style={{ width: `${widthPercent}%` }}
                            >
                                <span className="truncate">{segment.valueText}</span>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
