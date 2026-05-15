import { useEffect, useMemo, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildAccountDetailRecord, buildAccountsConfig } from './accountsConfig';
import { TransactionDataTable, TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { formatAmountInput, parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    CloseIcon,
    CogIcon,
    DownloadIcon,
    ExternalLinkIcon,
    PrintIcon,
    RefreshIcon,
    SaveIcon,
    SearchIcon,
    SortIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

function buildFormState(source = {}) {
    return {
        ...source,
        currency: [...(source.currency ?? [])],
        branch: [...(source.branch ?? [])],
        childAccounts: [...(source.childAccounts ?? [])],
    };
}

function formatDisplayDate(value) {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return '';
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalizedValue)) {
        return normalizedValue;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
        const [year, month, day] = normalizedValue.split('-');
        return `${day}/${month}/${year}`;
    }

    return normalizedValue;
}

function normalizeDateForPayload(value) {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
        return normalizedValue;
    }

    const parts = normalizedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (!parts) {
        return null;
    }

    const [, day, month, year] = parts;

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function normalizeNumericValue(value) {
    return parseAmountInput(value, { emptyValue: null });
}

function sanitizeNumericInput(value) {
    return formatAmountInput(value);
}

function formatBalanceLabel(value) {
    const numericValue = Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return '';
    }

    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numericValue);
}

function mapAccountRow(record) {
    const openingBalance = Number(record.opening_balance ?? 0);

    return {
        id: String(record.id),
        code: record.code ?? '',
        name: record.name ?? '',
        type: record.account_type ?? '',
        balance: formatBalanceLabel(openingBalance),
        negative: openingBalance < 0,
        level: 0,
        inactiveValue: record.is_active === false ? 'inactive' : 'active',
    };
}

function buildAccountSourceRecord(record, config) {
    const childAccounts = Array.isArray(record.children)
        ? record.children.map((child) => ({
            id: String(child.id),
            code: child.code ?? '',
            name: child.name ?? '',
            level: 1,
        }))
        : [];

    return {
        ...config.createValues,
        id: String(record.id),
        parentId: record.parent_id ?? null,
        currencyId: record.currency_id ?? record.currency?.id ?? null,
        branchIds: Array.isArray(record.branches) ? record.branches.map((branch) => branch.id) : [],
        userIds: Array.isArray(record.users) ? record.users.map((user) => user.id) : [],
        type: record.account_type ?? config.createValues.type,
        isSubAccount: Boolean(record.parent_id),
        code: record.code ?? '',
        name: record.name ?? '',
        currency: record.currency?.name ? [record.currency.name] : [...(config.createValues.currency ?? [])],
        currencyLabel: record.currency?.name ?? config.createValues.currency?.[0] ?? '',
        balanceLabel: openingBalanceLabel(record.opening_balance),
        branch: Array.isArray(record.branches) && record.branches.length
            ? record.branches.map((branch) => branch.name).filter(Boolean)
            : [...(config.createValues.branch ?? [])],
        openingBalanceValue: record.opening_balance ?? '',
        openingBalanceDate: formatDisplayDate(record.opening_balance_date),
        notes: record.notes ?? '',
        cashBankReference: record.cash_bank_reference ?? '',
        allUsers: !Array.isArray(record.users) || record.users.length === 0,
        childAccounts,
    };
}

function openingBalanceLabel(value) {
    const formattedValue = formatBalanceLabel(value);

    return formattedValue ? `Rp ${formattedValue}` : '';
}

function buildComparableFormValues(values) {
    return {
        type: String(values.type ?? '').trim(),
        isSubAccount: Boolean(values.isSubAccount),
        code: String(values.code ?? '').trim(),
        name: String(values.name ?? '').trim(),
        openingBalanceValue: normalizeNumericValue(values.openingBalanceValue),
        openingBalanceDate: normalizeDateForPayload(values.openingBalanceDate),
        notes: String(values.notes ?? '').trim(),
        allUsers: Boolean(values.allUsers),
    };
}

