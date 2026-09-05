import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { buildSalesReceiptTotal } from '../salesReceiptCalculations';
import { TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function ReceiptSummaryFooter({ paymentAmount, invoices = [] }) {
    const headerPayment = parseNumericInput(paymentAmount);
    const totalInvoices = buildSalesReceiptTotal(invoices);
    const overpayment = headerPayment - totalInvoices;

    const showOverpayment = overpayment !== 0;
    const items = [
        { label: 'Nilai Pembayaran', value: headerPayment },
        { label: 'Faktur Dibayar', value: totalInvoices },
        showOverpayment && { label: 'Lebih Bayar', value: overpayment },
    ].filter(Boolean);

    return <TransactionDualTotalCard items={items} />;
}
