import { useEffect, useState } from 'react';

import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
import TextareaField from '@/components/ui/TextareaField';
import { PencilIcon } from '@/features/workspace/shared/Icons';
import { showErrorToast } from '@/components/feedback/toast';
import { parseNumericInput, formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';

export default function TransferFeeModal({
    open,
    onClose,
    onSave,
    onDelete,
    currentItem,
    feeAccount,
}) {
    const [activeTab, setActiveTab] = useState('detail');
    const [feeCustomName, setFeeCustomName] = useState('');
    const [feeAmount, setFeeAmount] = useState('0');
    const [feeChargedTo, setFeeChargedTo] = useState('Bank Pengirim');
    const [feeNotes, setFeeNotes] = useState('');

    useEffect(() => {
        if (open) {
            setActiveTab('detail');
            setFeeCustomName(currentItem?.accountName ?? feeAccount?.name ?? '');
            setFeeAmount(currentItem?.amount ?? '0');
            setFeeChargedTo(currentItem?.chargedTo ?? 'Bank Pengirim');
            setFeeNotes(currentItem?.notes ?? '');
        }
    }, [open, currentItem, feeAccount]);

    function handlePrimaryAction() {
        if (activeTab === 'detail') {
            if (!feeCustomName.trim()) {
                showErrorToast({ message: 'Nama Akun wajib diisi.' });
                return;
            }
            setActiveTab('notes');
        } else {
            const amountNum = parseNumericInput(feeAmount);
            if (!feeCustomName.trim()) {
                showErrorToast({ message: 'Nama Akun wajib diisi.' });
                return;
            }
            if (amountNum <= 0) {
                showErrorToast({ message: 'Nilai biaya transfer harus lebih dari 0.' });
                return;
            }

            const nextItem = {
                id: currentItem?.id ?? `draft-fee-${Date.now()}`,
                __lineId: currentItem?.__lineId ?? null,
                __accountId: feeAccount?.id ?? currentItem?.__accountId ?? null,
                accountCode: feeAccount?.code ?? currentItem?.accountCode ?? '',
                accountName: feeCustomName.trim(),
                amount: formatCurrencyValue(amountNum),
                chargedTo: feeChargedTo,
                notes: feeNotes.trim(),
            };

            onSave(nextItem);
        }
    }

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Biaya Transfer"
            headerIcon={PencilIcon}
            maxWidthClassName="max-w-[500px]"
            contentClassName="bg-white px-5 py-0 sm:px-6 min-h-[220px] flex flex-col pt-0 pb-4"
            footer={
                <div className="flex justify-between items-center w-full">
                    {currentItem ? (
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={() => onDelete(currentItem.id)}
                            className="border-red-150 hover:bg-danger-border text-error-border font-medium"
                        >
                            Hapus
                        </Button>
                    ) : (
                        <div />
                    )}
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handlePrimaryAction}
                        className="bg-brand-blue-dark hover:bg-brand-blue-darker font-medium shadow-btn-blue-hover"
                    >
                        {activeTab === 'detail' ? 'Lanjut' : 'Simpan'}
                    </Button>
                </div>
            }
        >
            <div className="flex border-b border-table-row-border -mx-5 px-5 sm:-mx-6 sm:px-6 mb-4 mt-0">
                <button
                    type="button"
                    onClick={() => setActiveTab('detail')}
                    className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                        activeTab === 'detail'
                            ? 'border-pink-accent text-pink-accent'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Biaya Transfer
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('notes')}
                    className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                        activeTab === 'notes'
                            ? 'border-pink-accent text-pink-accent'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Info lainnya
                </button>
            </div>

            <div className="min-h-[200px] flex flex-col justify-start">
                {activeTab === 'detail' && (
                    <div className="space-y-2.5">
                        <div className="grid grid-cols-[130px_1fr] items-center gap-4">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">Nama Akun</label>
                            <TextInput
                                type="text"
                                value={feeCustomName}
                                onChange={(e) => setFeeCustomName(e.target.value)}
                                placeholder="Nama Akun..."
                                className="h-[34px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                            />
                        </div>

                        <div className="grid grid-cols-[130px_1fr] items-center gap-4">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">
                                Nilai <span className="text-red-500">*</span>
                            </label>
                            <div className="max-w-[276px]">
                                <TextInput
                                    type="text"
                                    value={feeAmount}
                                    onChange={(e) => setFeeAmount(e.target.value)}
                                    prefix="Rp"
                                    maxLength={11}
                                    className="h-[34px] rounded-[4px] border-ui-border"
                                    prefixClassName="min-w-[42px] justify-center border-r-ui-border-medium bg-ui-bg-hover px-2 text-xs sm:text-sm text-text-light"
                                    inputClassName="text-right text-xs sm:text-sm text-brand-dark"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[130px_1fr] items-center gap-4">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">Dibebankan ke</label>
                            <SelectField
                                value={feeChargedTo}
                                onChange={(e) => setFeeChargedTo(e.target.value)}
                                className="h-[34px] rounded-[4px] border-ui-border text-xs sm:text-sm text-brand-dark"
                            >
                                <option value="Bank Pengirim">Bank Pengirim</option>
                                <option value="Bank Tujuan">Bank Tujuan</option>
                            </SelectField>
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="space-y-2.5">
                        <div className="grid grid-cols-[130px_1fr] items-start gap-4">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">Catatan</label>
                            <TextareaField
                                value={feeNotes}
                                onChange={(e) => setFeeNotes(e.target.value)}
                                rows={4}
                                className="rounded-[4px] border-ui-border"
                                textareaClassName="min-h-[70px] px-4 py-3 text-xs sm:text-sm text-brand-dark"
                            />
                        </div>
                    </div>
                )}
            </div>
        </WorkspaceDialog>
    );
}
