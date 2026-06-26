import { useEffect, useState, useMemo } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import { PencilIcon } from '@/features/workspace/shared/Icons';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import SelectField from '@/components/ui/SelectField';
import { AccountLookupField, buildAccountLookupLabel } from '@/features/workspace/shared/AccountLookupControls';
import { parseNumericInput, formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';
import { showErrorToast } from '@/components/feedback/toast';

const MONTHS = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export default function MoneyMovementLineItemModal({
    open,
    onClose,
    record = null,
    currentItem = null,
    onSave,
    type = 'payment', // 'payment' or 'receipt'
}) {
    const isPayment = type === 'payment';
    const [activeTab, setActiveTab] = useState('detail');

    // Tab 1 state
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [amount, setAmount] = useState('0');

    // Tab 2 state
    const [notes, setNotes] = useState('');

    // Tab 3 state
    const [deferred, setDeferred] = useState(false);
    const [deferredAccount, setDeferredAccount] = useState(null);
    const [deferredDuration, setDeferredDuration] = useState('0');
    const [deferredStartType, setDeferredStartType] = useState('period'); // 'period' or 'manual'
    const [deferredStartMonth, setDeferredStartMonth] = useState(6); // Juni
    const [deferredStartYear, setDeferredStartYear] = useState(2026);

    // Sync state when modal opens or inputs change
    useEffect(() => {
        if (!open) return;

        setActiveTab('detail');

        if (currentItem) {
            // Editing existing
            setSelectedAccount({
                id: currentItem.__accountId,
                code: currentItem.accountCode,
                name: currentItem.accountName,
            });
            setAmount(currentItem.amount ? String(parseNumericInput(currentItem.amount)) : '0');
            setNotes(currentItem.notes ?? '');
            setDeferred(Boolean(currentItem.deferred));
            setDeferredAccount(
                currentItem.deferredAccountId
                    ? {
                          id: currentItem.deferredAccountId,
                          code: '',
                          name: currentItem.deferredAccountLabel,
                      }
                    : null
            );
            setDeferredDuration(String(currentItem.deferredDuration ?? '0'));
            setDeferredStartType(currentItem.deferredStartType ?? 'period');
            setDeferredStartMonth(currentItem.deferredStartMonth ?? 6);
            setDeferredStartYear(currentItem.deferredStartYear ?? 2026);
        } else if (record) {
            // Adding new with selected account from lookup
            setSelectedAccount(record);
            setAmount('0');
            setNotes('');
            setDeferred(false);
            setDeferredAccount(null);
            setDeferredDuration('0');
            setDeferredStartType('period');
            setDeferredStartMonth(6);
            setDeferredStartYear(2026);
        } else {
            // Fresh new
            setSelectedAccount(null);
            setAmount('0');
            setNotes('');
            setDeferred(false);
            setDeferredAccount(null);
            setDeferredDuration('0');
            setDeferredStartType('period');
            setDeferredStartMonth(6);
            setDeferredStartYear(2026);
        }
    }, [open, record, currentItem]);

    const handleSave = () => {
        if (!selectedAccount?.id) {
            showErrorToast({ message: isPayment ? 'Akun pembayaran harus dipilih.' : 'Akun penerimaan harus dipilih.' });
            setActiveTab('detail');
            return;
        }

        const parsedAmount = parseNumericInput(amount);
        if (parsedAmount <= 0) {
            showErrorToast({ message: isPayment ? 'Nilai pembayaran harus lebih besar dari 0.' : 'Nilai penerimaan harus lebih besar dari 0.' });
            setActiveTab('detail');
            return;
        }

        if (deferred) {
            if (!deferredAccount?.id) {
                showErrorToast({ message: isPayment ? 'Akun beban ditangguhkan harus dipilih.' : 'Akun pendapatan ditangguhkan harus dipilih.' });
                setActiveTab('deferred');
                return;
            }

            const parsedDuration = parseInt(deferredDuration, 10);
            if (isNaN(parsedDuration) || parsedDuration <= 0) {
                showErrorToast({ message: 'Durasi pengakuan harus lebih besar dari 0 bulan.' });
                setActiveTab('deferred');
                return;
            }
        }

        onSave({
            id: currentItem?.id ?? `draft-line-${Date.now()}`,
            __lineId: currentItem?.__lineId ?? null,
            __accountId: selectedAccount.id,
            accountCode: selectedAccount.code ?? '',
            accountName: selectedAccount.name ?? '',
            amount: formatCurrencyValue(parsedAmount),
            notes: notes.trim(),
            deferred,
            deferredAccountId: deferred ? deferredAccount.id : null,
            deferredAccountLabel: deferred ? deferredAccount.name : '',
            deferredDuration: deferred ? parseInt(deferredDuration, 10) : 0,
            deferredStartType: deferred ? deferredStartType : 'period',
            deferredStartMonth: deferred ? deferredStartMonth : 6,
            deferredStartYear: deferred ? deferredStartYear : 2026,
        });
    };

    const tabs = [
        { id: 'detail', label: isPayment ? 'Rincian Pembayaran' : 'Rincian Penerimaan' },
        { id: 'notes', label: 'Info lainnya' },
        { id: 'deferred', label: 'Penangguhan' },
    ];

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title={isPayment ? 'Rincian Pembayaran' : 'Rincian Penerimaan'}
            headerIcon={PencilIcon}
            maxWidthClassName="max-w-[500px]"
            contentClassName="bg-white px-5 py-0 sm:px-6 min-h-[220px] flex flex-col pt-0 pb-4"
            footer={
                <div className="flex justify-between items-center w-full">
                    {currentItem ? (
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={() => {
                                onSave({ action: 'delete' });
                            }}
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
                        onClick={handleSave}
                        className="bg-brand-blue-dark hover:bg-brand-blue-darker font-medium shadow-btn-blue-hover"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            {/* Tabs */}
            <div className="flex border-b border-table-row-border -mx-5 px-5 sm:-mx-6 sm:px-6 mb-4 mt-0">
                {tabs.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                                active
                                    ? 'border-pink-accent text-pink-accent'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[220px] flex flex-col">
                {activeTab === 'detail' && (
                    <div className="space-y-4 flex-1 pb-4">
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                            <span className="text-sm text-slate-700 font-normal">Akun</span>
                            <span className="text-sm font-medium text-slate-700 select-all">
                                {selectedAccount?.code || '-'}
                            </span>
                        </div>

                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                            <span className="text-sm text-slate-700 font-normal">
                                {isPayment ? 'Untuk Pembayaran' : 'Untuk Penerimaan'}
                            </span>
                            <div className="w-full">
                                <AccountLookupField
                                    value={selectedAccount ? buildAccountLookupLabel(selectedAccount) : ''}
                                    placeholder="Cari/Pilih Akun Perkiraan..."
                                    searchLabel="Cari akun perkiraan"
                                    onSelectAccount={(rec) => setSelectedAccount(rec)}
                                    onRemove={() => setSelectedAccount(null)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-4">
                            <span className="text-sm text-slate-700 font-normal pt-2">
                                Nilai <span className="text-red-500">*</span>
                            </span>
                            <div className="w-full max-w-[240px]">
                                <TextInput
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    prefix="Rp"
                                    placeholder="0"
                                    className="h-[36px] rounded-[4px] border-ui-border"
                                    prefixClassName="min-w-0 px-3 justify-center text-slate-500 font-normal border-r-ui-border-medium bg-ui-bg-hover text-sm"
                                    inputClassName="text-slate-700 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="space-y-4 flex-1 pb-4">
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-4">
                            <span className="text-sm text-slate-700 font-normal pt-1">Catatan</span>
                            <div className="flex-1">
                                <TextareaField
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    className="border-ui-border rounded-[4px]"
                                    textareaClassName="min-h-[80px] text-sm font-normal text-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'deferred' && (
                    <div className="flex flex-col gap-4 flex-1 pb-4">
                        {/* Switch */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={deferred}
                                onClick={() => setDeferred(!deferred)}
                                className={`relative inline-flex h-[22px] w-[34px] items-center rounded-full transition-colors duration-200 cursor-pointer ${
                                    deferred ? 'bg-blue-600' : 'bg-slate-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow transition-transform duration-200 ${
                                        deferred ? 'translate-x-[15px]' : 'translate-x-[3px]'
                                    }`}
                                />
                            </button>
                            <span className="text-sm text-slate-700 font-normal">
                                {isPayment
                                    ? 'Tangguhkan Biaya/beban dan akui per akhir Bulan'
                                    : 'Tangguhkan Pendapatan dan akui per akhir Bulan'}
                            </span>
                        </div>

                        {/* Deferred Form Fields */}
                        {deferred && (
                            <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-y-4 border-t border-ui-border-lightest pt-4 mt-2">
                                <span className="text-sm text-slate-700 font-normal">
                                    {isPayment ? 'Akun Beban Ditangguhkan' : 'Akun Pendapatan Ditangguhkan'}{' '}
                                    <span className="text-red-500">*</span>
                                </span>
                                <div className="w-full">
                                    <AccountLookupField
                                        value={deferredAccount ? buildAccountLookupLabel(deferredAccount) : ''}
                                        placeholder="Cari/Pilih Akun Perkiraan..."
                                        searchLabel={isPayment ? 'Cari akun beban ditangguhkan' : 'Cari akun pendapatan ditangguhkan'}
                                        onSelectAccount={(rec) => setDeferredAccount(rec)}
                                        onRemove={() => setDeferredAccount(null)}
                                    />
                                </div>

                                <span className="text-sm text-slate-700 font-normal">
                                    Pengakuan/bln selama
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="max-w-[80px]">
                                        <TextInput
                                            type="number"
                                            value={deferredDuration}
                                            onChange={(e) => setDeferredDuration(e.target.value)}
                                            className="h-[36px] rounded-[4px] border-ui-border text-center"
                                            inputClassName="text-sm font-normal text-slate-700 text-center"
                                        />
                                    </div>
                                    <span className="text-sm text-slate-700">Bulan</span>
                                </div>

                                <span className="text-sm text-slate-700 font-normal">Mulai Pengakuan</span>
                                <div className="flex flex-col gap-3">
                                    {/* Option 1: Month/Year Dropdowns */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            id="start_type_period"
                                            name="deferredStartType"
                                            checked={deferredStartType === 'period'}
                                            onChange={() => setDeferredStartType('period')}
                                            className="h-4 w-4 text-blue-600 cursor-pointer"
                                        />
                                        <div className="flex items-center gap-2">
                                            <SelectField
                                                value={deferredStartMonth}
                                                onChange={(e) => setDeferredStartMonth(parseInt(e.target.value, 10))}
                                                disabled={deferredStartType !== 'period'}
                                                className="h-[36px] w-[120px] rounded-[4px] border-ui-border"
                                                selectClassName="py-1 px-2 text-sm font-normal text-slate-700"
                                            >
                                                {MONTHS.map((m) => (
                                                    <option key={m.value} value={m.value}>
                                                        {m.label}
                                                    </option>
                                                ))}
                                            </SelectField>

                                            <SelectField
                                                value={deferredStartYear}
                                                onChange={(e) => setDeferredStartYear(parseInt(e.target.value, 10))}
                                                disabled={deferredStartType !== 'period'}
                                                className="h-[36px] w-[90px] rounded-[4px] border-ui-border"
                                                selectClassName="py-1 px-2 text-sm font-normal text-slate-700"
                                            >
                                                {YEARS.map((y) => (
                                                    <option key={y} value={y}>
                                                        {y}
                                                    </option>
                                                ))}
                                            </SelectField>
                                        </div>
                                    </div>

                                    {/* Option 2: Manual */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            id="start_type_manual"
                                            name="deferredStartType"
                                            checked={deferredStartType === 'manual'}
                                            onChange={() => setDeferredStartType('manual')}
                                            className="h-4 w-4 text-blue-600 cursor-pointer"
                                        />
                                        <label htmlFor="start_type_manual" className="text-sm text-slate-700 cursor-pointer select-none">
                                            Belum Ditentukan/jurnal manual
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </WorkspaceDialog>
    );
}
