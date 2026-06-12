import { TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function WorkOrderInfoCardRow({ label, value, valueClassName = '' }) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,220px)] border-b border-[#dde2ea] last:border-b-0">
            <div className="px-4 py-2 text-xs sm:text-sm text-[#1f2436]">{label}</div>
            <div className={`px-4 py-2 text-right text-xs sm:text-sm text-[#1f2436] ${valueClassName}`.trim()}>{value}</div>
        </div>
    );
}

export function WorkOrderStatusBadge({ value }) {
    return (
        <span className="inline-flex min-w-[72px] items-center justify-center rounded-[5px] border border-[#f6c98e] bg-[#fff1df] px-3 py-1 text-base text-[#ff8a00]">
            {value}
        </span>
    );
}

export function WorkOrderSummarySection({ config, values }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.workInfoTitle} icon="box" />

            <div className="mt-4 max-w-[860px] overflow-hidden rounded-[6px] border border-[#cfd6e2] bg-white">
                <WorkOrderInfoCardRow label="Tambahan Barang" value={values.workInformation.addedItems} />
                <WorkOrderInfoCardRow label="Tambahan Biaya" value={values.workInformation.addedCosts} />
                <WorkOrderInfoCardRow label="Nilai Total" value={values.workInformation.totalValue} />
                <WorkOrderInfoCardRow
                    label="Penyelesaian Pesanan"
                    value={values.workInformation.completionNumber || '-'}
                    valueClassName="font-medium text-[#1564d7]"
                />
                <WorkOrderInfoCardRow
                    label="Tgl Penyelesaian"
                    value={values.workInformation.completionDate || '-'}
                    valueClassName="font-medium text-[#1564d7]"
                />
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
                    <div className="px-4 py-2 text-xs sm:text-sm text-[#1f2436]">Status</div>
                    <div className="flex justify-end px-4 py-2">
                        {values.workInformation.status ? <WorkOrderStatusBadge value={values.workInformation.status} /> : '-'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function WorkOrderTotalsBar({ values }) {
    return (
        <div className="flex justify-end">
            <div className="grid min-w-[620px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] sm:grid-cols-3">
                <div className="border-b border-[#d2d8e3] px-4 py-3 sm:border-b-0 sm:border-r">
                    <div className="text-xs sm:text-sm text-[#1f2436]">Total Barang</div>
                    <div className="mt-2 text-right text-lg font-semibold text-[#111827]">{values.totalItemsAmount}</div>
                </div>
                <div className="border-b border-[#d2d8e3] px-4 py-3 sm:border-b-0 sm:border-r">
                    <div className="text-xs sm:text-sm text-[#1f2436]">Total Biaya</div>
                    <div className="mt-2 text-right text-lg font-semibold text-[#111827]">{values.totalCostAmount}</div>
                </div>
                <div className="px-4 py-3">
                    <div className="text-xs sm:text-sm text-[#1f2436]">Total</div>
                    <div className="mt-2 text-right text-lg font-semibold text-[#111827]">{values.grandTotal}</div>
                </div>
            </div>
        </div>
    );
}
