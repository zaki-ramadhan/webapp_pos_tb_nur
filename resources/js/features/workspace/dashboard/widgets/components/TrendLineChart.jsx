import '@/features/workspace/dashboard/analytics/chartSetup';
import { Line } from 'react-chartjs-2';
import DashboardChartShell from '@/features/workspace/dashboard/widgets/DashboardChartShell';
import {
    formatChartValue,
    normalizeTrendSeries,
    toRgba,
} from '@/features/workspace/dashboard/widgets/dashboardChartUtils';

const tooltipBaseOptions = {
    backgroundColor: '#ffffff',
    titleColor: '#1f2536',
    bodyColor: '#62708c',
    borderColor: '#d7ddea',
    borderWidth: 1,
    padding: 10,
};

export default function TrendLineChart({
    labels = [],
    series = [],
    accent = '#55aef0',
    valueFormat = 'number',
    heightClassName = 'h-[228px]',
}) {
    const normalizedSeries = normalizeTrendSeries(series, accent);
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
                      label: 'Belum ada data',
                      data: labels.map(() => 0),
                      borderColor: '#c7d3e3',
                      backgroundColor: toRgba('#c7d3e3', 0.16),
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
                    color: '#5f6a85',
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
                    color: '#6f7f99',
                    font: {
                        size: 14,
                    },
                },
            },
            y: {
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
                        return formatChartValue(value, valueFormat);
                    },
                },
            },
        },
    };

    return (
        <DashboardChartShell heightClassName={heightClassName}>
            <Line data={data} options={options} />
        </DashboardChartShell>
    );
}
