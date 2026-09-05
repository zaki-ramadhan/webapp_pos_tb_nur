import JurnalCard from './JurnalCard';
import { formatDisplayDate } from './JurnalCard';

export default function BankReconciliationMatchedRow({
    item,
    isReconciling = false,
    onReconcile,
    onUnreconcile,
}) {
    const { excel, system, status, reason } = item;
    const isReconciled = system?.status === 'Reconciled';
    const sysDocNumber = system?.documentNumber || system?.sourceNumber || system?.document_number;

    const formattedExcelAmt = excel ? new Intl.NumberFormat('id-ID').format(excel.amount) : '0';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-stretch">
            {/* Left Column: JURNAL SISTEM */}
            <div className="h-full">
                {system ? (
                    <JurnalCard row={system} />
                ) : (
                    <div className="border border-dashed border-slate-300 rounded-[4px] bg-slate-50 p-4 flex flex-col justify-center items-center text-center min-h-[110px] h-full">
                        <span className="text-xs font-semibold text-slate-500">Tidak ada data di sistem</span>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[260px]">
                            Mutasi bank ini belum dicatat sebagai transaksi penerimaan/pengeluaran di aplikasi.
                        </p>
                    </div>
                )}
            </div>

            {/* Right Column: REKENING KORAN BANK */}
            <div className="border border-[#a8d4e7] rounded-[4px] bg-white p-3.5 flex flex-col justify-between min-h-[110px] h-full shadow-xs">
                {excel ? (
                    <div className="flex flex-col h-full justify-between gap-2.5">
                        <div className="flex justify-between items-start text-xs sm:text-sm">
                            <span className="text-slate-600 font-medium">
                                {formatDisplayDate(excel.date)}
                            </span>
                            <div className="text-right">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded mr-1.5 ${
                                    excel.type === 'CR' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                    {excel.type === 'CR' ? '(Cr) Masuk' : '(Db) Keluar'}
                                </span>
                                <span className="font-bold text-slate-900">
                                    Rp {formattedExcelAmt}
                                </span>
                            </div>
                        </div>

                        <div className="text-xs text-slate-700 font-normal leading-snug break-words">
                            {excel.description || '-'}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                            {/* Match Status Badge */}
                            <div className="flex items-center gap-1.5">
                                {status === 'matched' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Cocok: {reason}
                                    </span>
                                )}
                                {status === 'discrepancy' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                        Perbedaan: {reason}
                                    </span>
                                )}
                                {status === 'excel_only' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                                        Hanya di Bank
                                    </span>
                                )}
                            </div>

                            {/* Action Button */}
                            {system && (
                                <div>
                                    {isReconciled ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Cocok
                                            </span>
                                            <button
                                                type="button"
                                                disabled={isReconciling}
                                                onClick={() => onUnreconcile?.(sysDocNumber, false, system.account_id)}
                                                className="text-[11px] text-slate-500 hover:text-rose-600 hover:underline cursor-pointer"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={isReconciling}
                                            onClick={() => onReconcile?.(sysDocNumber, true, system.account_id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[#387593] hover:bg-[#2c617c] text-white text-xs font-semibold shadow-2xs transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                        >
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>Cocokkan</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full justify-between gap-2">
                        <div className="text-xs text-slate-500 font-medium italic">
                            Tidak ditemukan pada rekening koran yang diimpor.
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Hanya di Sistem
                            </span>
                            {system && !isReconciled && (
                                <button
                                    type="button"
                                    disabled={isReconciling}
                                    onClick={() => onReconcile?.(sysDocNumber, true, system.account_id)}
                                    className="text-xs text-[#387593] hover:underline font-medium cursor-pointer"
                                >
                                    Cocokkan Manual
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
