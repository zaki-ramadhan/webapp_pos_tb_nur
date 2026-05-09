import {
    OrderStatusStackChart,
    TrendLineChart,
} from '@/features/workspace/dashboard/widgets/DashboardWidgetCharts';
import DashboardWidgetEmptyState from '@/features/workspace/dashboard/widgets/DashboardWidgetEmptyState';
import { InfoIcon } from '@/features/workspace/shared/Icons';

function WidgetPeriod({ value, align = 'right' }) {
    if (!value) {
        return null;
    }

    return (
        <div className={`text-[12px] text-[#4f5678] md:text-[13px] ${align === 'right' ? 'text-right' : 'text-left'}`.trim()}>
            {value}
        </div>
    );
}

function MetricCaption({ children }) {
    return <p className="text-[12px] text-[#7b8398] md:text-[13px]">{children}</p>;
}

function SalesTeamRow({ row }) {
    const initials = row.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-t border-[#edf1f6] py-3 first:border-t-0 first:pt-0 last:pb-0 lg:grid-cols-[auto_minmax(0,1fr)_120px_56px] lg:items-center">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef2f7] text-[11px] font-semibold text-[#6b738f]">
                {initials}
            </span>
            <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[#1f2536] md:text-[14px]">{row.name}</p>
                <p className="mt-1 text-[11px] text-[#7b8398] md:text-[12px]">{row.role}</p>
            </div>
            <div className="col-start-2 flex items-center gap-2 lg:col-start-auto lg:justify-end">
                <span className="text-[12px] text-[#6d7590] md:text-[13px]">{row.totalValue}</span>
                <span className="inline-flex rounded-full bg-[#dff3ff] px-2 py-0.5 text-[11px] text-[#1e7ec1]">
                    {row.targetPercent}
                </span>
            </div>
            <div className="col-start-2 text-left text-[12px] font-medium text-[#1f2536] lg:col-start-auto lg:text-right md:text-[13px]">
                {row.targetValue}
            </div>
        </div>
    );
}

export function SalesTeamWidget({ widget }) {
    if (!(widget.rows ?? []).length) {
        return <DashboardWidgetEmptyState description="Data penjual akan muncul setelah tersedia." />;
    }

    return (
        <div className="flex h-full flex-col gap-4">
            <WidgetPeriod value={widget.period} />

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] gap-4 border-b border-[#edf1f6] pb-2 text-[12px] font-semibold text-[#1f2536] md:grid-cols-[minmax(0,1fr)_120px_56px] md:text-[13px]">
                <span>Penjual</span>
                <span className="text-right">Total Penjualan</span>
                <span className="hidden text-right md:block">Target</span>
            </div>

            <div className="space-y-0">
                {(widget.rows ?? []).map((row) => (
                    <SalesTeamRow key={row.name} row={row} />
                ))}
            </div>
        </div>
    );
}

function TopProductRow({ item, index }) {
    return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[8px] border border-[#e6ebf3] bg-[#fbfcfe] px-3 py-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
            <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[#e7eef9] px-2 text-[11px] font-semibold text-[#456293]">
                {index + 1}
            </span>
            <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[#1f2536] md:text-[14px]">{item.name}</p>
                <p className="mt-1 text-[11px] text-[#7b8398] md:text-[12px]">
                    {item.units} • {item.share}
                </p>
            </div>
            <p className="col-start-2 text-left text-[12px] font-semibold text-[#1f2536] lg:col-start-auto lg:text-right md:text-[13px]">
                {item.revenue}
            </p>
        </div>
    );
}

export function TopProductsWidget({ widget }) {
    if (!(widget.items ?? []).length) {
        return <DashboardWidgetEmptyState description="Data produk terlaris akan muncul setelah tersedia." />;
    }

    return (
        <div className="flex h-full flex-col gap-4">
            <WidgetPeriod value={widget.period} />

            <div className="space-y-3">
                {(widget.items ?? []).map((item, index) => (
                    <TopProductRow key={item.name} item={item} index={index} />
                ))}
            </div>
        </div>
    );
}

export function CashAvailabilityWidget({ widget }) {
    return (
        <div className="flex h-full flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <MetricCaption>{widget.balanceLabel}</MetricCaption>
                    <p className="mt-2 text-[18px] font-semibold leading-none text-[#1f2536] sm:text-[20px] md:text-[22px] xl:text-[24px]">
                        {widget.balanceValue}
                    </p>
                </div>
                <WidgetPeriod value={widget.period} />
            </div>
            <TrendLineChart
                labels={widget.labels ?? []}
                series={widget.series ?? []}
                accent={widget.accent}
                valueFormat={widget.valueFormat ?? 'currency'}
                heightClassName="h-[152px] sm:h-[164px]"
            />
        </div>
    );
}

function OrderLegendItem({ item }) {
    return (
        <div className="flex items-center gap-2 text-[12px] text-[#374151] md:text-[13px]">
            <span className="h-4 w-10 rounded-[2px]" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
        </div>
    );
}

export function OrderStatusWidget({ widget }) {
    const segments = widget.segments ?? [];

    if (!segments.length) {
        return <DashboardWidgetEmptyState description="Status pesanan akan muncul setelah tersedia." />;
    }

    return (
        <div className="flex h-full flex-col gap-3">
            <div className="flex items-end justify-between gap-3 border-b border-[#edf1f6] pb-3">
                <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#1f2536] sm:text-[15px] md:text-[17px]">{widget.primaryLabel}</p>
                </div>
                <p className="text-[16px] font-semibold leading-none text-[#111827] sm:text-[18px] md:text-[20px]">{widget.primaryValue}</p>
            </div>

            <div className="flex items-center gap-2">
                <p className="text-[14px] font-medium text-[#ff4f1f] sm:text-[15px] md:text-[16px]">{widget.statusTitle}</p>
                <InfoIcon className="h-4 w-4 shrink-0 text-[#1f2536]" />
            </div>

            <OrderStatusStackChart segments={segments} />

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1">
                {segments.map((segment) => (
                    <OrderLegendItem key={segment.label} item={segment} />
                ))}
            </div>
        </div>
    );
}
