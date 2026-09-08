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

export default function PayrollSummarySection({ config = {}, values = {}, incomeTax = 0, isLoading = false, onOpenPayment = null }) {
    const rawPayments = values.payments ?? values.paymentHistory ?? [];
    const paymentList = useMemo(() => {
        if (Array.isArray(rawPayments) && rawPayments.length > 0) {
            return rawPayments;
        }
        return [];
    }, [rawPayments]);

    const formattedTax = typeof incomeTax === 'number'
        ? `Rp ${incomeTax.toLocaleString('id-ID')}`
        : (incomeTax || 'Rp 0');

    const paidText = values.paidAmount || 'Rp 0';
    const statusText = values.status || '-';

    return (
        <div className="min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-10 items-start">
                {/* Left Column: Ringkasan Pencatatan Gaji */}
                <section>
                    <h3 className="text-base sm:text-lg font-normal text-text-darkest mb-1.5 sm:mb-2">
                        {config.summaryTitle || 'Ringkasan Pencatatan Gaji'}
                    </h3>

                    <div className="overflow-hidden rounded-[4px] border border-ui-border bg-white">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-ui-border px-4 py-2.5 sm:py-3 text-sm text-brand-dark">
                            <span>Pajak Penghasilan</span>
                            <span className="text-right font-medium text-text-darkest">
                                {isLoading ? (
                                    <span className="inline-block h-4 w-20 bg-slate-200 rounded animate-pulse" />
                                ) : (
                                    formattedTax
                                )}
                            </span>
                        </div>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-ui-border px-4 py-2.5 sm:py-3 text-sm text-brand-dark">
                            <span>Dibayar</span>
                            <span className="text-right font-medium text-text-darkest">
                                {isLoading ? (
                                    <span className="inline-block h-4 w-24 bg-slate-200 rounded animate-pulse" />
                                ) : (
                                    paidText
                                )}
                            </span>
                        </div>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center px-4 py-2.5 sm:py-3 text-sm text-brand-dark">
                            <span>Status</span>
                            <span className="text-right font-medium text-text-darkest">
                                {isLoading ? (
                                    <span className="inline-block h-4 w-20 bg-slate-200 rounded animate-pulse" />
                                ) : (
                                    statusText
                                )}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Right Column: Riwayat Pembayaran */}
                <section>
                    <h3 className="text-base sm:text-lg font-normal text-text-darkest mb-1.5 sm:mb-2">
                        Riwayat Pembayaran
                    </h3>

                    <div className="overflow-hidden rounded-[4px] border border-ui-border bg-white">
                        {isLoading ? (
                            [1, 2, 3].map((skeletonKey) => (
                                <div
                                    key={`skeleton-${skeletonKey}`}
                                    className="flex items-center justify-between px-4 py-2.5 sm:py-3 border-b border-ui-border last:border-b-0 animate-pulse"
                                >
                                    <div className="min-w-0 space-y-1.5">
                                        <div className="h-3.5 w-32 bg-slate-200 rounded" />
                                        <div className="h-2.5 w-20 bg-slate-100 rounded" />
                                    </div>
                                    <div className="h-4 w-24 bg-slate-200 rounded" />
                                </div>
                            ))
                        ) : paymentList.length > 0 ? (
                            paymentList.map((payment, index) => {
                                const docNumber = payment.number || payment.document_number || payment.documentNumber || payment.id;
                                const formattedDate = formatPaymentDate(payment.date || payment.entry_date);
                                const amountText = payment.amount ?? values.paidAmount ?? 'Rp 0';

                                return (
                                    <div
                                        key={payment.id || `payment-${index}`}
                                        onClick={() => onOpenPayment?.(payment)}
                                        className="flex items-center justify-between px-4 py-2.5 sm:py-3 border-b border-ui-border last:border-b-0 transition-colors hover:bg-brand-blue-light cursor-pointer"
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
                            })
                        ) : (
                            <div className="px-4 py-6 text-center text-xs sm:text-sm text-slate-400 font-normal">
                                Tidak ada riwayat pembayaran
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
