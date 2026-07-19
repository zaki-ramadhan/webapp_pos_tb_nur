import { useEffect, useState, useCallback } from 'react';
import { showErrorToast } from '@/components/feedback/toast';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionDateInput,
    TransactionFieldLabel,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import { CalcIcon } from '@/features/workspace/shared/Icons';
import { parseAmountInput, formatAmountInput } from '@/features/workspace/shared/amountFormatting';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

function cloneLookupValues(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function buildInitialValues(item, product, fallbackDate) {
    if (item) {
        return {
            id: item.id ?? null,
            __lineId: item.__lineId ?? null,
            __productId: item.__productId ?? item.product_id ?? null,
            __unitId: item.__unitId ?? item.unit_id ?? null,
            __departmentId: item.__departmentId ?? item.department_id ?? null,
            code: item.code ?? '',
            requestDate: item.requestDate ?? fallbackDate ?? '',
            name: item.name ?? '',
            quantity: formatAmountInput(item.quantity ?? '1', { allowDecimal: false, allowNegative: false }),
            unit: item.unit ?? 'PCS',
            department: cloneLookupValues(item.department),
            notes: item.notes ?? '',
        };
    }
    if (product) {
        return {
            id: null,
            __lineId: null,
            __productId: product.id ?? null,
            __unitId: product.base_unit_id ?? null,
            __departmentId: null,
            code: product.code ?? '',
            requestDate: fallbackDate ?? '',
            name: product.name ?? '',
            quantity: '1',
            unit: product.base_unit?.name ?? 'PCS',
            department: [],
            notes: '',
        };
    }
    return {
        id: null,
        __lineId: null,
        __productId: null,
        __unitId: null,
        __departmentId: null,
        code: '',
        requestDate: fallbackDate ?? '',
        name: '',
        quantity: '1',
        unit: 'PCS',
        department: [],
        notes: '',
    };
}

function ModalFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-start sm:gap-x-3">
            <TransactionFieldLabel label={label} required={required} className="pt-2 text-xs font-normal text-slate-700" />
            <div>{children}</div>
        </div>
    );
}

function ItemDetailsTab({ values, setValues, errors = {} }) {
    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="space-y-2">
            <ModalFieldRow label="Kode #">
                <div className="flex h-[40px] items-center text-xs sm:text-sm font-medium text-brand-blue">
                    {values.code || '-'}
                </div>
            </ModalFieldRow>

            <ModalFieldRow label="Tgl Diminta" required>
                <div className="max-w-[170px] w-full">
                    <TransactionDateInput
                        value={values.requestDate}
                        onChange={(nextValue) =>
                            setValues((current) => ({
                                ...current,
                                requestDate: nextValue,
                            }))
                        }
                    />
                </div>
            </ModalFieldRow>

            <ModalFieldRow label="Nama Barang" required>
                <AccountLookupField
                    resource="products"
                    values={values.name ? (values.code ? [`[${values.code}] ${values.name}`] : [values.name]) : []}
                    placeholder="Pilih Barang..."
                    searchLabel="Cari barang"
                    onSelectAccount={(record, label) => {
                        if (record) {
                            setValues((current) => ({
                                ...current,
                                __productId: record.id,
                                name: record.name ?? '',
                                code: record.code ?? '',
                                unit: record.base_unit?.name ?? 'PCS',
                                __unitId: record.base_unit_id ?? null,
                            }));
                        }
                    }}
                    onRemove={() => {
                        setValues((current) => ({
                            ...current,
                            __productId: null,
                            name: '',
                            code: '',
                        }));
                    }}
                    error={errors.name}
                    heightClassName="h-[40px]"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Kuantitas" required>
                <div className="grid gap-3 sm:grid-cols-2">
                    <TextInput
                        name="quantity"
                        value={values.quantity}
                        allowDecimal={false}
                        allowNegative={false}
                        onChange={(event) => {
                            setValues((current) => ({
                                ...current,
                                quantity: event.target.value,
                            }));
                        }}
                        trailing={<CalcIcon className="h-4 w-4 text-text-darkest" />}
                        error={errors.quantity}
                        className="h-[40px] rounded-[4px] border-ui-border"
                        inputClassName="text-right text-xs text-brand-dark"
                        trailingClassName="px-3"
                    />
                    <AccountLookupField
                        resource="units"
                        values={values.unit ? [values.unit] : []}
                        placeholder="Satuan..."
                        searchLabel="Cari satuan"
                        onSelectAccount={(record, label) => {
                            setValues((current) => ({
                                ...current,
                                unit: label,
                                __unitId: record?.id ?? null,
                            }));
                        }}
                        onRemove={() => {
                            setValues((current) => ({
                                ...current,
                                unit: '',
                                __unitId: null,
                            }));
                        }}
                        heightClassName="h-[40px]"
                    />
                </div>
            </ModalFieldRow>

            {!hideDepartment ? (
                <ModalFieldRow label="Departemen">
                    <AccountLookupField
                        resource="departments"
                        values={values.department}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari departemen"
                        onSelectAccount={(record, label) => {
                            setValues((current) => ({
                                ...current,
                                department: [label],
                                __departmentId: record?.id ?? null,
                            }));
                        }}
                        onRemove={() => {
                            setValues((current) => ({
                                ...current,
                                department: [],
                                __departmentId: null,
                            }));
                        }}
                        heightClassName="h-[40px]"
                    />
                </ModalFieldRow>
            ) : null}
        </div>
    );
}

