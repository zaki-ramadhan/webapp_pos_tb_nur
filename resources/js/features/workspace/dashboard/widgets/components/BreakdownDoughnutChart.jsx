import { Doughnut } from 'react-chartjs-2';
import {
    hasNonZeroValue,
    normalizeBreakdownItems,
} from '@/features/workspace/dashboard/widgets/dashboardChartUtils';

const tooltipBaseOptions = {
    backgroundColor: '#ffffff',
    titleColor: '#1f2536',
    bodyColor: '#62708c',
    borderColor: '#d7ddea',
    borderWidth: 1,
    padding: 10,
};

export default function BreakdownDoughnutChart({ items = [], percentage = '0%' }) {
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
                    <span className="mt-0.5 text-xs text-[#7d88a2] normal-case tracking-normal">Ringkasan</span>
                </div>
            </div>
        </div>
    );
}
