import { TransactionToolbarIconButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { RefreshIcon, TableActionIcon } from '@/features/workspace/shared/Icons';
import { buildSalesReceiptSummaryValue } from './salesReceiptCalculations';

export function ReadonlyTextarea({ value, rows = 3, className = '' }) {
    return (
        <textarea
            value={value}
            rows={rows}
            readOnly
            className={`w-full resize-none rounded-[4px] border border-ui-border px-4 py-3 text-xs sm:text-sm text-brand-dark outline-none ${className}`.trim()}
        />
    );
}

export function ReceiptAmountInput({ value, isDetail }) {
    const displayValue = !isDetail && String(value ?? '0') === '0' ? '' : String(value ?? '');

    return (
        <div className="flex h-[34px] overflow-hidden rounded-[4px] border border-ui-border bg-white">
            {isDetail ? (
                <span className="inline-flex items-center border-r border-ui-border-medium bg-input-prefix-bg-compact px-3 text-base text-text-inactive">
                    Rp
                </span>
            ) : null}
            <span className={`inline-flex flex-1 items-center px-3 text-base text-text-darkest ${isDetail ? 'justify-end font-semibold' : ''}`.trim()}>
                {displayValue}
            </span>
        </div>
    );
}

export function ReceiptAmountActionButton({ type, onClick }) {
    const icon =
        type === 'refresh' ? (
            <RefreshIcon className="h-4.5 w-4.5 text-brand-blue" />
        ) : (
            <TableActionIcon className="h-4.5 w-4.5 text-brand-blue" />
        );
    const label = type === 'refresh' ? 'Bersihkan nilai pembayaran' : 'Tampilkan bantuan pembayaran';

    return (
        <TransactionToolbarIconButton label={label} className="h-[34px] w-[40px]" onClick={onClick}>
            {icon}
        </TransactionToolbarIconButton>
    );
}

export function ReceiptSummaryFooter({ paymentAmount }) {
    const items = [
        { id: 'payment', label: 'Nilai Pembayaran', value: buildSalesReceiptSummaryValue(paymentAmount) },
        { id: 'paid', label: 'Faktur Dibayar', value: buildSalesReceiptSummaryValue(paymentAmount) },
    ];

    return (
        <div className="flex justify-end">
            <div className="grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium md:grid-cols-2">
                {items.map((item) => (
                    <div key={item.id} className="border-b border-ui-border-light px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 md:px-5">
                        <div className="text-xs sm:text-sm text-brand-dark">{item.label}</div>
                        <div className="mt-2 text-right text-lg font-semibold text-text-darkest">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
