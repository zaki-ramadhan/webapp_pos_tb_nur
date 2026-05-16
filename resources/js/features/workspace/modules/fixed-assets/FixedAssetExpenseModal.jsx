import { useEffect, useState } from 'react';

import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { CloseIcon, PencilIcon } from '@/features/workspace/shared/Icons';

function ModalTabButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`border-b-2 px-3 py-2 text-[16px] ${
                active ? 'border-[#ff4836] text-[#ff4836]' : 'border-transparent text-[#5f6980]'
            }`.trim()}
        >
            {label}
        </button>
    );
}

function ModalFieldRow({ label, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[154px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
            <TransactionFieldLabel label={label} className="pt-2 text-[16px]" />
            <div>{children}</div>
        </div>
    );
}

function buildInitialValues(item = {}) {
    return {
        accountName: item.description ?? '',
        date: item.date ?? '',
        description: item.description ?? '',
        amount: item.amount ?? '',
        notes: item.notes ?? '',
    };
}

function ExpenseTab({ values, setValues }) {
    return (
        <div className="space-y-4">
            <ModalFieldRow label="Akun Pengeluaran">
                <div className="pt-2 text-[17px] text-[#1f2436]">{values.accountName}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Tanggal">
                <div className="pt-2 text-[17px] text-[#1f2436]">{values.date}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Deskripsi">
                <TextInput
                    value={values.description}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            description: event.target.value,
                        }))
                    }
                    trailing={<span className="text-[22px] font-semibold text-[#1f2436]">×</span>}
                    className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName="px-3"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Jumlah">
                <div className="pt-2 text-right text-[17px] text-[#1f2436]">{values.amount}</div>
            </ModalFieldRow>
        </div>
    );
}

function NotesTab({ values, setValues }) {
    return (
        <ModalFieldRow label="Catatan">
            <TextareaField
                value={values.notes}
                onChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        notes: event.target.value,
                    }))
                }
                rows={4}
                className="rounded-[4px] border-[#cfd6e2]"
                textareaClassName="min-h-[92px] text-[15px] text-[#1f2436]"
            />
        </ModalFieldRow>
    );
}

export default function FixedAssetExpenseModal({ open, onClose, modal, item }) {
    const tabs = modal?.tabs ?? [];
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'expense');
    const [values, setValues] = useState(() => buildInitialValues(item));

    useEffect(() => {
        setActiveTabId(tabs[0]?.id ?? 'expense');
        setValues(buildInitialValues(item));
    }, [item, tabs]);

    if (!open || !modal || !item) {
        return null;
    }

    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-[rgba(15,23,42,0.72)]"
            panelClassName="max-w-[540px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
        >
            <div className="bg-[#173968] px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <PencilIcon className="h-5 w-5 text-white" />
                        <h2 className="text-[16px] font-medium">{modal.title}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-white transition hover:bg-white/10"
                        aria-label="Tutup pengeluaran aset"
                    >
                        <CloseIcon className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="bg-white px-4 pb-4 pt-3 sm:px-5">
                <div className="flex items-end gap-1 border-b border-[#d8dde7]">
                    {tabs.map((tab) => (
                        <ModalTabButton
                            key={tab.id}
                            active={tab.id === activeTabId}
                            label={tab.label}
                            onClick={() => setActiveTabId(tab.id)}
                        />
                    ))}
                </div>

                <div className="py-4">
                    {activeTabId === 'notes' ? (
                        <NotesTab values={values} setValues={setValues} />
                    ) : (
                        <ExpenseTab values={values} setValues={setValues} />
                    )}
                </div>

                <div className="flex items-center justify-between border-t border-[#d8dde7] pt-3">
                    <button
                        type="button"
                        className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-5 text-[18px] text-[#21539b]"
                        onClick={onClose}
                    >
                        {modal.deleteLabel ?? 'Hapus'}
                    </button>
                    <button
                        type="button"
                        className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#1d52a5] bg-[#1d52a5] px-6 text-[18px] text-white"
                        onClick={onClose}
                    >
                        {modal.submitLabel ?? 'Lanjut'}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
