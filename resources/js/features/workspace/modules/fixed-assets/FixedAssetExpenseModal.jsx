import { useEffect, useState } from 'react';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

function buildInitialValues(item = {}) {
    return {
        accountName: item.description ?? '',
        date: item.date ?? '',
        description: item.description ?? '',
        amount: item.amount ?? '',
        notes: item.notes ?? '',
    };
}

function ModalFieldRow({ label, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[154px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
            <TransactionFieldLabel label={label} className="pt-2 text-xs font-normal text-slate-700" />
            <div>{children}</div>
        </div>
    );
}

function ExpenseTab({ values, setValues }) {
    return (
        <div className="space-y-3">
            <ModalFieldRow label="Akun Pengeluaran">
                <div className="pt-2 text-xs text-[#1f2436] font-medium">{values.accountName}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Tanggal">
                <div className="pt-2 text-xs text-[#1f2436] font-medium">{values.date}</div>
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
                    trailing={<span className="text-xl font-semibold text-[#1f2436]">×</span>}
                    className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-xs text-[#1f2436]"
                    trailingClassName="px-3"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Jumlah">
                <div className="pt-2 text-right text-xs text-[#1f2436] font-medium">{values.amount}</div>
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
                textareaClassName="min-h-[92px] text-xs text-[#1f2436]"
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

    const activeTabIdSafe = tabs.some((tab) => tab.id === activeTabId) ? activeTabId : tabs[0]?.id ?? 'expense';

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title={modal.title}
            tabs={tabs}
            activeTabId={activeTabIdSafe}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup pengeluaran aset"
            panelClassName="max-w-[540px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
            bodyClassName="min-h-[220px] py-4"
            footer={
                <DocumentModalFooter
                    deleteLabel={modal.deleteLabel}
                    submitLabel={modal.submitLabel}
                    onDelete={onClose}
                    onSubmit={onClose}
                />
            }
        >
            {activeTabIdSafe === 'notes' ? (
                <NotesTab values={values} setValues={setValues} />
            ) : (
                <ExpenseTab values={values} setValues={setValues} />
            )}
        </DocumentModalLayout>
    );
}
