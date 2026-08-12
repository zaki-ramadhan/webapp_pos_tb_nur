import { useState, useEffect } from 'react';
import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { formatErrorMessageList } from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import { CloseIcon } from '@/features/workspace/shared/Icons';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export function OpeningBalanceModal({
    isOpen,
    onClose,
    onSave,
    partnerType = 'customer',
    existingCount = 0,
}) {
    const isCustomer = partnerType !== 'supplier';
    const modalTitle = isCustomer ? 'Piutang Awal' : 'Utang Awal';

    const [date, setDate] = useState(() => buildTodayDisplayDate());
    const [docNumber, setDocNumber] = useState('');
    const [salesperson, setSalesperson] = useState([]);
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });

    useEffect(() => {
        if (isOpen) {
            setDate(buildTodayDisplayDate());
            const prefix = isCustomer ? 'SI' : 'PI';
            const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '.');
            const seq = String(existingCount + 1).padStart(5, '0');
            setDocNumber(`${prefix}.${yearMonth}.${seq}`);
            setSalesperson([]);
            setAmount('');
            setNotes('');
            setErrorModal({ open: false, title: '', message: '' });
        }
    }, [isOpen, existingCount, isCustomer]);

    const handleSave = () => {
        const numericAmount = parseAmountInput(amount);
        if (!numericAmount || numericAmount <= 0) {
            setErrorModal({
                open: true,
                title: 'Terjadi Permasalahan pada Pemrosesan',
                message: formatErrorMessageList('Jumlah harus diisi'),
            });
            return;
        }

        onSave?.({
            date,
            number: docNumber,
            salesperson,
            amount: numericAmount,
            notes,
            currency: 'Indonesian Rupiah',
        });
        onClose?.();
    };

    return (
        <>
            <ModalBase
                open={isOpen}
                isOpen={isOpen}
                onBackdropClick={onClose}
                className="bg-black/40"
                panelClassName="max-w-[460px] p-0 overflow-hidden"
            >
                {/* Header matching standard modal typography */}
                <div className="bg-[#0A2A55] px-4 py-2 text-white">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            <h2 className="text-sm font-normal text-white">{modalTitle}</h2>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] text-white hover:text-red-800 transition-colors cursor-pointer"
                            aria-label="Tutup"
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3.5 bg-white">
                    <div className="grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center">
                        <label className="text-sm font-normal text-slate-700">
                            Tanggal <span className="text-red-500">*</span>
                        </label>
                        <TransactionDateInput
                            value={date}
                            onChange={(val) => setDate(val)}
                            className="w-full"
                        />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center">
                        <label className="text-sm font-normal text-slate-700">
                            Nomor <span className="text-red-500">*</span>
                        </label>
                        <TextInput
                            value={docNumber}
                            readOnly
                            disabled
                            className="h-[38px] rounded-[4px] border-ui-border bg-slate-100 text-slate-600 cursor-not-allowed"
                        />
                    </div>

                    {isCustomer && (
                        <div className="grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center">
                            <label className="text-sm font-normal text-slate-700">Penjual</label>
                            <AccountLookupField
                                id="salesperson"
                                resource="employees"
                                values={salesperson}
                                placeholder="Cari/Pilih..."
                                searchLabel="Cari Penjual"
                                onSelectAccount={(_, label) => {
                                    if (label) {
                                        setSalesperson((prev) => Array.isArray(prev) ? [...prev, label] : [label]);
                                    }
                                }}
                                onRemove={(idx) => {
                                    setSalesperson((prev) => Array.isArray(prev) ? prev.filter((_, i) => i !== idx) : []);
                                }}
                            />
                        </div>
                    )}

                    <div className="grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center">
                        <label className="text-sm font-normal text-slate-700">
                            Jumlah <span className="text-red-500">*</span>
                        </label>
                        <FormattedAmountInput
                            value={amount}
                            onChange={(val) => setAmount(val)}
                            prefix="Rp"
                            placeholder="0"
                            className="h-[38px] rounded-[4px]"
                        />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-start">
                        <label className="text-sm font-normal text-slate-700 pt-1.5">Keterangan</label>
                        <TextareaField
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Keterangan..."
                            className="rounded-[4px]"
                        />
                    </div>
                </div>

                {/* Footer matching standard modal button (No Batal button) */}
                <div className="flex items-center justify-end border-t border-ui-border-medium px-4 py-3 bg-white">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="inline-flex h-10 items-center justify-center rounded-[4px] border border-brand-blue bg-brand-blue px-6 text-sm font-normal text-white hover:bg-brand-blue-hover active:scale-[0.98] transition cursor-pointer shadow-button-primary"
                    >
                        Lanjut
                    </button>
                </div>
            </ModalBase>

            <ConfirmationModal
                open={errorModal.open}
                onClose={() => setErrorModal({ open: false, title: '', message: '' })}
                onConfirm={() => setErrorModal({ open: false, title: '', message: '' })}
                title={errorModal.title || 'Terjadi Permasalahan pada Pemrosesan'}
                message={errorModal.message}
                confirmLabel="OK"
                cancelLabel=""
                iconVariant="error"
            />
        </>
    );
}

export default OpeningBalanceModal;
