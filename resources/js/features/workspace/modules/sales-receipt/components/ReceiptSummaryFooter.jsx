import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import {
    buildSalesReceiptTotal,
    formatCurrencyLabel,
} from '../salesReceiptCalculations';

export default function ReceiptSummaryFooter({ paymentAmount, invoices = [] }) {
    const headerPayment = parseNumericInput(paymentAmount);
    const totalInvoices = buildSalesReceiptTotal(invoices);
    const overpayment = headerPayment - totalInvoices;

    const showOverpayment = overpayment !== 0;
    const items = [
        { id: 'payment', label: 'Nilai Pembayaran', value: formatCurrencyLabel(headerPayment) },
        { id: 'paid', label: 'Faktur Dibayar', value: formatCurrencyLabel(totalInvoices) },
        showOverpayment && { id: 'overpayment', label: 'Lebih Bayar', value: formatCurrencyLabel(overpayment) },
    ].filter(Boolean);

    const gridColsClass = items.length === 2 ? 'md:grid-cols-2 max-w-[400px]' : 'md:grid-cols-3 max-w-[850px]';

    return (
        <div className="flex justify-end w-full">
            <div className={`grid w-full overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium ${gridColsClass}`}>
                {items.map((item) => (
                    <div key={item.id} className="border-b border-ui-border-light px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 md:px-5">
                        <div className="text-xs sm:text-sm text-brand-dark">{item.label}</div>
                        <div className={`mt-2 text-right text-lg font-semibold ${item.id === 'overpayment' && overpayment < 0 ? 'text-brand-danger-accent' : 'text-text-darkest'}`.trim()}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
