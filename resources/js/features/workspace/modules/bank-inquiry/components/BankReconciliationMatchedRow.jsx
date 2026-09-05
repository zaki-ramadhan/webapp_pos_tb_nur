import JurnalCard from './JurnalCard';
import { formatDisplayDate } from './JurnalCard';
import { Check } from 'lucide-react';

export default function BankReconciliationMatchedRow({
    item,
    isReconciling = false,
    onReconcile,
    onUnreconcile,
}) {
    const { excel, system, status, reason } = item;
    const isReconciled = system?.status === 'Reconciled';
    const sysDocNumber = system?.documentNumber || system?.sourceNumber || system?.document_number;

    const formattedExcelAmt = excel
        ? new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(excel.amount)
        : '0';
    const typeLabel = excel ? (excel.type === 'DB' ? '(Dr)' : '(Cr)') : '';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-stretch">
            {/* Left Column: JURNAL SISTEM */}
            <div className="h-full">
                {system ? (
                    <JurnalCard row={system} />
                ) : (
                    <div className="border border-slate-200 rounded-[4px] bg-slate-50/70 p-4 flex flex-col justify-center items-center text-center min-h-[110px] h-full">
                        <span className="text-sm font-normal text-slate-500">Tidak ada data di sistem</span>
                    </div>
                )}
            </div>

            {/* Right Column: REKENING KORAN BANK */}
            <div className="border border-[#72b1cb] rounded-[4px] bg-white p-3 flex flex-col justify-between min-h-[110px] h-full shadow-xs">
                {excel ? (
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start text-sm text-slate-900 gap-2">
                            <span className="font-normal">{formatDisplayDate(excel.date)}</span>
                            <span className="font-semibold text-base text-slate-900 whitespace-nowrap">
                                {typeLabel} {formattedExcelAmt}
                            </span>
                        </div>

                        <div className="text-sm font-normal text-slate-900 leading-snug text-left my-2">
                            {excel.description || '-'}
                        </div>

                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-sm">
                            {/* Match Status / Label */}
                            {status === 'matched' && (
                                <span className="text-sm font-normal text-emerald-700 flex items-center gap-1.5">
                                    <Check className="h-4 w-4 stroke-[2]" />
                                    <span>Cocok</span>
                                </span>
                            )}
                            {status === 'excel_only' && (
                                <span className="text-sm font-normal text-slate-500">
                                    Hanya di rekening koran
                                </span>
                            )}
                            {status === 'discrepancy' && (
                                <span className="text-sm font-normal text-amber-700">
                                    Perbedaan: {reason}
                                </span>
                            )}

                            {/* Action Button */}
                            {system && (
                                <div>
                                    {isReconciled ? (
                                        <button
                                            type="button"
                                            disabled={isReconciling}
                                            onClick={() => onUnreconcile?.(sysDocNumber, false, system.account_id)}
                                            className="text-sm font-normal text-slate-600 hover:text-rose-600 hover:underline cursor-pointer"
                                        >
                                            Batalkan
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={isReconciling}
                                            onClick={() => onReconcile?.(sysDocNumber, true, system.account_id)}
                                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[#387593] hover:bg-[#2c617c] text-white text-sm font-normal shadow-xs transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                        >
                                            <Check className="h-3.5 w-3.5 stroke-[2]" />
                                            <span>Cocokkan</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full justify-between items-center text-center">
                        <div className="flex-1 flex items-center justify-center">
                            <span className="text-sm font-normal text-slate-500">Tidak ada di rekening koran</span>
                        </div>
                        {system && !isReconciled && (
                            <button
                                type="button"
                                disabled={isReconciling}
                                onClick={() => onReconcile?.(sysDocNumber, true, system.account_id)}
                                className="text-sm text-[#387593] hover:underline font-normal cursor-pointer pb-0.5"
                            >
                                Cocokkan Manual
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
