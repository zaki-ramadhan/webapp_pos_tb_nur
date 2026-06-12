import { useEffect, useState } from 'react';

import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { CloseIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

function buildModalValues(modal, row) {
    return (modal?.fields ?? []).reduce((result, field) => {
        result[field.id] = row?.[field.id] ?? field.value ?? '';
        return result;
    }, {});
}

function ModalTabButton({ label }) {
    return (
        <div className="border-b-2 border-[#ff4836] px-3 py-2 text-base text-[#ff4836]">
            {label}
        </div>
    );
}

function ModalFooter({ modal }) {
    return (
        <div className="flex items-center justify-between border-t border-[#d8dde7] pt-3">
            <button
                type="button"
                className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-5 text-lg text-[#21539b]"
            >
                {modal?.deleteLabel ?? 'Hapus'}
            </button>
            <button
                type="button"
                className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#1d52a5] bg-[#1d52a5] px-6 text-lg text-white"
            >
                {modal?.submitLabel ?? 'Lanjut'}
            </button>
        </div>
    );
}

function ModalField({ field, value }) {
    if (field.type === 'currency') {
        return (
            <TextInput
                value={value}
                readOnly
                prefix={field.prefix ?? 'Rp'}
                trailing={<TableActionIcon className="h-4 w-4 text-[#111827]" />}
                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                prefixClassName="min-w-[48px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
                inputClassName="text-right text-xs sm:text-sm font-semibold text-[#111827]"
                trailingClassName="px-3"
            />
        );
    }

    return (
        <TextInput
            value={value}
            readOnly
            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
            inputClassName="text-xs sm:text-sm text-[#1f2436]"
        />
    );
}

export default function TargetDetailEntryModal({ open, modal, row, onClose }) {
    const [values, setValues] = useState(() => buildModalValues(modal, row));

    useEffect(() => {
        setValues(buildModalValues(modal, row));
    }, [modal, row]);

    return (
        <ModalBase open={open} onBackdropClick={onClose} panelClassName={modal?.panelClassName ?? 'max-w-[540px]'}>
            <div className="overflow-hidden rounded-[12px]">
                <div className="flex items-center justify-between bg-[#12356d] px-4 py-3 text-white">
                    <div className="flex items-center gap-3 text-lg">
                        <span className="text-lg">{modal?.title ?? 'Rincian'}</span>
                    </div>

                    <button type="button" onClick={onClose} aria-label="Tutup modal rincian">
                        <CloseIcon className="h-5 w-5 text-white" strokeWidth={2.4} />
                    </button>
                </div>

                <div className="bg-white px-4 py-4">
                    <div className="border-b border-[#d8dde7]">
                        <ModalTabButton label={modal?.tabLabel ?? 'Rincian'} />
                    </div>

                    <div className="grid gap-y-4 pt-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-4">
                        {(modal?.fields ?? []).map((field) => (
                            <div key={field.id} className="contents">
                                <TransactionFieldLabel label={field.label} required={field.required} />
                                <ModalField field={field} value={values[field.id] ?? ''} />
                            </div>
                        ))}
                    </div>

                    <div className="pt-5">
                        <ModalFooter modal={modal} />
                    </div>
                </div>
            </div>
        </ModalBase>
    );
}