function ItemNotesTab({ values, setValues }) {
    return (
        <div className="space-y-2">
            <ModalFieldRow label="Keterangan">
                <TextareaField
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={4}
                    className="rounded-[4px] border-ui-border"
                    textareaClassName="min-h-[92px] text-xs text-brand-dark"
                />
            </ModalFieldRow>
        </div>
    );
}

export default function ItemRequestItemModal({ open, onClose, onConfirm, onDelete, product, item, fallbackDate }) {
    const tabs = [
        { id: 'details', label: 'Rincian Barang' },
        { id: 'info', label: 'Info lainnya' },
    ];
    const [activeTabId, setActiveTabId] = useState('details');
    const [values, setValues] = useState(() => buildInitialValues(item, product, fallbackDate));
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setActiveTabId('details');
            setValues(buildInitialValues(item, product, fallbackDate));
            setErrors({});
        }
    }, [open, item, product, fallbackDate]);

    const handleValuesChange = useCallback((updater) => {
        setValues(updater);
        setErrors({});
    }, []);

    const activeTabIdSafe = tabs.some((tab) => tab.id === activeTabId) ? activeTabId : 'details';

    function handleSubmit() {
        const newErrors = {};
        if (!String(values.name ?? '').trim()) {
            newErrors.name = 'Nama barang harus diisi.';
        }
        const qty = parseAmountInput(values.quantity);
        if (!qty || qty <= 0) {
            newErrors.quantity = 'Kuantitas harus lebih besar dari 0.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setActiveTabId('details');
            showErrorToast({ message: Object.values(newErrors)[0] });
            return;
        }

        onConfirm?.({
            id: values.id ?? `draft-item-${Date.now()}`,
            __lineId: values.__lineId ?? null,
            __productId: values.__productId ?? null,
            __unitId: values.__unitId ?? null,
            __departmentId: values.__departmentId ?? null,
            name: values.name,
            code: values.code,
            quantity: String(qty),
            unit: values.unit,
            requestDate: values.requestDate,
            department: values.department,
            notes: values.notes,
        });
        onClose();
    }

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title="Rincian Barang"
            tabs={tabs}
            activeTabId={activeTabIdSafe}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup rincian barang"
            panelClassName="max-w-[540px] w-full overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
            bodyClassName="pt-1.5 pb-28"
            footer={
                <DocumentModalFooter
                    deleteLabel="Hapus"
                    submitLabel="Lanjut"
                    onDelete={item ? onDelete : null}
                    onSubmit={handleSubmit}
                />
            }
        >
            {activeTabIdSafe === 'info' ? (
                <ItemNotesTab values={values} setValues={handleValuesChange} />
            ) : (
                <ItemDetailsTab values={values} setValues={handleValuesChange} errors={errors} />
            )}
        </DocumentModalLayout>
    );
}
