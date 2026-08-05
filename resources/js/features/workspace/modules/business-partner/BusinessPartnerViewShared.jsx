import { useState } from 'react';
import ModalBase from '@/components/ui/ModalBase';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import TableListView from '@/features/workspace/modules/TableListView';
import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    CloseIcon,
    CogIcon,
    DownloadIcon,
    ExternalLinkIcon,
    PaperclipIcon,
    PlusIcon,
    PrintIcon,
    SaveIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';

export function buildFormState(source = {}) {
    return Object.fromEntries(
        Object.entries(source).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value]),
    );
}

export function FieldLabel({ label, required = false, className = '' }) {
    return (
        <label className={`text-xs sm:text-sm text-brand-dark ${className}`.trim()}>
            {label}
            {required ? <span className="text-tab-active-border-t"> *</span> : null}
        </label>
    );
}

export function FormFieldRow({ label, required = false, className = '', children }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[135px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
            <FieldLabel label={label} required={required} className="pt-2 lg:pt-1.5" />
            <div>{children}</div>
        </div>
    );
}

export function DockIcon({ icon }) {
    if (icon === 'attachment') {
        return <PaperclipIcon className="h-8 w-8" />;
    }

    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

export function ToolbarIconAction({ icon, label }) {
    const renderedIcon =
        icon === 'download'
            ? <DownloadIcon className="h-4 w-4" />
            : icon === 'external-link'
              ? <ExternalLinkIcon className="h-4 w-4" />
              : icon === 'print'
                ? <PrintIcon className="h-4 w-4" />
                : <CogIcon className="h-4 w-4" />;

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue"
        >
            {renderedIcon}
        </button>
    );
}

export function SectionHeading({ title }) {
    return <h3 className="border-b border-ui-border-medium pb-1.5 text-base sm:text-lg font-normal text-input-brand">{title}</h3>;
}

import AddressStack from '@/features/workspace/shared/components/AddressStack';
export { AddressStack };

export function EmptyDataTable({ columns, emptyLabel }) {
    return (
        <DataTable wrapperClassName="border-table-wrapper-border">
            <DataTableHeader className="bg-table-header-bg">
                <tr>
                    {columns.map((column) => (
                        <DataTableHead
                            key={column.id}
                            className={`${column.widthClassName ?? ''} px-3 text-base font-normal text-white text-center`.trim()}
                        >
                            {column.label}
                        </DataTableHead>
                    ))}
                </tr>
            </DataTableHeader>

            <DataTableBody>
                <DataTableRow className="bg-white">
                    <DataTableCell colSpan={columns.length} className="px-3 py-4 text-center text-base text-text-workspace-dark">
                        {emptyLabel && String(emptyLabel).toLowerCase().includes('hak akses') ? (
                            'Anda tidak memiliki hak akses ke halaman ini. Hubungi Owner untuk menambahkan akses.'
                        ) : (
                            emptyLabel
                        )}
                    </DataTableCell>
                </DataTableRow>
            </DataTableBody>
        </DataTable>
    );
}

export function BusinessPartnerTableView({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{ label: config.table.createLabel, onClick: onCreate }}
            menuButton={false}
            onRowClick={(row) =>
                onOpenDetail?.({
                    recordId: row.id,
                    label: row.name,
                    tabLabel: row.name.length > 16 ? `${row.name.slice(0, 13)}...` : row.name,
                })
            }
        />
    );
}

import ConfirmationModal from '@/components/ui/ConfirmationModal';

export function formatErrorMessageList(items) {
    const list = (Array.isArray(items) ? items : [items]).filter(Boolean);
    if (list.length === 0) return '';
    if (list.length === 1) {
        const text = String(list[0]).trim();
        const formatted = text.endsWith('.') ? text : `${text}.`;
        return `Silakan perbaiki permasalahan berikut ini:\n${formatted}`;
    }
    return `Silakan perbaiki permasalahan berikut ini:\n${list.map((item) => `• ${item}`).join('\n')}`;
}

