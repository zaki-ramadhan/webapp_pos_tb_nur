import { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { PencilIcon } from '@/features/workspace/shared/Icons';
import { showErrorToast, showSuccessToast } from '@/components/feedback/toast';
import { formatCurrencyValue, parseNumericInput } from './expenseEntryShared';

export default function ExpenseEntryLineItemModal({
    open,
    onClose,
    lineModalRecord,
    lineModalCurrentItem,
    onSave,
    onDelete,
}) {
    const [lineModalTab, setLineModalTab] = useState('rincian');
    const [lineModalValues, setLineModalValues] = useState({
        accountCode: '',
        accountName: '',
        amount: '',
        notes: '',
    });

    useEffect(() => {
        if (open) {
            setLineModalTab('rincian');
            if (lineModalCurrentItem) {
                setLineModalValues({
                    accountCode: lineModalCurrentItem.accountCode ?? '',
                    accountName: lineModalCurrentItem.accountName ?? '',
                    amount: formatCurrencyValue(lineModalCurrentItem.amountRaw ?? 0),
                    notes: lineModalCurrentItem.notes ?? '',
                });
            } else if (lineModalRecord) {
                setLineModalValues({
                    accountCode: lineModalRecord.code ?? '',
                    accountName: lineModalRecord.name ?? '',
                    amount: '',
                    notes: '',
                });
            }
        }
    }, [open, lineModalRecord, lineModalCurrentItem]);

    function handleLineModalSubmit(e) {
        if (e) e.preventDefault();

        const amount = parseNumericInput(lineModalValues.amount) ?? 0;

        if (amount <= 0) {
            showErrorToast({
                message: 'Nilai beban harus diisi dan lebih dari 0.',
            });
            return;
        }

        onSave?.({
            accountName: lineModalValues.accountName,
            amount: amount,
            notes: lineModalValues.notes,
        });
        onClose();
        showSuccessToast({
            message: 'Rincian beban diperbarui.',
        });
    }

    function handleLineModalDelete() {
        if (!lineModalCurrentItem) return;
        onDelete?.();
        onClose();
        showSuccessToast({
            message: 'Rincian beban dihapus.',
        });
    }

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Rincian Beban"
            headerIcon={PencilIcon}
            maxWidthClassName="max-w-[480px]"
            contentClassName="bg-white px-5 py-0 sm:px-6 min-h-[220px] flex flex-col pt-0 pb-4"
            footer={
                <div className="flex justify-between items-center w-full">
                    <div>
                        {lineModalCurrentItem ? (
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={handleLineModalDelete}
                                className="border-red-150 hover:bg-danger-border text-error-border font-semibold"
                            >
                                Hapus
                            </Button>
                        ) : (
                            <span />
                        )}
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleLineModalSubmit}
                        className="bg-brand-blue-dark hover:bg-brand-blue-darker font-semibold shadow-btn-blue-hover"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            <div className="flex border-b border-table-row-border -mx-5 px-5 sm:-mx-6 sm:px-6 mb-4 mt-0">
                <button
                    type="button"
                    onClick={() => setLineModalTab('rincian')}
                    className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                        lineModalTab === 'rincian'
                            ? 'border-pink-accent text-pink-accent'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Rincian Beban
                </button>
                <button
                    type="button"
                    onClick={() => setLineModalTab('info')}
                    className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                        lineModalTab === 'info'
                            ? 'border-pink-accent text-pink-accent'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Info lainnya
                </button>
            </div>

            {lineModalTab === 'rincian' && (
                <div className="space-y-4 flex-1 pb-4">
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                        <span className="text-sm text-slate-700 font-normal">Akun</span>
                        <span className="text-sm text-slate-700 font-medium select-all">{lineModalValues.accountCode}</span>
                    </div>

                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                        <span className="text-sm text-slate-700 font-normal">Untuk Beban</span>
                        <TextInput
                            id="accountName"
                            name="accountName"
                            value={lineModalValues.accountName}
                            onChange={(e) =>
                                setLineModalValues((prev) => ({
                                    ...prev,
                                    accountName: e.target.value,
                                }))
                            }
                            placeholder="Nama rincian beban"
                            className="h-[36px] rounded-[4px] border-ui-border"
                            inputClassName="text-sm font-normal text-slate-700"
                        />
                    </div>

                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-4">
                        <span className="text-sm text-slate-700 font-normal pt-2">
                            Nilai <span className="text-red-500">*</span>
                        </span>
                        <div className="w-full max-w-[240px]">
                            <TextInput
                                id="amount"
                                name="amount"
                                prefix="Rp"
                                value={lineModalValues.amount}
                                onChange={(e) =>
                                    setLineModalValues((prev) => ({
                                        ...prev,
                                        amount: e.target.value,
                                    }))
                                }
                                maxLength={11}
                                placeholder="0"
                                className="h-[36px] rounded-[4px] border-ui-border"
                                prefixClassName="min-w-0 px-3 justify-center text-slate-500 font-normal border-r-ui-border-medium bg-ui-bg-hover text-sm"
                                inputClassName="text-slate-700 text-right text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            {lineModalTab === 'info' && (
                <div className="space-y-4 flex-1 pb-4">
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-4">
                        <span className="text-sm text-slate-700 font-normal pt-1">Catatan</span>
                        <div className="flex-1">
                            <TextareaField
                                id="notes"
                                name="notes"
                                value={lineModalValues.notes}
                                onChange={(e) =>
                                    setLineModalValues((prev) => ({
                                        ...prev,
                                        notes: e.target.value,
                                    }))
                                }
                                placeholder="Catatan tambahan untuk baris ini..."
                                rows={4}
                                className="border-ui-border rounded-[4px]"
                                textareaClassName="min-h-[80px] text-sm font-normal text-slate-700"
                            />
                        </div>
                    </div>
                </div>
            )}
        </WorkspaceDialog>
    );
}
