import { useEffect, useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import { AccountLookupField, buildAccountLookupLabel } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { currencyReferenceOptions } from '@/features/workspace/shared/referenceLookupData';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PlusIcon, RefreshIcon, SaveIcon, SearchIcon, SortIcon, TrashIcon } from '@/features/workspace/shared/Icons';

const currencyReferenceIndex = new Map(
    currencyReferenceOptions.map((option) => [
        option.currencyCode,
        option,
    ]),
);

const DEFAULT_ACCOUNT_FIELD_MAP = {
    accountsPayable: {
        idKey: 'accounts_payable_account_id',
        relationKey: 'accounts_payable_account',
        fallbackKey: 'accountsPayable',
    },
    accountsReceivable: {
        idKey: 'accounts_receivable_account_id',
        relationKey: 'accounts_receivable_account',
        fallbackKey: 'accountsReceivable',
    },
    purchaseAdvance: {
        idKey: 'purchase_advance_account_id',
        relationKey: 'purchase_advance_account',
        fallbackKey: 'purchaseAdvance',
    },
    salesAdvance: {
        idKey: 'sales_advance_account_id',
        relationKey: 'sales_advance_account',
        fallbackKey: 'salesAdvance',
    },
    salesDiscount: {
        idKey: 'sales_discount_account_id',
        relationKey: 'sales_discount_account',
        fallbackKey: 'salesDiscount',
    },
    realizedGainLoss: {
        idKey: 'realized_gain_loss_account_id',
        relationKey: 'realized_gain_loss_account',
        fallbackKey: 'realizedGainLoss',
    },
    unrealizedGainLoss: {
        idKey: 'unrealized_gain_loss_account_id',
        relationKey: 'unrealized_gain_loss_account',
        fallbackKey: 'unrealizedGainLoss',
    },
};

function CurrencyFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,570px)] lg:items-start">
            <label className="pt-2 text-[17px] leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function buildCurrencyValuesFromRecord(record = null, config = null) {
    if (!record) {
        return {
            countryName: config?.createDefaults?.countryName ?? '',
            code: '',
            symbol: '',
            countryCode: '',
            defaultAccounts: {},
            defaultAccountIds: {},
            __backendRecordId: null,
        };
    }

    const referenceMatch = currencyReferenceIndex.get(String(record.code ?? '').toUpperCase());
    const fallbackRecord = (config?.records ?? []).find(
        (item) => String(item.code ?? '').toUpperCase() === String(record.code ?? '').toUpperCase(),
    );
    const defaultAccounts = {};
    const defaultAccountIds = {};

    for (const [fieldId, mapping] of Object.entries(DEFAULT_ACCOUNT_FIELD_MAP)) {
        const relatedRecord = record[mapping.relationKey];
        const fallbackLabel = fallbackRecord?.defaultAccounts?.[mapping.fallbackKey] ?? '';

        defaultAccounts[fieldId] = relatedRecord ? buildAccountLookupLabel(relatedRecord) : fallbackLabel;
        defaultAccountIds[fieldId] = record[mapping.idKey] ?? relatedRecord?.id ?? null;
    }

    return {
        countryName: record.name ?? '',
        code: record.code ?? '',
        symbol: record.symbol ?? '',
        countryCode: referenceMatch?.countryCode ?? '',
        defaultAccounts,
        defaultAccountIds,
        __backendRecordId: record.id ?? null,
    };
}

function buildCurrencySnapshot(values) {
    return {
        countryName: values.countryName,
        code: String(values.code ?? '').toUpperCase(),
        symbol: values.symbol,
        defaultAccountIds: values.defaultAccountIds,
    };
}

function validateCurrencyValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.countryName, value: values.countryName, type: 'lookup' },
        { label: config.labels.code, value: values.code },
        { label: config.labels.symbol, value: values.symbol },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    if (String(values.code ?? '').trim().length !== 3) {
        return 'Kode mata uang harus terdiri dari 3 karakter.';
    }

    return '';
}

function mapCurrencyRow(record) {
    const referenceMatch = currencyReferenceIndex.get(String(record.code ?? '').toUpperCase());

    return {
        ...record,
        id: String(record.id),
        name: record.name ?? '',
        symbol: record.symbol ?? '',
        code: record.code ?? '',
        countryName: record.name ?? '',
        countryCode: referenceMatch?.countryCode ?? '',
        tabLabel: record.name ?? record.code ?? String(record.id),
    };
}

