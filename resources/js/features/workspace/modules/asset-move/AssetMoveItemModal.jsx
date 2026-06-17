import { useEffect, useState } from 'react';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { TableActionIcon } from '@/features/workspace/shared/Icons';

function buildInitialValues(item = {}) {
    return {
        description: item.description ?? '',
        quantity: item.quantity ?? '',
        notes: item.notes ?? '',
    };
}

function ModalFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[168px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className="pt-2 text-xs font-normal text-slate-700" />
            <div>{children}</div>
        </div>
    );
}

function DetailsTab({ values, setValues }) {
    return (
        <div className="space-y-3">
            <ModalFieldRow label="Deskripsi Aset">
                <TextInput
                    value={values.description}
                    readOnly
                    className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-xs text-[#1f2436]"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Kuantitas">
                <TextInput
                    value={values.quantity}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            quantity: event.target.value.replace(/[^\d.,]/g, ''),
                        }))
                    }
                    trailing={<TableActionIcon className="h-4 w-4 text-[#111827]" />}
                    className="h-[36px] max-w-[160px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-right text-xs text-[#1f2436]"
                    trailingClassName="px-3"
                />
            </ModalFieldRow>
        </div>
    );
}

function NotesTab({ values, setValues }) {
    return (
        <div className="space-y-3">
            <TextareaField
                value={values.notes}
                onChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        notes: event.target.value,
                    }))
                }
                rows={5}
                className="rounded-[4px] border-[#cfd6e2]"
                textareaClassName="min-h-[120px] text-xs text-[#1f2436]"
            />
        </div>
    );
}

export default function AssetMoveItemModal({ open, onClose, modal, item }) {
    const tabs = modal?.tabs ?? [];
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildInitialValues(item));

    useEffect(() => {
        setActiveTabId(tabs[0]?.id ?? 'details');
        setValues(buildInitialValues(item));
    }, [item, tabs]);

    if (!modal || !item) {
        return null;
    }

    const activeTabIdSafe = tabs.some((tab) => tab.id === activeTabId) ? activeTabId : tabs[0]?.id ?? 'details';

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title={modal.title}
            tabs={tabs}
            activeTabId={activeTabIdSafe}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup detail aset"
            panelClassName="max-w-[620px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
            bodyClassName="min-h-[270px] py-4"
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
                <DetailsTab values={values} setValues={setValues} />
            )}
        </DocumentModalLayout>
    );
}
