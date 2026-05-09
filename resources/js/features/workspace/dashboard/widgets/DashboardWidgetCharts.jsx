import '@/features/workspace/dashboard/analytics/chartSetup';

import EmptyState from '@/components/ui/EmptyState';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import DashboardChartShell from '@/features/workspace/dashboard/widgets/DashboardChartShell';
import {
    buildEmphasisColors,
    formatChartValue,
    hasNonZeroValue,
    normalizeBreakdownItems,
    parseDisplayNumber,
    normalizeSummarySections,
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

export function TrendLineChart({
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
                        size: 12,
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
                        size: 12,
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
                        size: 12,
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

export function BreakdownDoughnutChart({ items = [], percentage = '0%' }) {
    const chartData = normalizeBreakdownItems(items);
    const values = chartData.map((item) => item.value);
    const hasData = hasNonZeroValue(values);
    const data = {
        labels: hasData ? chartData.map((item) => item.label) : ['Belum ada data'],
        datasets: [
            {
                data: hasData ? values : [100],
                backgroundColor: hasData ? chartData.map((item) => item.color) : ['#e6edf6'],
                borderColor: '#ffffff',
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
                              return 'Belum ada data untuk divisualisasikan';
                          },
                      },
            },
        },
    };

    return (
        <div className="w-full max-w-[152px] p-1 sm:max-w-[160px]">
            <div className="group relative h-[132px] sm:h-[140px]">
                <Doughnut data={data} options={options} />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-150 group-hover:opacity-0">
                    <span className="text-[18px] font-semibold leading-none text-[#1f2536] sm:text-[20px] md:text-[22px]">{percentage}</span>
                    <span className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#7d88a2]">Ringkasan</span>
                </div>
            </div>
        </div>
    );
}

export function SummarySectionChart({ sections = [], valueFormat = 'currency' }) {
    const normalizedSections = normalizeSummarySections(sections);
    const labels = normalizedSections.map((section) => section.title);
    const itemRegistry = [];

    normalizedSections.forEach((section) => {
        section.items.forEach((item) => {
            if (!itemRegistry.some((registeredItem) => registeredItem.label === item.label)) {
                itemRegistry.push({
                    label: item.label,
                    color: item.color,
                });
            }
        });
    });

    const lookup = new Map();

    normalizedSections.forEach((section) => {
        section.items.forEach((item) => {
            lookup.set(`${section.title}:${item.label}`, item.valueText);
        });
    });

    const datasets = itemRegistry.map((item) => ({
        label: item.label,
        data: normalizedSections.map((section) => section.items.find((sectionItem) => sectionItem.label === item.label)?.value ?? 0),
        backgroundColor: item.color,
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 18,
    }));

    const hasData = datasets.some((dataset) => hasNonZeroValue(dataset.data));

    if (!hasData) {
        return (
            <DashboardChartShell heightClassName="h-[124px]">
                <EmptyState
                    fill
                    tone="subtle"
                    size="sm"
                    iconName="document"
                    title="Belum ada data"
                    description="Belum ada data untuk divisualisasikan."
                    className="rounded-[8px] bg-transparent px-2 py-2"
                    titleClassName="text-[13px] font-medium text-[#6b738f]"
                    descriptionClassName="mt-1 text-[11px] leading-4 text-[#8a91a8] md:text-[12px]"
                />
            </DashboardChartShell>
        );
    }

    const data = {
        labels,
        datasets,
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
                callbacks: {
                    title(items) {
                        if (!items.length) {
                            return '';
                        }

                        return items[0].label ?? '';
                    },
                    label(context) {
                        const valueText = lookup.get(`${context.label}:${context.dataset.label}`) ?? formatChartValue(context.parsed.x, valueFormat);

                        return `${context.dataset.label}: ${valueText}`;
                    },
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    color: '#edf1f7',
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#6f7f99',
                    font: {
                        size: 11,
                    },
                    maxRotation: 0,
                    minRotation: 0,
                    callback(value) {
                        return formatChartValue(value, valueFormat);
                    },
                },
            },
            y: {
                stacked: true,
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#5f6a85',
                    font: {
                        size: 11,
                    },
                    maxRotation: 0,
                    minRotation: 0,
                },
            },
        },
    };

    return (
        <DashboardChartShell heightClassName="h-[124px]">
            <Bar data={data} options={options} />
        </DashboardChartShell>
    );
}

export function OrderStatusStackChart({ segments = [] }) {
    const normalizedSegments = (segments ?? []).map((segment, index) => ({
        id: segment.id ?? `${segment.label ?? 'segment'}-${index}`,
        label: segment.label ?? `Segmen ${index + 1}`,
        value: segment.numericValue ?? parseDisplayNumber(segment.value ?? 0),
        valueText: segment.value ?? '0',
        color: segment.color ?? '#d8e0ec',
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
                  color: '#e6edf6',
              },
          ];
    const emphasizedSegmentColors = buildEmphasisColors(
        chartSegments.map((segment) => segment.value),
        chartSegments.map((segment) => segment.color),
        0.28,
    );

    const data = {
        labels: ['Status'],
        datasets: chartSegments.map((segment, index) => ({
            label: segment.label,
            data: [Math.max(segment.value, 0)],
            backgroundColor: emphasizedSegmentColors[index],
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
        <div className="relative">
            <div className="h-[72px] overflow-hidden rounded-[6px]">
                <Bar data={data} options={options} />
            </div>
            {hasData ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[72px] items-center px-3">
                    {normalizedSegments.map((segment) => {
                        const widthPercent = totalValue > 0 ? (Math.max(segment.value, 0) / totalValue) * 100 : 0;

                        return (
                            <div
                                key={segment.id}
                                className="flex h-full items-center justify-center px-2 text-center text-[11px] font-medium text-white md:text-[12px]"
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