function buildAccountPayload(values) {
    return {
        parent_id: values.isSubAccount ? (values.parentId ?? null) : null,
        currency_id: values.currencyId ?? null,
        code: String(values.code ?? '').trim(),
        name: String(values.name ?? '').trim(),
        account_type: String(values.type ?? '').trim(),
        notes: String(values.notes ?? '').trim() || null,
        opening_balance: normalizeNumericValue(values.openingBalanceValue) ?? 0,
        opening_balance_date: normalizeDateForPayload(values.openingBalanceDate),
        cash_bank_reference: String(values.cashBankReference ?? '').trim() || null,
        is_active: true,
        branch_ids: Array.isArray(values.branchIds) ? values.branchIds : [],
        user_ids: values.allUsers ? [] : (Array.isArray(values.userIds) ? values.userIds : []),
    };
}

function FieldLabel({ label, required = false, className = '' }) {
    return (
        <label className={`text-[17px] text-[#1f2436] ${className}`.trim()}>
            {label}
            {required ? <span className="text-[#ED3969]"> *</span> : null}
        </label>
    );
}

function FormFieldRow({ label, required = false, className = '', children }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[280px_minmax(0,430px)] lg:items-start ${className}`.trim()}>
            <FieldLabel label={label} required={required} className="pt-2 lg:pt-1.5" />
            <div>{children}</div>
        </div>
    );
}

function renderDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

function ToolbarIconAction({ action }) {
    const icon =
        action.icon === 'download'
            ? <DownloadIcon className="h-4 w-4" />
            : action.icon === 'external-link'
              ? <ExternalLinkIcon className="h-4 w-4" />
              : action.icon === 'print'
                ? <PrintIcon className="h-4 w-4" />
                : <CogIcon className="h-4 w-4" />;

    return (
        <button
            type="button"
            aria-label={action.label}
            title={action.label}
            className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
        >
            {icon}
        </button>
    );
}

function AccountsTableView({ config, onCreate, onOpenDetail, loading = false, error = '', onReload = null }) {
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        config.table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            const matchesFilters = config.table.filters.every((filter) => {
                const selectedValue = filters[filter.id];

                if (!selectedValue || selectedValue === 'all' || !filter.rowKey) {
                    return true;
                }

                return row[filter.rowKey] === selectedValue;
            });

            if (!matchesFilters) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.code, row.name, row.type, row.balance].some((value) =>
                String(value ?? '').toLowerCase().includes(normalizedKeyword),
            );
        });
    }, [config.table.filters, config.table.rows, filters, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                filters={
                    <div className="flex flex-wrap items-center gap-2">
                        {config.table.filters.map((filter) => (
                            <SelectField
                                key={filter.id}
                                value={filters[filter.id]}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        [filter.id]: event.target.value,
                                    }))
                                }
                                containerClassName="w-auto shrink-0"
                                className="h-[34px] min-w-[128px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="px-3 text-[15px] text-[#394157]"
                                iconClassName="mr-2 text-[#6c7894]"
                            >
                                {filter.options.map((option, index) => (
                                    <option key={`${filter.id}-${option.value}-${index}`} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectField>
                        ))}
                    </div>
                }
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <RefreshIcon className="h-4.5 w-4.5" />,
                    onClick: onReload,
                    loading,
                }}
                rightControls={config.table.toolbarActions.map((action) => (
                    <ToolbarIconAction key={action.id} action={action} />
                ))}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={filteredRows}
                    minWidthClassName="min-w-[1380px]"
                    onRowClick={(row) =>
                        onOpenDetail?.({
                            recordId: row.id,
                            label: row.name,
                            tabLabel: row.name,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-start'}`.trim()}>
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                    renderCell={({ row, column }) => {
                        if (column.id === 'code') {
                            return (
                                <span className="block truncate" style={{ paddingLeft: `${row.level * 18}px` }}>
                                    {row.code}
                                </span>
                            );
                        }

                        if (column.id === 'name') {
                            return (
                                <span className="block truncate" style={{ paddingLeft: `${row.level * 18}px` }}>
                                    {row.name}
                                </span>
                            );
                        }

                        if (column.id === 'balance') {
                            return <span className={row.negative ? 'text-[#ff3b30]' : ''}>{row.balance}</span>;
                        }

                        return <span className="block truncate">{row[column.id]}</span>;
                    }}
                    emptyLabel={loading ? 'Memuat data...' : (error || 'Belum ada data')}
                />
            </div>
        </div>
    );
}

