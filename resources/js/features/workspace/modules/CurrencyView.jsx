import { useEffect, useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PlusIcon, RefreshIcon, SaveIcon, SearchIcon, SortIcon, TrashIcon } from '@/features/workspace/shared/Icons';

function CurrencyFlag({ countryCode }) {
    if (countryCode === 'ID') {
        return (
            <span className="inline-flex h-5 w-[22px] flex-col overflow-hidden rounded-[2px] border border-[#d2d8e3] shadow-[0_2px_6px_rgba(15,23,42,0.12)]">
                <span className="flex-1 bg-[#ff2a2a]" />
                <span className="flex-1 bg-white" />
            </span>
        );
    }

    return (
        <span className="inline-flex h-5 min-w-[28px] items-center justify-center rounded-[3px] border border-[#d2d8e3] bg-[#f3f4f6] px-1 text-[11px] font-semibold text-[#475069]">
            {countryCode}
        </span>
    );
}

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

function buildCurrencyValues(config, recordId) {
    const record = config.records.find((item) => item.id === recordId);

    if (!record) {
        return {
            countryName: config.createDefaults?.countryName ?? '',
            code: '',
            symbol: '',
            countryCode: '',
            defaultAccounts: {},
        };
    }

    return {
        countryName: record.countryName,
        code: record.code,
        symbol: record.symbol,
        countryCode: record.countryCode,
        defaultAccounts: { ...(record.defaultAccounts ?? {}) },
    };
}

function CurrencyFormView({ page, activeLevel2Tab }) {
    const config = page.currency;
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetailMode = Boolean(recordId);
    const [activeTabId, setActiveTabId] = useState(isDetailMode ? 'currency-general' : 'currency-general');
    const [values, setValues] = useState(() => buildCurrencyValues(config, recordId));

    useEffect(() => {
        setActiveTabId('currency-general');
        setValues(buildCurrencyValues(config, recordId));
    }, [config, recordId]);

    const tabs = isDetailMode ? config.detailTabs : config.createTabs;

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[642px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    {activeTabId === 'currency-default-accounts' && isDetailMode ? (
                        <div className="max-w-[1180px] space-y-3">
                            {config.accountFields.map((field) => (
                                <CurrencyFieldRow key={field.id} label={field.label}>
                                    <AccountLookupField
                                        value={values.defaultAccounts[field.id] ?? ''}
                                        placeholder={config.accountPlaceholder}
                                        searchLabel={`Cari ${field.label}`}
                                        dialogTitle={`Pilih ${field.label}`}
                                        onSelectAccount={(_, label) =>
                                            setValues((current) => ({
                                                ...current,
                                                defaultAccounts: {
                                                    ...current.defaultAccounts,
                                                    [field.id]: label,
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
                                            }))
                                        }
                                    />
                                </CurrencyFieldRow>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-[1180px] space-y-3">
                            <CurrencyFieldRow label={config.labels.countryName} required>
                                <ChipLookupField
                                    value={values.countryName}
                                    placeholder={config.lookupPlaceholder}
                                    searchLabel="Cari negara atau nama mata uang"
                                />
                            </CurrencyFieldRow>

                            {isDetailMode ? (
                                <>
                                    <CurrencyFieldRow label={config.labels.code}>
                                        <div className="pt-2 text-[17px] font-semibold text-[#131a28]">{values.code}</div>
                                    </CurrencyFieldRow>

                                    <CurrencyFieldRow label={config.labels.symbol}>
                                        <div className="pt-2 text-[17px] font-semibold text-[#131a28]">{values.symbol}</div>
                                    </CurrencyFieldRow>

                                    <CurrencyFieldRow label={config.labels.flag}>
                                        <div className="pt-2">
                                            <CurrencyFlag countryCode={values.countryCode} />
                                        </div>
                                    </CurrencyFieldRow>
                                </>
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="flex justify-end lg:shrink-0">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        <DockActionButton label={config.saveLabel} tone="muted" icon={<SaveIcon className="h-8 w-8 sm:h-9 sm:w-9" />} />
                        {isDetailMode ? <DockActionButton label={config.deleteLabel} tone="danger" icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />} /> : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CurrencyTableView({ page, onCreate, onOpenDetail }) {
    const table = page.currency.table;
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            return [row.symbol, row.code, row.countryName].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, table.rows]);

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
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
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
                        {filteredRows.map((row, index) => (
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
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function CurrencyView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    return mode === 'table' ? (
        <CurrencyTableView page={page} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <CurrencyFormView page={page} activeLevel2Tab={activeLevel2Tab} />
    );
}
