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
    }, [rawPayments, isPaid, values]);

    return (
        <div className="min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-10 items-start">
                {/* Left Column: Informasi Pencatatan Beban */}
                <section>
                    <h3 className="text-base sm:text-lg font-normal text-text-darkest mb-3">
                        {config.summaryTitle || 'Informasi Pencatatan Beban'}
                    </h3>

                    <div className="overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-light">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-ui-border-lightest px-4 py-3 text-sm text-brand-dark">
                            <span>{config.summaryRows?.paidAmountLabel ?? 'Dibayar'}</span>
                            <span className="text-right font-semibold text-text-darkest">
                                {values.paidAmount || 'Rp 0'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center px-4 py-3 text-sm text-brand-dark">
                            <span>{config.summaryRows?.statusLabel ?? 'Status'}</span>
                            <span className="text-right font-normal text-text-darkest">
                                {values.status || '-'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Right Column: Riwayat Pembayaran (only if Terbayar / Lunas) */}
                {isPaid ? (
                    <section>
                        <h3 className="text-base sm:text-lg font-normal text-text-darkest mb-3">
                            Riwayat Pembayaran
                        </h3>

                        <div className="space-y-3">
                            {paymentList.map((payment, index) => {
                                const docNumber = payment.number || payment.document_number || payment.documentNumber || payment.id;
                                const formattedDate = formatPaymentDate(payment.date || payment.entry_date);
                                const amountText = payment.amount ?? values.paidAmount ?? values.totalValue ?? 'Rp 0';

                                return (
                                    <div
                                        key={payment.id || `payment-${index}`}
                                        onClick={() => onOpenPayment?.(payment)}
                                        className="rounded-[4px] border border-table-cell-border bg-white p-3.5 sm:p-4 transition-colors hover:bg-blue-50/60 cursor-pointer shadow-card-light"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <span className="text-sm sm:text-base font-normal text-brand-blue-accent hover:underline">
                                                    {docNumber}
                                                </span>
                                                <div className="mt-1 text-xs sm:text-[13px] text-slate-500 font-normal">
                                                    {formattedDate}
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right text-sm sm:text-base font-semibold text-text-darkest">
                                                {amountText}
                                            </div>
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
