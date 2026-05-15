import { useEffect, useMemo, useRef, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { AccountLookupField, buildAccountLookupLabel } from '@/features/workspace/shared/AccountLookupControls';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import SectionTab from '@/features/workspace/shared/SectionTab';
import {
    ChevronDownIcon,
    CloseIcon,
    CogIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SaveIcon,
    SearchIcon,
    SortIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

function TaxToolbarIconButton({ label, onClick, className = '', children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={className}
        >
            {children}
        </button>
    );
}

function TaxTableActionMenu({ table }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    if (!table.menuItems?.length) {
        return null;
    }

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="inline-flex h-[34px] w-[52px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-2 text-[#2353a0]"
                aria-label={table.actionsLabel}
            >
                <CogIcon className="h-4 w-4" />
                <ChevronDownIcon className="h-4 w-4" />
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName="w-[190px]"
            >
                <div className="flex flex-col">
                    {table.menuItems.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => setOpen(false)}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}

function TaxTableToolbar({
    table,
    keyword,
    typeFilter,
    onKeywordChange,
    onTypeFilterChange,
    onCreate,
    onRefresh,
    loading = false,
}) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <SelectField
                    value={typeFilter}
                    onChange={(event) => onTypeFilterChange(event.target.value)}
                    containerClassName="w-auto"
                    className="h-[34px] min-w-[132px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-[15px] text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {table.filterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <TaxToolbarIconButton
                        label={table.createLabel}
                        onClick={onCreate}
                        className="inline-flex h-[34px] w-[60px] shrink-0 items-center justify-center rounded-[4px] bg-[#2353a0] text-white shadow-[0_4px_10px_rgba(15,23,42,0.08)]"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </TaxToolbarIconButton>

                    <TaxToolbarIconButton
                        label={table.refreshLabel}
                        onClick={onRefresh}
                        className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                    >
                        <RefreshIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`.trim()} />
                    </TaxToolbarIconButton>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                    <TaxToolbarIconButton
                        label={table.printLabel}
                        className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                    >
                        <PrintIcon className="h-4 w-4" />
                    </TaxToolbarIconButton>

                    <TaxTableActionMenu table={table} />

                    <TextInput
                        value={keyword}
                        onChange={(event) => onKeywordChange(event.target.value)}
                        placeholder={table.searchPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                        className="h-[34px] w-full rounded-[4px] border-[#cfd6e2] sm:w-[340px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />

                    <TextInput
                        value={table.pageValue}
                        readOnly
                        className="h-[34px] w-[76px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-right text-[15px] text-[#646d83]"
                    />
                </div>
            </div>
        </div>
    );
}

const TAX_TYPE_LABELS = {
    vat: 'Pajak Pertambahan Nilai',
    pph23: 'Pajak Penghasilan Ps.23',
    pph21: 'Pajak Penghasilan Ps.21',
};

function mapTaxRow(record) {
    return {
        ...record,
        id: String(record.id),
        tabLabel: record.name ?? String(record.id),
        typeValue: record.tax_type ?? '',
        typeLabel: TAX_TYPE_LABELS[record.tax_type] ?? record.tax_type ?? '-',
        description: record.name ?? '',
        percentage: String(record.rate ?? ''),
        salesAccount: record.output_account ? buildAccountLookupLabel(record.output_account) : '',
        purchaseAccount: record.input_account ? buildAccountLookupLabel(record.input_account) : '',
    };
}

function TaxTableView({ page, rows, total, loading, error, onCreate, onOpenDetail, onRefresh }) {
    const table = page.table;
    const [keyword, setKeyword] = useState('');
    const [typeFilter, setTypeFilter] = useState(table.filterOptions?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return rows.filter((row) => {
            if (typeFilter !== 'all' && row.typeValue !== typeFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.description, row.typeLabel, row.percentage].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, rows, typeFilter]);

    function handleOpenRow(row) {
        onOpenDetail?.({
            recordId: row.id,
            label: row.description,
            tabLabel: row.tabLabel ?? row.description,
        });
    }

    return (
        <div className="min-h-full rounded-[4px] border border-[#d3d9e5] bg-white px-3 pb-3 pt-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TaxTableToolbar
                table={table}
                keyword={keyword}
                typeFilter={typeFilter}
                onKeywordChange={setKeyword}
                onTypeFilterChange={setTypeFilter}
                onCreate={onCreate}
                onRefresh={onRefresh}
                loading={loading}
            />

            <div className="mt-3">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            <DataTableHead className="w-[34px] px-2 py-2.5 text-center">
                                <SortIcon className="mx-auto h-3 w-3 text-white/55" />
                            </DataTableHead>
                            <DataTableHead className="px-3 py-2.5 text-[16px] font-medium text-white">
                                Keterangan
                            </DataTableHead>
                            <DataTableHead className="px-3 py-2.5 text-[16px] font-medium text-white">
                                Tipe Pajak
                            </DataTableHead>
                            <DataTableHead className="w-[120px] px-3 py-2.5 text-[16px] font-medium text-white">
                                Persentase
                            </DataTableHead>
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-[#e3e6ec] transition hover:bg-[#eef3fb] ${
                                        index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'
                                    }`.trim()}
                                    onClick={() => handleOpenRow(row)}
                                >
                                    <DataTableCell className="px-2 py-2.5" />
                                    <DataTableCell className="px-3 py-2.5 text-[15px] text-[#131a28]">
                                        {row.description}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 py-2.5 text-[15px] text-[#131a28]">
                                        {row.typeLabel}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 py-2.5 text-right text-[15px] text-[#131a28]">
                                        {row.percentage}
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={4} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    {error || 'Belum ada data'}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

function buildFormValues(defaults = {}) {
    return {
        type: defaults.type ?? '',
        description: defaults.description ?? '',
        percentage: defaults.percentage ?? '',
        salesAccount: defaults.salesAccount ?? '',
        salesAccountId: defaults.salesAccountId ?? null,
        purchaseAccount: defaults.purchaseAccount ?? '',
        purchaseAccountId: defaults.purchaseAccountId ?? null,
        __backendRecordId: defaults.__backendRecordId ?? null,
    };
}

function TaxFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[360px_minmax(0,600px)] lg:items-center">
            <label className="text-[17px] leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function TaxFormView({ page, activeLevel2Tab }) {
    const form = page.form;
    const activeRecord = useMemo(
        () =>
            form.records?.find((record) => record.id === activeLevel2Tab?.recordId) ??
            null,
        [activeLevel2Tab?.recordId, form.records],
    );
    const isDetailMode = activeLevel2Tab?.tabType === 'detail' && activeRecord;
    const initialValues = useMemo(
        () => buildFormValues(isDetailMode ? activeRecord : form.createDefaults),
        [activeRecord, form.createDefaults, isDetailMode],
    );
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    useEffect(() => {
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [initialValues]);

    function handleChange(field, nextValue) {
        setValues((current) => ({
            ...current,
            [field]: nextValue,
        }));
    }

    const validationMessage = useMemo(() => validateRequiredChecks([
        { label: form.labels.type, value: values.type },
        { label: form.labels.description, value: values.description },
        { label: form.labels.percentage, value: values.percentage, type: 'number', min: 0 },
        { label: form.labels.salesAccount, value: values.salesAccount, type: 'lookup' },
        { label: form.labels.purchaseAccount, value: values.purchaseAccount, type: 'lookup' },
    ]), [form.labels, values]);
    const isDirty = useMemo(
        () => !areComparableValuesEqual(values, initialValues),
        [initialValues, values],
    );
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    useWorkspaceDirtyRegistration({
        pageId: page.id,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetailMode ? 'Sedang memperbarui pajak.' : 'Sedang menyimpan pajak.',
            successMessage: isDetailMode ? 'Pajak berhasil diperbarui.' : 'Pajak berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    code: null,
                    name: values.description.trim(),
                    tax_type: values.type,
                    rate: Number(values.percentage),
                    output_account_id: values.salesAccountId,
                    input_account_id: values.purchaseAccountId,
                    is_active: true,
                };
                const response = isDetailMode && values.__backendRecordId
                    ? await updateBackendResource('taxes', values.__backendRecordId, payload)
                    : await createBackendResource('taxes', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await page.onRefresh?.();

                if (!isDetailMode && record?.id && page.onOpenDetail) {
                    const row = mapTaxRow(record);

                    page.onOpenDetail({
                        recordId: row.id,
                        label: row.description,
                        tabLabel: row.tabLabel,
                    });
                }
            },
        });
    }

    function requestDelete() {
        if (!values.__backendRecordId || saving) {
            return;
        }

        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus pajak.',
            successMessage: 'Pajak berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('taxes', values.__backendRecordId),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await page.onRefresh?.();
                page.onCloseDetail?.(values.__backendRecordId);
                page.onOpenContent?.();
            },
        });
    }

    return (
        <div className="relative flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab label={form.sectionLabel} tone="accent" className="h-[34px]" />
            </div>

            <div className="flex min-h-[642px] flex-col gap-5 rounded-[4px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] xl:flex-row xl:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    <CrudStatusMessage status={status} />

                    <div className="max-w-[980px] space-y-4">
                        <TaxFieldRow label={form.labels.type} required>
                            <SelectField
                                value={values.type}
                                onChange={(event) => handleChange('type', event.target.value)}
                                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#1f2436]"
                            >
                                {form.typeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectField>
                        </TaxFieldRow>

                        <TaxFieldRow label={form.labels.description} required>
                            <TextInput
                                value={values.description}
                                onChange={(event) => handleChange('description', event.target.value)}
                                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </TaxFieldRow>

                        <TaxFieldRow label={form.labels.percentage} required>
                            <div className="flex items-center gap-3">
                                <TextInput
                                    value={values.percentage}
                                    onChange={(event) =>
                                        handleChange('percentage', event.target.value.replace(/[^\d.]/g, ''))
                                    }
                                    className="h-[34px] w-[96px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-right text-[15px] text-[#1f2436]"
                                />
                                <span className="text-[17px] text-[#1f2436]">%</span>
                            </div>
                        </TaxFieldRow>

                        <TaxFieldRow label={form.labels.salesAccount} required>
                            <AccountLookupField
                                value={values.salesAccount}
                                placeholder={form.accountPlaceholder}
                                searchLabel={form.salesAccountSearchLabel}
                                dialogTitle="Pilih Akun Penjualan"
                                onRemove={() => {
                                    handleChange('salesAccount', '');
                                    handleChange('salesAccountId', null);
                                }}
                                onSelectAccount={(record, label) => {
                                    handleChange('salesAccount', label);
                                    handleChange('salesAccountId', record?.id ?? null);
                                }}
                                heightClassName="h-[34px]"
                            />
                        </TaxFieldRow>

                        <TaxFieldRow label={form.labels.purchaseAccount} required>
                            <AccountLookupField
                                value={values.purchaseAccount}
                                placeholder={form.accountPlaceholder}
                                searchLabel={form.purchaseAccountSearchLabel}
                                dialogTitle="Pilih Akun Pembelian"
                                onRemove={() => {
                                    handleChange('purchaseAccount', '');
                                    handleChange('purchaseAccountId', null);
                                }}
                                onSelectAccount={(record, label) => {
                                    handleChange('purchaseAccount', label);
                                    handleChange('purchaseAccountId', record?.id ?? null);
                                }}
                                heightClassName="h-[34px]"
                            />
                        </TaxFieldRow>
                    </div>
                </div>

                <div className="flex justify-end xl:shrink-0">
                    <div className="flex flex-row gap-3 xl:flex-col">
                        <DockActionButton
                            label={saving ? 'Memproses...' : form.saveLabel}
                            tone="primary"
                            icon={<SaveIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                            onClick={handleSave}
                            disabled={saveDisabled}
                        />
                        {isDetailMode ? (
                            <DockActionButton
                                label={saving ? 'Memproses...' : form.deleteLabel}
                                tone="danger"
                                icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                                disabled={saving}
                                onClick={requestDelete}
                            />
                        ) : null}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Pajak"
                message="Data pajak ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}

export default function TaxView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows: backendRows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'taxes',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });
    const mappedRows = useMemo(() => backendRows.map((row) => mapTaxRow(row)), [backendRows]);
    const resolvedPage = useMemo(() => ({
        ...page,
        table: {
            ...page.table,
            rows: mappedRows,
            pageValue: total.toLocaleString('id-ID'),
        },
        form: {
            ...page.form,
            records: mappedRows.map((row) => ({
                id: row.id,
                type: row.typeValue,
                description: row.description,
                percentage: row.percentage,
                salesAccount: row.salesAccount,
                salesAccountId: row.output_account_id ?? row.output_account?.id ?? null,
                purchaseAccount: row.purchaseAccount,
                purchaseAccountId: row.input_account_id ?? row.input_account?.id ?? null,
                __backendRecordId: row.id,
            })),
        },
        onRefresh: reload,
        onOpenDetail,
        onOpenContent,
        onCloseDetail,
    }), [mappedRows, onCloseDetail, onOpenContent, onOpenDetail, page, reload, total]);

    return mode === 'table' ? (
        <TaxTableView
            page={resolvedPage}
            rows={mappedRows}
            total={total}
            loading={loading}
            error={error}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <TaxFormView page={resolvedPage} activeLevel2Tab={activeLevel2Tab} />
    );
}
