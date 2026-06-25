import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import TextInput from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import { PencilIcon } from '@/features/workspace/shared/Icons';

function AccountDetailModalContainer({
    accountCode,
    accountName,
    defaultSide,
    defaultAmount,
    defaultNotes,
    isEdit,
    resolve,
    onDestroy
}) {
    const [open, setOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('detail');
    const [side, setSide] = useState(defaultSide || 'debit');

    // Format initial amount for debit and credit sides separately
    const [debitAmount, setDebitAmount] = useState(() => {
        if ((defaultSide || 'debit') === 'debit') {
            const val = parseInt(String(defaultAmount || '').replace(/\D/g, ''), 10);
            return isNaN(val) || val === 0 ? '0' : val.toLocaleString('id-ID');
        }
        return '0';
    });

    const [creditAmount, setCreditAmount] = useState(() => {
        if (defaultSide === 'credit') {
            const val = parseInt(String(defaultAmount || '').replace(/\D/g, ''), 10);
            return isNaN(val) || val === 0 ? '0' : val.toLocaleString('id-ID');
        }
        return '0';
    });

    const [notes, setNotes] = useState(defaultNotes || '');
    const [error, setError] = useState('');

    function handleClose() {
        setOpen(false);
        setTimeout(() => {
            resolve(null);
            onDestroy();
        }, 300);
    }

    function handleDelete() {
        setOpen(false);
        setTimeout(() => {
            resolve({ action: 'delete' });
            onDestroy();
        }, 300);
    }

    function handleAmountChange(e) {
        const rawVal = e.target.value;
        const cleanVal = rawVal.replace(/\D/g, '');
        if (!cleanVal) {
            if (side === 'debit') {
                setDebitAmount('0');
            } else {
                setCreditAmount('0');
            }
            return;
        }
        const num = parseInt(cleanVal, 10);
        const formatted = num.toLocaleString('id-ID');
        if (side === 'debit') {
            setDebitAmount(formatted);
        } else {
            setCreditAmount(formatted);
        }
        setError('');
    }

    function handleSave() {
        const activeAmount = side === 'debit' ? debitAmount : creditAmount;
        const cleanAmount = parseInt(activeAmount.replace(/\D/g, ''), 10) || 0;
        if (cleanAmount <= 0) {
            setError('Nilai harus lebih besar dari 0.');
            return;
        }

        setOpen(false);
        setTimeout(() => {
            resolve({
                side,
                amount: cleanAmount,
                notes: notes.trim()
            });
            onDestroy();
        }, 300);
    }

    return (
        <WorkspaceDialog
            open={open}
            onClose={handleClose}
            title="Detail Akun"
            headerIcon={PencilIcon}
            maxWidthClassName="max-w-[480px]"
            contentClassName="bg-white px-5 py-0 sm:px-6 min-h-[420px] flex flex-col"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div>
                        {isEdit ? (
                            <Button
                                onClick={handleDelete}
                                variant="secondary"
                                size="md"
                                className="border-red-150 hover:bg-danger-border text-error-border font-semibold rounded-[4px]"
                            >
                                Hapus
                            </Button>
                        ) : (
                            <span />
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-2.5">
                        <Button
                            onClick={handleSave}
                            variant="primary"
                            size="md"
                            className="min-w-[80px] rounded-[4px]"
                        >
                            Lanjut
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="flex border-b border-table-row-border -mx-5 px-5 sm:-mx-6 sm:px-6">
                <button
                    type="button"
                    onClick={() => setActiveTab('detail')}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                        activeTab === 'detail'
                            ? 'border-pink-accent text-pink-accent'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Detail Akun
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                        activeTab === 'info'
                            ? 'border-pink-accent text-pink-accent'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Info Lainnya
                </button>
            </div>

            {activeTab === 'detail' && (
                <div className="space-y-4 pt-5 pb-5 flex-1">
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                        <span className="text-sm text-slate-700 font-normal">Kode #</span>
                        <span className="text-sm text-slate-700 font-semibold">{accountCode}</span>
                    </div>

                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                        <span className="text-sm text-slate-700 font-normal">Nama Perkiraan</span>
                        <TextInput
                            value={accountName}
                            disabled
                            className="h-[38px] rounded-[4px]"
                            inputClassName="text-sm font-normal text-slate-700"
                        />
                    </div>

                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-4">
                        <span className="text-sm text-slate-700 font-normal pt-1.5">Nilai <span className="text-red-500">*</span></span>
                        <div className="space-y-3">
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                                    <input
                                        type="radio"
                                        name="side"
                                        value="debit"
                                        checked={side === 'debit'}
                                        onChange={() => setSide('debit')}
                                        className="h-4.5 w-4.5 border-slate-300 text-control-active focus:ring-control-active"
                                    />
                                    Debit
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                                    <input
                                        type="radio"
                                        name="side"
                                        value="credit"
                                        checked={side === 'credit'}
                                        onChange={() => setSide('credit')}
                                        className="h-4.5 w-4.5 border-slate-300 text-control-active focus:ring-control-active"
                                    />
                                    Kredit
                                </label>
                            </div>

                            <div className="w-full max-w-[240px]">
                                <TextInput
                                    type="number"
                                    prefix="Rp"
                                    value={side === 'debit' ? debitAmount : creditAmount}
                                    onChange={handleAmountChange}
                                    error={error}
                                    className="h-[38px] rounded-[4px]"
                                    prefixClassName="min-w-0 px-3 justify-center text-slate-500 font-normal border-r-ui-border-medium bg-ui-bg-hover text-sm"
                                    inputClassName="text-slate-700 text-right text-sm"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'info' && (
                <div className="space-y-4 pt-5 pb-5 flex-1">
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-4">
                        <span className="text-sm text-slate-700 font-normal pt-1">Catatan / Keterangan</span>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Catatan tambahan untuk baris ini..."
                            rows={4}
                            maxLength={200}
                            className="w-full resize-none rounded-[4px] border border-ui-border px-3 py-2 text-sm text-slate-700 outline-none focus:border-control-active focus:ring-1 focus:ring-control-active"
                        />
                    </div>
                </div>
            )}
        </WorkspaceDialog>
    );
}

export function showAccountDetailModal(params) {
    return new Promise((resolve) => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const root = createRoot(div);

        function onDestroy() {
            root.unmount();
            div.remove();
        }

        root.render(
            <AccountDetailModalContainer
                accountCode={params.accountCode}
                accountName={params.accountName}
                defaultSide={params.defaultSide}
                defaultAmount={params.defaultAmount}
                defaultNotes={params.defaultNotes}
                isEdit={params.isEdit}
                resolve={resolve}
                onDestroy={onDestroy}
            />
        );
    });
}
