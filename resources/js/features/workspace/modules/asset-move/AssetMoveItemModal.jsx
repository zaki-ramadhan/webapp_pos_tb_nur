import { useEffect, useState } from 'react';

import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { CloseIcon, PencilIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

function buildInitialValues(item = {}) {
    return {
        description: item.description ?? '',
        quantity: item.quantity ?? '',
        notes: item.notes ?? '',
    };
}

function ModalTabButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`border-b-2 px-3 py-2 text-base ${
                active ? 'border-[#ff4836] text-[#ff4836]' : 'border-transparent text-[#5f6980]'
            }`.trim()}
        >
            {label}
        </button>
    );
}

function ModalFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[168px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className="pt-2 text-base" />
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
                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
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
                    inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
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
                textareaClassName="min-h-[120px] text-xs sm:text-sm text-[#1f2436]"
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

    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-[rgba(15,23,42,0.72)]"
            panelClassName="max-w-[620px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
        >
            <div className="bg-[#173968] px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <PencilIcon className="h-5 w-5 text-white" />
                        <h2 className="text-base font-medium">{modal.title}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-white transition hover:bg-white/10"
                        aria-label="Tutup detail aset"
                    >
                        <CloseIcon className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="bg-white px-4 pb-4 pt-3">
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

                <div className="min-h-[270px] py-4">
                    {activeTabId === 'notes' ? (
                        <NotesTab values={values} setValues={setValues} />
                    ) : (
                        <DetailsTab values={values} setValues={setValues} />
                    )}
                </div>

                <div className="flex items-center justify-between border-t border-[#d8dde7] pt-3">
                    <button
                        type="button"
                        className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-5 text-lg text-[#21539b]"
                    >
                        {modal.deleteLabel ?? 'Hapus'}
                    </button>
                    <button
                        type="button"
                        className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#1d52a5] bg-[#1d52a5] px-6 text-lg text-white"
                    >
                        {modal.submitLabel ?? 'Lanjut'}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
