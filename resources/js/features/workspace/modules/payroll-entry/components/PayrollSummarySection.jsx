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

const componentDefs = [
    { key: 'basicSalary', label: 'Gaji Pokok' },
    { key: 'positionAllowance', label: 'Tunjangan Jabatan' },
    { key: 'transportAllowance', label: 'Tunjangan Transportasi' },
    { key: 'mealAllowance', label: 'Uang Makan' },
    { key: 'overtimeAllowance', label: 'Tunjangan Lembur' },
    { key: 'jkkJkmAllowance', label: 'Tunjangan JKK/JKM' },
    { key: 'insuranceAllowance', label: 'Tunjangan Premi Asuransi' },
    { key: 'pensionAllowance', label: 'Tunjangan Pensiun/THT/JHT' },
    { key: 'installmentDeduction', label: 'Potongan Kasbon / Pinjaman' },
    { key: 'salaryReduction', label: 'Potongan Absen / Potong Gaji' },
];

export default function PayrollSummarySection({
    config = {},
    values = {},
    employeeRows = [],
    incomeTax = 0,
    isLoading = false,
    onOpenPayment = null,
}) {
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
    const statusLower = String(values.status ?? '').toLowerCase();
    const isFullyPaid = statusLower === 'terbayar' || statusLower === 'lunas' || statusLower === 'paid';

    const accumulatedComponents = useMemo(() => {
        const rows = Array.isArray(employeeRows) && employeeRows.length > 0
            ? employeeRows
            : (Array.isArray(values.employeeRows) ? values.employeeRows : []);

        const totals = {};
        for (const def of componentDefs) {
            totals[def.key] = 0;
        }

        for (const row of rows) {
            const base = Number(row.basicSalary) || Number(row.grossIncomeRaw) || Number(row.gross_income) || 0;
            totals.basicSalary += base;
            totals.positionAllowance += Number(row.positionAllowance ?? row.position_allowance ?? 0);
            totals.transportAllowance += Number(row.transportAllowance ?? row.transport_allowance ?? 0);
            totals.mealAllowance += Number(row.mealAllowance ?? row.meal_allowance ?? 0);
            totals.overtimeAllowance += Number(row.overtimeAllowance ?? row.overtime_allowance ?? 0);
            totals.jkkJkmAllowance += (Number(row.jkkJkmAllowance ?? 0) || (Number(row.jkkAllowance ?? 0) + Number(row.jkmAllowance ?? 0)));
            totals.insuranceAllowance += Number(row.insuranceAllowance ?? row.healthPremiAllowance ?? row.insurance_allowance ?? 0);
            totals.pensionAllowance += Number(row.pensionAllowance ?? row.pension_allowance ?? 0);
            totals.installmentDeduction += Number(row.installmentDeduction ?? row.installment_deduction ?? 0);
            totals.salaryReduction += Number(row.salaryReduction ?? row.salary_reduction ?? 0);
        }

        const items = componentDefs
            .map((def) => ({
                label: def.label,
                value: totals[def.key] || 0,
            }))
            .filter((item) => item.value > 0);

        if (items.length === 0 && rows.length > 0) {
            const totalGross = rows.reduce((sum, r) => sum + (Number(r.grossIncomeRaw ?? r.unit_price) || 0), 0);
            if (totalGross > 0) {
                items.push({ label: 'Gaji Pokok', value: totalGross });
            }
        }

        return items;
    }, [employeeRows, values.employeeRows]);

    return (
        <div className="min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-10 items-start">
                {/* Left Column: Ringkasan Pencatatan Gaji */}
                <section>
                    <h3 className="text-base sm:text-lg font-normal text-text-darkest mb-1.5 sm:mb-2">
                        {config.summaryTitle || 'Ringkasan Pencatatan Gaji'}
                    </h3>

                    <div className="overflow-hidden rounded-[4px] border border-ui-border bg-white">
                        {isLoading ? (
                            [1, 2, 3].map((k) => (
                                <div
                                    key={`left-skeleton-${k}`}
                                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-ui-border last:border-b-0 px-4 py-2 sm:py-2.5 text-sm text-brand-dark animate-pulse"
                                >
                                    <div className="h-3.5 w-28 bg-slate-200 rounded" />
                                    <div className="h-4 w-20 bg-slate-200 rounded" />
                                </div>
                            ))
                        ) : isFullyPaid ? (
                            <>
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-ui-border px-4 py-2 sm:py-2.5 text-sm text-brand-dark">
                                    <span>Pajak Penghasilan</span>
                                    <span className="text-right font-semibold text-text-darkest">
                                        {formattedTax}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-ui-border px-4 py-2 sm:py-2.5 text-sm text-brand-dark">
                                    <span>Dibayar</span>
                                    <span className="text-right font-semibold text-text-darkest">
                                        {paidText}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center px-4 py-2 sm:py-2.5 text-sm text-brand-dark">
                                    <span>Status</span>
                                    <span className="text-right font-semibold text-text-darkest">
                                        {statusText}
                                    </span>
                                </div>
                            </>
                        ) : accumulatedComponents.length > 0 ? (
                            accumulatedComponents.map((item) => (
                                <div
                                    key={item.label}
                                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-ui-border last:border-b-0 px-4 py-2 sm:py-2.5 text-sm text-brand-dark"
                                >
                                    <span>{item.label}</span>
                                    <span className="text-right font-semibold text-text-darkest">
                                        Rp {item.value.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-xs sm:text-sm text-slate-400 font-normal">
                                Belum ada rincian komponen gaji karyawan
                            </div>
                        )}
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
                                    className="flex items-center justify-between px-4 py-2 sm:py-2.5 border-b border-ui-border last:border-b-0 animate-pulse"
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
                                        className="flex items-center justify-between px-4 py-2 sm:py-2.5 border-b border-ui-border last:border-b-0 transition-colors hover:bg-brand-blue-light cursor-pointer"
                                    >
                                        <div className="min-w-0">
                                            <span className="text-sm font-semibold text-brand-blue-accent">
                                                {docNumber}
                                            </span>
                                            <div className="mt-0.5 text-xs text-slate-500 font-normal">
                                                {formattedDate}
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right text-sm font-semibold text-text-darkest">
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
