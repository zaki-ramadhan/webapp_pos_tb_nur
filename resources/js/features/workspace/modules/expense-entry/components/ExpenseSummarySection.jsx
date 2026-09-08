import { useMemo } from 'react';

function formatPaymentDate(dateStr) {
    if (!dateStr) return '-';
    const str = String(dateStr).trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        return str;
    }
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }
    return str;
}

export default function ExpenseSummarySection({ config = {}, values = {}, onOpenPayment = null }) {
    const statusText = String(values.status ?? '').toLowerCase();
    const isPaid = statusText.includes('bayar') || statusText.includes('lunas');

    const rawPayments = values.payments ?? values.paymentHistory ?? [];
    const paymentList = useMemo(() => {
        if (Array.isArray(rawPayments) && rawPayments.length > 0) {
            return rawPayments;
        }
        const paidNum = typeof values.paidAmount === 'number'
            ? values.paidAmount
            : parseFloat(String(values.paidAmount || '0').replace(/[^0-9.-]+/g, '')) || 0;
        const isPaid = paidNum > 0 || statusText.includes('bayar') || statusText.includes('lunas');
        if (isPaid) {
            return [
                {
                    id: values.paymentNumber || values.cashBankReference || '111.102-01.2016.12.00003',
                    number: values.paymentNumber || values.cashBankReference || '111.102-01.2016.12.00003',
                    date: values.paymentDate || values.entryDate || '06/12/2016',
                    amount: values.paidAmount || values.totalValue || 'Rp 52,500,000',
                },
            ];
        }
        return [];
    }, [rawPayments, statusText, values]);

    return (
        <div className="min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-10 items-start">
                {/* Left Column: Informasi Pencatatan Beban */}
                <section>
                    <h3 className="text-base sm:text-lg font-normal text-text-darkest mb-1.5 sm:mb-2">
                        {config.summaryTitle || 'Informasi Pencatatan Beban'}
                    </h3>

                    <div className="overflow-hidden rounded-[4px] border border-ui-border bg-white">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-ui-border px-4 py-2.5 sm:py-3 text-sm text-brand-dark">
                            <span>{config.summaryRows?.paidAmountLabel ?? 'Dibayar'}</span>
                            <span className="text-right font-medium text-text-darkest">
                                {values.paidAmount || 'Rp 0'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center px-4 py-2.5 sm:py-3 text-sm text-brand-dark">
                            <span>{config.summaryRows?.statusLabel ?? 'Status'}</span>
                            <span className="text-right font-medium text-text-darkest">
                                {values.status || '-'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Right Column: Riwayat Pembayaran */}
                {paymentList.length > 0 ? (
                    <section>
                        <h3 className="text-base sm:text-lg font-normal text-text-darkest mb-1.5 sm:mb-2">
                            Riwayat Pembayaran
                        </h3>

                        <div className="overflow-hidden rounded-[4px] border border-ui-border bg-white">
                            {paymentList.map((payment, index) => {
                                const docNumber = payment.number || payment.document_number || payment.documentNumber || payment.id;
                                const formattedDate = formatPaymentDate(payment.date || payment.entry_date);
                                const amountText = payment.amount ?? values.paidAmount ?? values.totalValue ?? 'Rp 0';

                                return (
                                    <div
                                        key={payment.id || `payment-${index}`}
                                        onClick={() => onOpenPayment?.(payment)}
                                        className="flex items-center justify-between px-4 py-2.5 sm:py-3 border-b border-ui-border last:border-b-0 transition-colors hover:bg-slate-50/80 cursor-pointer"
                                    >
                                        <div className="min-w-0">
                                            <span className="text-sm font-normal text-brand-blue-accent">
                                                {docNumber}
                                            </span>
                                            <div className="mt-0.5 text-xs text-slate-500 font-normal">
                                                {formattedDate}
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right text-sm font-medium text-text-darkest">
                                            {amountText}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}
