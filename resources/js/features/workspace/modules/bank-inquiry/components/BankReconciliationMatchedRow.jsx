import JurnalCard from './JurnalCard';
import { formatDisplayDate } from './JurnalCard';
import { Check, Plus, Minus, ArrowRightLeft } from 'lucide-react';

export default function BankReconciliationMatchedRow({
    item,
    isReconciling = false,
    onReconcile,
    onUnreconcile,
    onRequestConfirmReconcile,
    selectedAccount,
    bankLabel,
}) {
    const { excel, system, status, reason } = item;
    const isReconciled = system?.status === 'Reconciled';
    const sysDocNumber = system?.documentNumber || system?.sourceNumber || system?.document_number;

    const formattedExcelAmt = excel
        ? new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(excel.amount)
        : '0';
    const typeLabel = excel ? (excel.type === 'DB' ? '(Dr)' : '(Cr)') : '';

    function handleCreateTransaction(targetPageId) {
        let formattedDate = '';
        if (excel?.date) {
            const d = new Date(excel.date);
            if (!isNaN(d.getTime())) {
                formattedDate = d.toISOString().split('T')[0];
            } else {
                formattedDate = String(excel.date);
            }
        }

        const cleanAmount = Math.abs(Number(excel?.amount || 0));
        const formattedAmount = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(cleanAmount);
        const bankAccountName = bankLabel || selectedAccount?.name || '';
        const bankAccountId = selectedAccount?.id || null;

        let initialValues = {};

        if (targetPageId === 'cash-receipt') {
            initialValues = {
                entryDate: formattedDate,
                bankAccounts: bankAccountName ? [bankAccountName] : [],
                __primaryAccountId: bankAccountId,
                notes: excel?.description || '',
                lineItems: [
                    {
                        id: 'line-1',
                        accountCode: '',
                        accountName: '',
                        amount: formattedAmount,
                        notes: excel?.description || '',
                    },
                ],
            };
        } else if (targetPageId === 'cash-payment') {
            initialValues = {
                entryDate: formattedDate,
                bankAccounts: bankAccountName ? [bankAccountName] : [],
                __primaryAccountId: bankAccountId,
                notes: excel?.description || '',
                lineItems: [
                    {
                        id: 'line-1',
                        accountCode: '',
                        accountName: '',
                        amount: formattedAmount,
                        notes: excel?.description || '',
                    },
                ],
            };
        } else if (targetPageId === 'bank-transfer') {
            const isDB = excel?.type === 'DB';
            initialValues = {
                entryDate: formattedDate,
                notes: excel?.description || '',
                transferValue: formattedAmount,
                fromBankAccounts: isDB && bankAccountName ? [bankAccountName] : [],
                __fromAccountId: isDB ? bankAccountId : null,
                toBankAccounts: !isDB && bankAccountName ? [bankAccountName] : [],
                __toAccountId: !isDB ? bankAccountId : null,
            };
        }

        window.dispatchEvent(
            new CustomEvent('workspace:open-content', {
                detail: {
                    pageId: targetPageId,
                    kind: 'content',
                    initialValues,
                },
            })
        );
    }

    const systemColumnNode = (
        <div className="h-full">
            {system ? (
                <JurnalCard row={system} />
            ) : (
                <div className="border border-dashed border-slate-300 rounded-[4px] bg-slate-50/70 p-3.5 flex flex-col justify-between min-h-[96px] h-full">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-normal text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded">
                            Belum tercatat di sistem
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {excel?.type === 'CR' ? (
                            <button
                                type="button"
                                onClick={() => handleCreateTransaction('cash-receipt')}
                                className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-[4px] bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-normal shadow-xs transition active:scale-[0.98] cursor-pointer"
                            >
                                <Plus className="h-4 w-4 stroke-[2]" />
                                <span>Catat Penerimaan (+)</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleCreateTransaction('cash-payment')}
                                className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-[4px] bg-[#387593] hover:bg-[#2c617c] text-white text-sm font-normal shadow-xs transition active:scale-[0.98] cursor-pointer"
                            >
                                <Minus className="h-4 w-4 stroke-[2]" />
                                <span>Catat Pembayaran (-)</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => handleCreateTransaction('bank-transfer')}
                            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-[4px] border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-normal transition cursor-pointer"
                        >
                            <ArrowRightLeft className="h-4 w-4 stroke-[2]" />
                            <span>Transfer Bank</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const excelColumnNode = (
        <div className="border border-[#72b1cb] rounded-[4px] bg-white px-3.5 py-2.5 flex flex-col justify-between min-h-[96px] h-full shadow-xs">
            {excel ? (
                <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start text-sm text-slate-900 gap-2">
                        <span className="font-normal">{formatDisplayDate(excel.date)}</span>
                        <span className="font-semibold text-base text-slate-900 whitespace-nowrap">
                            {typeLabel} {formattedExcelAmt}
                        </span>
                    </div>

                    <div className="text-sm font-normal text-slate-900 leading-snug text-left my-1">
                        {excel.description || ''}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-100 text-xs">
                        <span className="text-slate-500 font-normal truncate">
                            {reason}
                        </span>
                        {status === 'matched' && (
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-normal">
                                    <Check className="h-3.5 w-3.5 stroke-[2]" />
                                    <span>Cocok</span>
                                </span>
                                {isReconciled ? (
                                    <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-normal">
                                        Sudah Rekonsiliasi
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={isReconciling}
                                        onClick={() => {
                                            if (onRequestConfirmReconcile && system) {
                                                onRequestConfirmReconcile(system);
                                            } else {
                                                onReconcile?.(sysDocNumber, true, system?.account_id);
                                            }
                                        }}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-[4px] bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 font-normal transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                    >
                                        <Check className="h-3.5 w-3.5 stroke-[2]" />
                                        <span>{isReconciling ? 'Memproses...' : 'Rekonsiliasi'}</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-start min-h-[96px] h-full">
                    {system && (
                        isReconciled ? (
                            <div className="flex flex-col items-start justify-center">
                                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] text-sm font-normal bg-[#2a6d8c] text-white shadow-sm">
                                    <Check className="h-4 w-4 stroke-[2]" />
                                    <span>Ada di Rekening Koran</span>
                                </span>
                                <button
                                    type="button"
                                    disabled={isReconciling}
                                    onClick={() => onUnreconcile?.(sysDocNumber, false, system.account_id)}
                                    className="text-sm text-slate-900 hover:text-rose-600 hover:underline mt-1.5 font-normal disabled:opacity-50 cursor-pointer"
                                >
                                    {isReconciling ? 'Membatalkan...' : 'Batalkan kecocokan'}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                disabled={isReconciling}
                                onClick={() => {
                                    if (onRequestConfirmReconcile) {
                                        onRequestConfirmReconcile(system);
                                    } else {
                                        onReconcile?.(sysDocNumber, true, system.account_id);
                                    }
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-[#387593] hover:bg-[#2c617c] text-white px-3.5 py-1.5 text-sm font-normal transition shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                            >
                                <Check className="h-4 w-4 stroke-[2]" />
                                <span>Ada di Rekening Koran</span>
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-stretch">
            {isSwapped ? (
                <>
                    {excelColumnNode}
                    {systemColumnNode}
                </>
            ) : (
                <>
                    {systemColumnNode}
                    {excelColumnNode}
                </>
            )}
        </div>
    );
}
