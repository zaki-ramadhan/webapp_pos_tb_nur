import '@/features/workspace/dashboard/widgets/chartSetup';
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
    heightClassName = 'h-full w-full',
    yDivisions = 6,
}) {
    const normalizedSeries = normalizeTrendSeries(series, accent);
    const allValues = normalizedSeries.flatMap((s) => s.data || []);
    const maxVal = allValues.length > 0 ? Math.max(...allValues) : 0;
    const minVal = allValues.length > 0 ? Math.min(...allValues) : 0;

    const getNiceStepSize = (span, targetDivisions = 6) => {
        if (!span || span <= 0) return valueFormat === 'currency' ? 25000 : 1;
        const rawStep = span / targetDivisions;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const ratio = rawStep / magnitude;
        let niceRatio = 1.0;
        if (ratio <= 1.0) niceRatio = 1.0;
        else if (ratio <= 1.25) niceRatio = 1.25;
        else if (ratio <= 1.5) niceRatio = 1.5;
        else if (ratio <= 2.0) niceRatio = 2.0;
        else if (ratio <= 2.5) niceRatio = 2.5;
        else if (ratio <= 5.0) niceRatio = 5.0;
        else niceRatio = 10.0;

        let step = niceRatio * magnitude;
        if (step * targetDivisions < span) {
            if (niceRatio === 1.0) niceRatio = 1.25;
            else if (niceRatio === 1.25) niceRatio = 1.5;
            else if (niceRatio === 1.5) niceRatio = 2.0;
            else if (niceRatio === 2.0) niceRatio = 2.5;
            else if (niceRatio === 2.5) niceRatio = 5.0;
            else niceRatio = 10.0;
            step = niceRatio * magnitude;
        }
        return step;
    };

    let yMin = 0;
    let yMax = 0;
    let stepSize = undefined;

    if (minVal === 0 && maxVal === 0) {
        // Zero / No Data State: 6 intervals = 7 ticks
        stepSize = valueFormat === 'currency' ? 25000 : 1;
        yMin = 0;
        yMax = stepSize * 6;
    } else if (minVal >= 0) {
        // Mode A: All Positive -> 0 at bottom baseline, 6 intervals = 7 ticks
        stepSize = getNiceStepSize(maxVal, 6);
        yMin = 0;
        yMax = stepSize * 6;
    } else if (maxVal <= 0) {
        // Mode B: All Negative -> 0 at top ceiling baseline, 6 intervals = 7 ticks
        const span = Math.abs(minVal);
        stepSize = getNiceStepSize(span, 6);
        yMax = 0;
        yMin = -stepSize * 6;
    } else {
        // Mode C: Mixed Positive & Negative -> 0 symmetric in middle, 3 intervals below + 3 above = 7 ticks
        const maxAbs = Math.max(Math.abs(minVal), Math.abs(maxVal));
        stepSize = getNiceStepSize(maxAbs, 3);
        yMin = -stepSize * 3;
        yMax = stepSize * 3;
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
                display: false,
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
                max: yMax,
                stepSize: stepSize,
                grid: {
                    color: (context) => (context.tick?.value === 0 ? '#94a3b8' : '#e2e8f0'),
                    lineWidth: (context) => (context.tick?.value === 0 ? 1.5 : 1),
                },
                border: {
                    display: false,
                },
                ticks: {
                    precision: 0,
                    color: 'var(--color-text-dark)',
                    font: {
                        size: 11,
                    },
                    autoSkip: false,
                    maxTicksLimit: 10,
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
            className="w-full h-full flex-1 min-h-0 flex flex-col"
        >
            <Line data={resolveChartObject(data)} options={resolveChartObject(options)} />
        </DashboardChartShell>
    );
}