function AccountsGeneralTab({ config, values, isDetail, onChange }) {
    return (
        <div className="space-y-4">
            <FormFieldRow label={config.labels.type}>
                {isDetail ? (
                    <TextInput
                        value={values.type}
                        readOnly
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                ) : (
                    <SelectField
                        value={values.type}
                        onChange={(event) => onChange('type', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {config.typeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                )}
            </FormFieldRow>

            <div className="lg:pl-[280px]">
                <CheckboxField
                    id="accounts-sub-account"
                    label={config.labels.isSubAccount}
                    checked={Boolean(values.isSubAccount)}
                    onChange={(event) => onChange('isSubAccount', event.target.checked)}
                    align="center"
                    labelClassName="text-[17px]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </div>

            <FormFieldRow label={config.labels.code} required>
                <TextInput
                    value={values.code}
                    onChange={(event) => onChange('code', event.target.value)}
                    readOnly={isDetail}
                    trailing={
                        isDetail ? <CloseIcon className="h-4 w-4 text-[#111827]" strokeWidth={2.4} /> : null
                    }
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName={isDetail ? 'px-3' : ''}
                />
            </FormFieldRow>

            <FormFieldRow label={config.labels.name} required>
                <TextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    readOnly={isDetail}
                    trailing={
                        isDetail ? <CloseIcon className="h-4 w-4 text-[#111827]" strokeWidth={2.4} /> : null
                    }
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName={isDetail ? 'px-3' : ''}
                />
                <p className="mt-2 pl-4 text-[14px] italic text-[#8a91a8]">{config.helperText.nameExample}</p>
            </FormFieldRow>

            <FormFieldRow label={config.labels.currency}>
                {isDetail ? (
                    <TextInput
                        value={values.currencyLabel}
                        readOnly
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#8a91a8]"
                    />
                ) : (
                    <ChipLookupField
                        values={values.currency}
                        placeholder={config.placeholders.currency}
                        onRemove={() => {}}
                        searchLabel="Cari mata uang"
                    />
                )}
            </FormFieldRow>

            {isDetail ? (
                <FormFieldRow label={config.labels.balance}>
                    <div className="pt-1 text-[18px] text-[#1f2436]">{values.balanceLabel}</div>
                </FormFieldRow>
            ) : null}
        </div>
    );
}

function AccountsOpeningBalanceTab({ config, values, onChange }) {
    return (
        <div className="space-y-6">
            <h3 className="text-[24px] font-normal text-[#1f2436]">{config.headingLabels.openingBalance}</h3>

            <FormFieldRow label={config.labels.branch}>
                <ChipLookupField
                    values={values.branch}
                    placeholder={config.placeholders.branch}
                    onRemove={() => {}}
                    searchLabel="Cari cabang"
                />
            </FormFieldRow>

            <FormFieldRow label={config.labels.openingBalanceValue}>
                <FormattedAmountInput
                    value={values.openingBalanceValue}
                    onChange={(event) => onChange('openingBalanceValue', sanitizeNumericInput(event.target.value))}
                    prefix="Rp"
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    prefixClassName="min-w-[34px] bg-[#f5f6f8] px-3 text-[#9aa3b1]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </FormFieldRow>

            <FormFieldRow label={config.labels.openingBalanceDate}>
                <TransactionDateInput
                    value={values.openingBalanceDate}
                    onChange={(nextValue) => onChange('openingBalanceDate', nextValue)}
                    className="max-w-[430px]"
                />
            </FormFieldRow>
        </div>
    );
}

function AccountsOthersTab({ config, values, isDetail, onChange }) {
    return (
        <div className="space-y-6">
            <FormFieldRow label={config.labels.notes} className="lg:grid-cols-[280px_minmax(0,570px)]">
                <TextareaField
                    value={values.notes}
                    onChange={(event) => onChange('notes', event.target.value)}
                    rows={3}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[68px] text-[15px] text-[#1f2436]"
                />
            </FormFieldRow>

            {isDetail ? (
                <FormFieldRow label={config.labels.cashBankReference}>
                    <TextInput
                        value={values.cashBankReference}
                        readOnly
                        className="h-[40px] rounded-[4px] border-[#9ce04f] bg-[#eef8e7]"
                        inputClassName="text-[15px] text-[#4d9b1f]"
                    />
                </FormFieldRow>
            ) : null}

            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-[18px] font-medium text-[#1f2436]">{config.headingLabels.userAccess}</h3>
            </div>

            <CheckboxField
                id="accounts-all-users"
                label={config.labels.allUsers}
                checked={Boolean(values.allUsers)}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-[17px]"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName="w-auto"
            />
        </div>
    );
}

function AccountsChildrenTab({ values }) {
    return (
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_310px]">
            <div className="space-y-1.5">
                {values.childAccounts.map((item) => (
                    <div
                        key={`${item.id}-name`}
                        className="rounded-[3px] bg-[#cbcbcb] px-4 py-2.5 text-[17px] text-[#1f2436]"
                        style={{ paddingLeft: `${16 + item.level * 18}px` }}
                    >
                        {item.name}
                    </div>
                ))}
            </div>

            <div className="space-y-1.5">
                {values.childAccounts.map((item) => (
                    <div key={`${item.id}-code`} className="rounded-[3px] bg-[#cbcbcb] px-4 py-2.5 text-[17px] text-[#1f2436]">
                        {item.code}
                    </div>
                ))}
            </div>
        </div>
    );
}

function AccountsFormView({ config, backendRows, activeLevel2Tab, onOpenDetail, onCloseDetail, onReload }) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const tabs = isDetail ? config.detailTabs : config.createTabs;
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'general');
    const backendRecord = useMemo(
        () => backendRows.find((row) => String(row.id) === String(recordId)) ?? null,
        [backendRows, recordId],
    );
    const sourceRecord = useMemo(
        () => (isDetail
            ? (backendRecord ? buildAccountSourceRecord(backendRecord, config) : buildAccountDetailRecord(recordId, config))
            : config.createValues),
        [backendRecord, config, isDetail, recordId],
    );
    const [values, setValues] = useState(() => buildFormState(sourceRecord));
    const [saving, setSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const initialValues = useMemo(() => buildFormState(sourceRecord), [sourceRecord]);

    useEffect(() => {
        setActiveTabId((isDetail ? config.detailTabs : config.createTabs)[0]?.id ?? 'general');
        setValues(initialValues);
    }, [config.createTabs, config.detailTabs, initialValues, isDetail]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const dockActions = isDetail ? config.dock.detailActions : config.dock.createActions;
    const validationMessage = useMemo(
        () =>
            validateRequiredChecks([
                { label: config.labels.type, value: values.type },
                { label: config.labels.code, value: values.code },
                { label: config.labels.name, value: values.name },
            ]),
        [config.labels.code, config.labels.name, config.labels.type, values.code, values.name, values.type],
    );
    const hasChanges = useMemo(
        () => !areComparableValuesEqual(buildComparableFormValues(initialValues), buildComparableFormValues(values)),
        [initialValues, values],
    );
    const saveDisabled = saving || Boolean(validationMessage) || !hasChanges;

    useWorkspaceDirtyRegistration({
        pageId: 'accounts',
        tabId: activeLevel2Tab?.id,
        dirty: hasChanges,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage);
            return;
        }

        if (!hasChanges) {
            rejectCrudFormAction('Belum ada perubahan untuk disimpan.');
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Menyimpan akun perkiraan...' : 'Membuat akun perkiraan...',
            successMessage: isDetail ? 'Akun perkiraan berhasil diperbarui.' : 'Akun perkiraan berhasil dibuat.',
            setSaving,
            execute: async () => {
                const payload = buildAccountPayload(values);
                const response = isDetail
                    ? await updateBackendResource('accounts', recordId, payload)
                    : await createBackendResource('accounts', payload);

                return {
                    payload,
                    savedRecord: response?.data ?? null,
                };
            },
            getErrorMessage: (error) => getBackendErrorMessage(error, 'Akun perkiraan gagal disimpan.'),
            onSuccess: async ({ payload, savedRecord }) => {
                await onReload?.();

                if (!isDetail && savedRecord?.id) {
                    onOpenDetail?.({
                        recordId: String(savedRecord.id),
                        label: savedRecord.name ?? payload.name,
                        tabLabel: savedRecord.name ?? payload.name,
                    });
                }
            },
        });
    }

    async function handleDelete() {
        if (!recordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Menghapus akun perkiraan...',
            successMessage: 'Akun perkiraan berhasil dihapus.',
            setSaving,
            onStart: () => setDeleteModalOpen(false),
            execute: () => deleteBackendResource('accounts', recordId),
            getErrorMessage: (error) => getBackendErrorMessage(error, 'Akun perkiraan gagal dihapus.'),
            onSuccess: async () => {
                await onReload?.();
                onCloseDetail?.(recordId);
            },
        });
    }

    return (
        <>
            <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                <PreferencesTabs
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                />

                <div className="flex min-h-[640px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                    <div className="order-2 min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-3 py-4 sm:px-4 lg:order-1">
                        <div className="max-w-[1260px]">
                            {activeTabId === 'opening-balance' ? (
                                <AccountsOpeningBalanceTab config={config} values={values} onChange={handleChange} />
                            ) : activeTabId === 'others' ? (
                                <AccountsOthersTab config={config} values={values} isDetail={isDetail} onChange={handleChange} />
                            ) : activeTabId === 'children' ? (
                                <AccountsChildrenTab values={values} />
                            ) : (
                                <AccountsGeneralTab config={config} values={values} isDetail={isDetail} onChange={handleChange} />
                            )}
                        </div>
                    </div>

                    <div className="order-1 flex justify-end lg:order-2 lg:shrink-0">
                        <div className="flex flex-row gap-3 lg:flex-col">
                            {dockActions.map((action) => {
                                const isSaveAction = action.id === 'save';
                                const isDeleteAction = action.id === 'delete';

                                return (
                                    <DockActionButton
                                        key={action.id}
                                        label={action.label}
                                        tone={isSaveAction ? 'primary' : action.tone}
                                        icon={renderDockIcon(action.icon)}
                                        onClick={isSaveAction ? handleSave : (isDeleteAction ? () => setDeleteModalOpen(true) : undefined)}
                                        disabled={isSaveAction ? saveDisabled : saving}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                open={deleteModalOpen}
                title="Hapus akun perkiraan"
                message={`Akun "${values.name || values.code || 'ini'}" akan dihapus. Lanjutkan?`}
                confirmLabel="Hapus"
                confirmVariant="danger"
                confirmLoading={saving}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}

export default function AccountsView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const {
        rows: backendRows,
        loading,
        error,
        reload,
    } = useBackendIndexResource({
        resource: 'accounts',
        filters: {
            per_page: 100,
        },
    });
    const config = useMemo(() => {
        const baseConfig = buildAccountsConfig(page.accounts);

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: backendRows.map(mapAccountRow),
                pageValue: backendRows.length.toLocaleString('id-ID'),
            },
        };
    }, [backendRows, page.accounts]);

    return mode === 'table' ? (
        <AccountsTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onReload={reload}
        />
    ) : (
        <AccountsFormView
            config={config}
            backendRows={backendRows}
            activeLevel2Tab={activeLevel2Tab}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onReload={reload}
        />
    );
}
