import EmptyState from '@/components/ui/EmptyState';
import { Bar } from 'react-chartjs-2';
import DashboardChartShell from '@/features/workspace/dashboard/widgets/DashboardChartShell';
import {
    formatChartValue,
    hasNonZeroValue,
    normalizeSummarySections,
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

export default function SummarySectionChart({ sections = [], valueFormat = 'currency' }) {
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
                    titleClassName="text-sm font-medium text-text-muted"
                    descriptionClassName="mt-1 text-sm leading-4 text-text-light"
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
                    color: 'var(--color-tab-view-active-text)',
                    font: {
                        size: 14,
                    },
                    maxRotation: 0,
                    minRotation: 0,
                },
            },
        },
    };

    return (
        <DashboardChartShell heightClassName="h-[124px]">
            <Bar data={resolveChartObject(data)} options={resolveChartObject(options)} />
        </DashboardChartShell>
    );
}