function findCurrencyDetailRow(tableRows, activeLevel2Tab) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

    if (!recordId) {
        return null;
    }

    return (tableRows ?? []).find((row) => String(row.id) === String(recordId)) ?? null;
}

function CurrencyFormView({ page, activeLevel2Tab, tableRows = [], onOpenContent, onOpenDetail, onCloseDetail, onRefresh }) {
    const config = page.currency;
    const detailRow = useMemo(() => findCurrencyDetailRow(tableRows, activeLevel2Tab), [activeLevel2Tab, tableRows]);
    const isDetailMode = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(isDetailMode ? 'currency-general' : 'currency-general');
    const initialValues = useMemo(() => buildCurrencyValuesFromRecord(detailRow, config), [config, detailRow]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    useEffect(() => {
        setActiveTabId('currency-general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [initialValues]);

    const tabs = isDetailMode ? config.detailTabs : config.createTabs;
    const validationMessage = useMemo(() => validateCurrencyValues(values, config), [config, values]);
    const isDirty = useMemo(
        () => !areComparableValuesEqual(buildCurrencySnapshot(values), buildCurrencySnapshot(initialValues)),
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
            loadingMessage: isDetailMode ? 'Sedang memperbarui mata uang.' : 'Sedang menyimpan mata uang.',
            successMessage: isDetailMode ? 'Mata uang berhasil diperbarui.' : 'Mata uang berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    code: String(values.code ?? '').trim().toUpperCase(),
                    name: String(values.countryName ?? '').trim(),
                    symbol: String(values.symbol ?? '').trim(),
                    exchange_rate: 1,
                    is_active: true,
                    accounts_payable_account_id: values.defaultAccountIds.accountsPayable ?? null,
                    accounts_receivable_account_id: values.defaultAccountIds.accountsReceivable ?? null,
                    purchase_advance_account_id: values.defaultAccountIds.purchaseAdvance ?? null,
                    sales_advance_account_id: values.defaultAccountIds.salesAdvance ?? null,
                    sales_discount_account_id: values.defaultAccountIds.salesDiscount ?? null,
                    realized_gain_loss_account_id: values.defaultAccountIds.realizedGainLoss ?? null,
                    unrealized_gain_loss_account_id: values.defaultAccountIds.unrealizedGainLoss ?? null,
                };
                const response = isDetailMode && values.__backendRecordId
                    ? await updateBackendResource('currencies', values.__backendRecordId, payload)
                    : await createBackendResource('currencies', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetailMode && record?.id) {
                    const row = mapCurrencyRow(record);

                    onOpenDetail?.({
                        recordId: row.id,
                        label: row.countryName,
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
            loadingMessage: 'Sedang menghapus mata uang.',
            successMessage: 'Mata uang berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('currencies', values.__backendRecordId),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[642px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    <CrudStatusMessage status={status} />

                    {activeTabId === 'currency-default-accounts' && isDetailMode ? (
                        <div className="max-w-[1180px] space-y-3">
                            {config.accountFields.map((field) => (
                                <CurrencyFieldRow key={field.id} label={field.label}>
                                    <AccountLookupField
                                        value={values.defaultAccounts[field.id] ?? ''}
                                        placeholder={config.accountPlaceholder}
                                        searchLabel={`Cari ${field.label}`}
                                        dialogTitle={`Pilih ${field.label}`}
                                        onSelectAccount={(record, label) =>
                                            setValues((current) => ({
                                                ...current,
                                                defaultAccounts: {
                                                    ...current.defaultAccounts,
                                                    [field.id]: label,
                                                },
                                                defaultAccountIds: {
                                                    ...current.defaultAccountIds,
                                                    [field.id]: record?.id ?? null,
                                                },
                                            }))
                                        }
                                        onRemove={() =>
                                            setValues((current) => ({
                                                ...current,
                                                defaultAccounts: {
                                                    ...current.defaultAccounts,
                                                    [field.id]: '',
                                                },
                                                defaultAccountIds: {
                                                    ...current.defaultAccountIds,
                                                    [field.id]: null,
                                                },
                                            }))
                                        }
                                    />
                                </CurrencyFieldRow>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-[1180px] space-y-3">
                            <CurrencyFieldRow label={config.labels.countryName} required>
                                {isDetailMode ? (
                                    <ChipLookupField
                                        value={values.countryName}
                                        placeholder={config.lookupPlaceholder}
                                        searchLabel="Cari negara atau nama mata uang"
                                        disabled
                                    />
                                ) : (
                                    <ReferenceLookupInput
                                        value={values.countryName}
                                        placeholder={config.lookupPlaceholder}
                                        searchLabel="Cari negara atau nama mata uang"
                                        items={currencyReferenceOptions}
                                        getOptionLabel={(option) => option.name}
                                        getOptionSearchText={(option) =>
                                            [option.name, option.currencyCode, option.symbol, option.countryCode].join(' ')
                                        }
                                        onSelect={(option) =>
                                            setValues((current) => ({
                                                ...current,
                                                countryName: option?.name ?? '',
                                                code: option?.currencyCode ?? '',
                                                symbol: option?.symbol ?? '',
                                                countryCode: option?.countryCode ?? '',
                                            }))
                                        }
                                        onClear={() =>
                                            setValues((current) => ({
                                                ...current,
                                                countryName: '',
                                                code: '',
                                                symbol: '',
                                                countryCode: '',
                                            }))
                                        }
                                        emptyTitle="Mata uang tidak ditemukan"
                                        emptyDescription="Coba cari nama, kode, atau simbol mata uang."
                                        renderOption={(option) => (
                                            <div className="min-w-0">
                                                <div className="truncate text-[17px] text-[#131a28]">{option.name}</div>
                                                <div className="mt-1 text-[15px] text-[#1f2436]">
                                                    {option.currencyCode} {option.symbol}
                                                </div>
                                            </div>
                                        )}
                                    />
                                )}
                            </CurrencyFieldRow>

                            {isDetailMode ? (
                                <>
                                    <CurrencyFieldRow label={config.labels.code}>
                                        <div className="pt-2 text-[17px] font-semibold text-[#131a28]">{values.code}</div>
                                    </CurrencyFieldRow>

                                    <CurrencyFieldRow label={config.labels.symbol}>
                                        <div className="pt-2 text-[17px] font-semibold text-[#131a28]">{values.symbol}</div>
                                    </CurrencyFieldRow>
                                </>
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="flex justify-end lg:shrink-0">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        {!isDetailMode || activeTabId === 'currency-default-accounts' ? (
                            <DockActionButton
                                label={saving ? 'Memproses...' : config.saveLabel}
                                tone="primary"
                                icon={<SaveIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                                onClick={handleSave}
                                disabled={saveDisabled}
                            />
                        ) : null}
                        {isDetailMode ? (
                            <DockActionButton
                                label={saving ? 'Memproses...' : config.deleteLabel}
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
                title="Hapus Mata Uang"
                message="Mata uang ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}

function CurrencyTableView({ page, rows, total, loading, error, onCreate, onOpenDetail, onRefresh }) {
    const table = page.currency.table;
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return rows.filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            return [row.symbol, row.code, row.countryName].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: loading ? 'Memuat data...' : table.refreshLabel,
                    onClick: onRefresh,
                    loading,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={total.toLocaleString('id-ID')}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${column.align === 'right' ? 'text-right' : 'text-left'}`.trim()}
                                >
                                    <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : ''}`.trim()}>
                                        <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                        <span>{column.label}</span>
                                    </span>
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.countryName,
                                            tabLabel: row.tabLabel ?? row.countryName,
                                        })
                                    }
                                >
                                    {table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-3 text-[15px] text-[#131a28]`.trim()}
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={table.columns.length} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
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

export default function CurrencyView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows: backendRows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'currencies',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });
    const mappedRows = useMemo(() => backendRows.map((row) => mapCurrencyRow(row)), [backendRows]);

    return mode === 'table' ? (
        <CurrencyTableView
            page={page}
            rows={mappedRows}
            total={total}
            loading={loading}
            error={error}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <CurrencyFormView
            page={page}
            activeLevel2Tab={activeLevel2Tab}
            tableRows={mappedRows}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