export function PartnerInlineTableSection({
    title,
    addButtonTitle = 'Tambah Data',
    modalTitle = 'Tambah Data Baru',
    columns = [],
    items = [],
    emptyLabel = 'Tidak ada data',
    fields = [],
    onValidateBeforeOpen,
    onAdd,
    onRemove,
}) {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });

    const handleOpen = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        if (onValidateBeforeOpen) {
            const res = onValidateBeforeOpen();
            if (typeof res === 'string') {
                setErrorModal({ open: true, title: 'Terjadi Permasalahan pada Pemrosesan', message: formatErrorMessageList(res) });
                return;
            }
            if (res === false) {
                setErrorModal({ open: true, title: 'Terjadi Permasalahan pada Pemrosesan', message: formatErrorMessageList('Nama Pemasok harus diisi') });
                return;
            }
        }
        setForm({});
        setErrors({});
        setShowModal(true);
    };

    const handleSave = () => {
        const newErrors = {};
        const missingLabels = [];
        fields.forEach((f) => {
            if (f.required && !String(form[f.id] ?? '').trim()) {
                newErrors[f.id] = `${f.label} harus diisi.`;
                missingLabels.push(`${f.label} harus diisi`);
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setErrorModal({
                open: true,
                title: 'Terjadi Permasalahan pada Pemrosesan',
                message: formatErrorMessageList(missingLabels),
            });
            return;
        }

        onAdd?.({ ...form, id: Date.now() });
        setShowModal(false);
    };

    return (
        <div>
            <div className="mb-3 border-b border-ui-border-medium pb-1.5 flex items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-normal text-input-brand">{title}</h3>
                <button
                    type="button"
                    onClick={handleOpen}
                    className="inline-flex h-[34px] w-[56px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer relative z-10"
                    title={addButtonTitle}
                >
                    <PlusIcon className="h-5 w-5 pointer-events-none" />
                </button>
            </div>

            {!items || items.length === 0 ? (
                <EmptyDataTable columns={columns} emptyLabel={emptyLabel} />
            ) : (
                <DataTable wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            <DataTableHead className="w-px px-2.5 text-center text-base font-light text-white whitespace-nowrap">No.</DataTableHead>
                            {columns.map((col) => (
                                <DataTableHead key={col.id} className={`px-3 text-base font-light text-white ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                                    {col.label}
                                </DataTableHead>
                            ))}
                            <DataTableHead className="w-[60px] px-3 text-center text-base font-light text-white">Aksi</DataTableHead>
                        </tr>
                    </DataTableHeader>
                    <DataTableBody>
                        {items.map((row, index) => (
                            <DataTableRow key={row.id || index} className="bg-white">
                                <DataTableCell className="w-[50px] px-3 text-center text-base text-black">{index + 1}</DataTableCell>
                                {columns.map((col) => (
                                    <DataTableCell key={col.id} className={`px-3 text-base text-black ${col.align === 'right' ? 'text-right font-normal' : 'text-left'}`}>
                                        {col.format ? col.format(row[col.id]) : (row[col.id] || '-')}
                                    </DataTableCell>
                                ))}
                                <DataTableCell className="px-3 text-center">
                                    <button
                                        type="button"
                                        onClick={() => onRemove?.(index)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Hapus"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            )}

            {showModal && (
                <ModalBase isOpen={showModal} onClose={() => setShowModal(false)} title={modalTitle} maxWidth="max-w-md">
                    <div className="space-y-3 py-2">
                        {fields.map((field) => (
                            <FormFieldRow key={field.id} label={field.label} required={field.required}>
                                <div>
                                    <TextInput
                                        id={field.id}
                                        name={field.id}
                                        type={field.type || 'text'}
                                        error={errors[field.id] || ''}
                                        value={form[field.id] || ''}
                                        onChange={(e) => {
                                            const val = field.sanitize ? field.sanitize(e.target.value) : e.target.value;
                                            setForm((prev) => ({ ...prev, [field.id]: val }));
                                            if (errors[field.id]) {
                                                setErrors((prev) => ({ ...prev, [field.id]: null }));
                                            }
                                        }}
                                        placeholder={field.placeholder || field.label}
                                        className="h-[38px] rounded-[4px] border-ui-border"
                                    />
                                </div>
                            </FormFieldRow>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="rounded-[4px] border px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="rounded-[4px] bg-brand-blue px-4 py-1.5 text-xs text-white hover:bg-blue-700"
                        >
                            Simpan
                        </button>
                    </div>
                </ModalBase>
            )}

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
        </div>
    );
}

export {
    ChipLookupField,
    CloseIcon,
    PlusIcon,
    SelectField,
    TextInput,
    TransactionSwitch,
};
