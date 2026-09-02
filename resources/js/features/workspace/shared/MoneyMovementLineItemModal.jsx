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
    type = 'payment',
}) {
    const isPayment = type === 'payment';
    const [activeTab, setActiveTab] = useState('detail');

    const [selectedAccount, setSelectedAccount] = useState(null);
    const [amount, setAmount] = useState('0');

    const [notes, setNotes] = useState('');

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
        } else if (record) {
          // Adding new with selected account from lookup

            setSelectedAccount(record);
            setAmount('0');
            setNotes('');
        } else {
          // Fresh new

            setSelectedAccount(null);
            setAmount('0');
            setNotes('');
        }
    }, [open, record, currentItem]);

    const handleSave = () => {
        if (!selectedAccount?.id) {
            onClose();
            return;
        }

        const parsedAmount = parseNumericInput(amount);
        if (parsedAmount <= 0) {
            onClose();
            return;
        }

        onSave({
            id: currentItem?.id ?? `draft-line-${Date.now()}`,
            __lineId: currentItem?.__lineId ?? null,
            __accountId: selectedAccount.id,
            accountCode: selectedAccount.code ?? '',
            accountName: selectedAccount.name ?? '',
            amount: formatCurrencyValue(parsedAmount),
            notes: notes.trim(),
        });
    };

    const tabs = [
        { id: 'detail', label: isPayment ? 'Rincian Pembayaran' : 'Rincian Penerimaan' },
        { id: 'notes', label: 'Catatan' },
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
                            className="border-brand-blue text-brand-blue hover:bg-brand-blue/5 shadow-none"
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
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            {/* Tabs */}
            <div className="flex border-b border-table-row-border -mx-5 px-5 sm:-mx-6 sm:px-6 mt-2.5 mb-3">
                {tabs.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 text-sm font-normal border-b-2 -mb-[1px] transition-colors duration-150 cursor-pointer ${
                                active
                                    ? 'border-pink-accent text-pink-accent font-normal'
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
                                {isPayment ? 'Untuk Pembayaran' : 'Atas Penerimaan'}
                            </span>
                            <div className="w-full">
                                <AccountLookupField
                                    value={selectedAccount ? buildAccountLookupLabel(selectedAccount) : ''}
                                    placeholder="Cari/Pilih Akun Perkiraan..."
                                    searchLabel="Cari akun perkiraan"
                                    showType={true}
                                    queryParams={{ exclude_type: ['Cash/Bank', 'Receivable', 'Payable', 'Inventory', 'Accumulated Depreciation'] }}
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
            </div>
        </WorkspaceDialog>
    );
}
