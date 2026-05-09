import { useEffect, useMemo, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { buildAccountDetailRecord, buildAccountsConfig } from '@/features/workspace/modules/accountsConfig';
import { TransactionDataTable, TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
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

function AccountsTableView({ config, onCreate, onOpenDetail }) {
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
                className="space-y-3"
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
                    emptyLabel="Belum ada data"
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
                <TextInput
                    value={values.openingBalanceValue}
                    onChange={(event) => onChange('openingBalanceValue', event.target.value)}
                    prefix="Rp"
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    prefixClassName="min-w-[34px] bg-[#f5f6f8] px-3 text-[#9aa3b1]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </FormFieldRow>

            <FormFieldRow label={config.labels.openingBalanceDate}>
                <TransactionDateInput value={values.openingBalanceDate} className="max-w-[430px]" />
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

function AccountsFormView({ config, activeLevel2Tab }) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const tabs = isDetail ? config.detailTabs : config.createTabs;
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'general');
    const sourceRecord = useMemo(
        () => (isDetail ? buildAccountDetailRecord(recordId, config) : config.createValues),
        [config, isDetail, recordId],
    );
    const [values, setValues] = useState(() => buildFormState(sourceRecord));

    useEffect(() => {
        setActiveTabId((isDetail ? config.detailTabs : config.createTabs)[0]?.id ?? 'general');
        setValues(buildFormState(sourceRecord));
    }, [config.createTabs, config.detailTabs, isDetail, sourceRecord]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const dockActions = isDetail ? config.dock.detailActions : config.dock.createActions;

    return (
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
                        {dockActions.map((action) => (
                            <DockActionButton
                                key={action.id}
                                label={action.label}
                                tone={action.tone}
                                icon={renderDockIcon(action.icon)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AccountsView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildAccountsConfig(page.accounts), [page.accounts]);

    return mode === 'table' ? (
        <AccountsTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <AccountsFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
