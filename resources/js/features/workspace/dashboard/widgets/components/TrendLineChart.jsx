import '@/features/workspace/dashboard/analytics/chartSetup';
import { Line } from 'react-chartjs-2';
import DashboardChartShell from '@/features/workspace/dashboard/widgets/DashboardChartShell';
import {
    formatChartValue,
    normalizeTrendSeries,
    resolveChartObject,
    toRgba,
} from '@/features/workspace/dashboard/widgets/dashboardChartUtils';


const tooltipBaseOptions = {
    backgroundColor: 'var(--color-white)',
    titleColor: 'var(--color-brand-darker)',
    bodyColor: 'var(--color-chart-text)',
    borderColor: 'var(--color-chart-border)',
    borderWidth: 1,
    padding: 10,
};

export default function TrendLineChart({
    labels = [],
    series = [],
    accent = 'var(--color-blue-280)',
    valueFormat = 'number',
    heightClassName = 'h-[228px]',
    yDivisions = 5,
}) {
    const normalizedSeries = normalizeTrendSeries(series, accent);
    const allValues = normalizedSeries.flatMap((s) => s.data || []);
    const maxVal = allValues.length > 0 ? Math.max(...allValues) : 0;
    const minVal = allValues.length > 0 ? Math.min(...allValues) : 0;

    const upperLimit = Math.max(0, maxVal);
    const lowerLimit = Math.min(0, minVal);
    const totalSpan = upperLimit - lowerLimit;

    const getNiceStepSize = (span) => {
        if (!span || span <= 0) return valueFormat === 'currency' ? 25000 : 1;
        const targetDivisions = yDivisions || 5;
        const rawStep = span / targetDivisions;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const ratio = rawStep / magnitude;
        let niceStep;
        if (ratio <= 1.0) niceStep = 1;
        else if (ratio <= 2.0) niceStep = 2;
        else if (ratio <= 2.5) niceStep = 2.5;
        else if (ratio <= 5.0) niceStep = 5;
        else niceStep = 10;
        return niceStep * magnitude;
    };

    const stepSize = getNiceStepSize(totalSpan);

    let yMin = 0;
    let yMax = 0;

    if (minVal < 0) {
        yMin = Math.floor(minVal / stepSize) * stepSize;
        const ceilMax = Math.ceil(maxVal / stepSize) * stepSize;
        yMax = ceilMax >= stepSize ? ceilMax : stepSize;
    } else {
        yMin = 0;
        const ceilMax = Math.ceil(maxVal / stepSize) * stepSize;
        yMax = Math.max(ceilMax, stepSize * 4);
    }

    const datasets =
        normalizedSeries.length > 0
            ? normalizedSeries.map((item) => ({
                  label: item.label,
                  data: item.data,
                  borderColor: item.borderColor,
                  backgroundColor: item.backgroundColor,
                  fill: true,
                  tension: 0.35,
                  pointRadius: 3,
                  pointHoverRadius: 4,
                  borderWidth: 2,
              }))
            : [
                  {
                      label: 'Tidak ada data',
                      data: labels.map(() => 0),
                      borderColor: 'var(--color-ui-border)',
                      backgroundColor: toRgba('var(--color-ui-border)', 0.16),
                      fill: true,
                      tension: 0.35,
                      pointRadius: 0,
                      borderDash: [5, 5],
                      borderWidth: 2,
                  },
              ];

    const data = {
        labels,
        datasets,
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
                display: normalizedSeries.length > 1,
                position: 'top',
                align: 'start',
                labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    color: 'var(--color-tab-view-active-text)',
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                ...tooltipBaseOptions,
                callbacks: {
                    label(context) {
                        return `${context.dataset.label}: ${formatChartValue(context.parsed.y, valueFormat)}`;
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
                    color: 'var(--color-text-dark)',
                    font: {
                        size: 12,
                    },
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
            y: {
                min: yMin,
                ...(yMax !== undefined ? { max: yMax } : {}),
                ...(stepSize !== undefined ? { stepSize } : {}),
                grid: {
                    color: (context) => (context.tick?.value === 0 ? '#94a3b8' : '#e2e8f0'),
                    lineWidth: (context) => (context.tick?.value === 0 ? 1.5 : 1),
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: 'var(--color-text-dark)',
                    font: {
                        size: 12,
                    },
                    autoSkip: false,
                    maxTicksLimit: 7,
                    callback(value) {
                        return formatChartValue(value, valueFormat);
                    },
                },
            },
        },
    };

    return (
        <DashboardChartShell
            heightClassName={heightClassName}
            className={heightClassName.includes('flex-1') ? 'flex-1 flex flex-col min-h-0' : ''}
        >
            <Line data={resolveChartObject(data)} options={resolveChartObject(options)} />
        </DashboardChartShell>
    );
}
