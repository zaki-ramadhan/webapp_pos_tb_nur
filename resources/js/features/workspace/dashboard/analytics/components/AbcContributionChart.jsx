import { Chart as ReactChart } from 'react-chartjs-2';
import { usePersistentTooltip } from './usePersistentTooltip';
import { parsePercentValue } from '@/features/workspace/dashboard/analytics/AnalyticsShared';
import { toRgba } from '@/features/workspace/dashboard/widgets/dashboardChartUtils';

export default function AbcContributionChart({ items }) {
    const { chartRef, handleChartClick, handleChartHover } = usePersistentTooltip();
    let cumulativeShare = 0;
    const chartData = items.map((item) => {
        cumulativeShare += parsePercentValue(item.share);

        return {
            label: item.label,
            share: parsePercentValue(item.share),
            cumulative: Math.min(cumulativeShare, 100),
            itemCount: item.itemCount,
            color: item.color,
        };
    });
    const labels = chartData.map((item) => item.label);
    const shareValues = chartData.map((item) => item.share);
    const contributionColors = chartData.map((item) => item.color ?? '#6ea0df');
    const data = {
        labels,
        datasets: [
            {
                type: 'bar',
                label: 'Kontribusi',
                data: shareValues,
                backgroundColor: contributionColors,
                hoverBackgroundColor: contributionColors.map((color) => toRgba(color, 0.86)),
                borderColor: contributionColors,
                hoverBorderColor: contributionColors,
                borderWidth: 0.5,
                borderRadius: 4,
                maxBarThickness: 54,
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: handleChartClick,
        onHover: handleChartHover,
        interaction: {
            mode: 'index',
            intersect: false,
        },
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
                    label(context) {
                        const value = context.parsed.y;
                        return `Kontribusi: ${value}%`;
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
                min: 0,
                max: 100,
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
                        return `${value}%`;
                    },
                },
            },
        },
    };

    return (
        <div onContextMenu={(e) => e.preventDefault()} className="space-y-5 rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2">
            <div className="h-[200px] rounded-[8px] border border-[#dce3ed] bg-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.04)] sm:h-[220px] lg:h-[232px]">
                <ReactChart ref={chartRef} type="bar" data={data} options={options} />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
                {chartData.map((item, index) => (
                    <div
                        key={item.label}
                        className="rounded-[7px] border border-[#dce3ed] bg-white px-3 py-2.5 shadow-[0_6px_14px_rgba(15,23,42,0.04)]"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-[#2b3650]">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="truncate">{item.label}</span>
                            </span>
                            <span className="text-sm font-semibold text-[#1f2536]">{item.share}%</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-sm text-[#75809b]">
                            <span className="truncate">{item.itemCount}</span>
                            <span>Akumulasi {Math.round(item.cumulative)}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
