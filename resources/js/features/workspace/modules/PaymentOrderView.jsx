import { useEffect, useMemo, useState } from 'react';

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
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSectionRail,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { CogIcon, FunnelIcon, LinkIcon, PlusIcon, PrintIcon, SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';

function buildFormValues(config) {
    return {
        transferDueDate: config.draft?.transferDueDate ?? '',
        paymentMethod: config.draft?.paymentMethod ?? '',
        autoNumber: config.draft?.autoNumber ?? true,
        numberingType: config.draft?.numberingType ?? '',
        invoiceSearch: config.draft?.invoiceSearch ?? '',
        notes: config.draft?.notes ?? '',
        branches: [...(config.draft?.branches ?? [])],
        footerValue: config.draft?.footerValue ?? '0',
    };
}

function PaymentOrderFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
            <TransactionFieldLabel label={label} required={required} />
            <div>{children}</div>
        </div>
    );
}

function PaymentOrderInvoiceTable({ config }) {
    return (
        <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
            <div className="min-w-[1180px]">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.invoiceTable.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${
                                        column.align === 'right'
                                            ? 'text-right'
                                            : column.align === 'center'
                                              ? 'text-center'
                                              : 'text-left'
                                    }`.trim()}
                                >
                                    <span
                                        className={`flex items-center gap-2 ${
                                            column.align === 'right'
                                                ? 'justify-end'
                                                : column.align === 'center'
                                                  ? 'justify-center'
                                                  : 'justify-start'
                                        }`.trim()}
                                    >
                                        <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                        <span>{column.label}</span>
                                    </span>
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        <DataTableRow className="bg-white">
                            <DataTableCell
                                colSpan={config.invoiceTable.columns.length}
                                className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                            >
                                {config.invoiceTable.emptyLabel}
                            </DataTableCell>
                        </DataTableRow>
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

function PaymentOrderDetailsSection({ config, values, setValues }) {
    return (
        <div className="flex min-h-[560px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1 sm:max-w-[720px]">
                        <TextInput
                            value={values.invoiceSearch}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    invoiceSearch: event.target.value,
                                }))
                            }
                            placeholder={config.invoiceSearchPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                    >
                        {config.takeButtonLabel}
                    </button>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <TransactionToolbarIconButton label="Cari faktur">
                        <SearchIcon className="h-5 w-5" />
                    </TransactionToolbarIconButton>
                    <div className="text-right text-[22px] font-normal text-[#1f2436]">
                        {config.invoiceSectionTitle} <span className="text-[#ED3969]">*</span>
                    </div>
                </div>
            </div>

            <PaymentOrderInvoiceTable config={config} />
        </div>
    );
}

function PaymentOrderInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[560px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.notes} />
                <div className="max-w-[568px]">
                    <TextareaField
                        value={values.notes}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        rows={4}
                        className="rounded-[4px] border-[#cfd6e2]"
                        textareaClassName="min-h-[70px] text-[15px] text-[#1f2436]"
                    />
                </div>

                <TransactionFieldLabel label={config.labels.branch} required />
                <div className="max-w-[568px]">
                    <ChipLookupField
                        values={values.branches}
                        placeholder={config.branchPlaceholder}
                        searchLabel="Cari cabang"
                        heightClassName="h-[34px]"
                    />
                </div>
            </div>
        </div>
    );
}

function PaymentOrderFormView({ config }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildFormValues(config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormValues(config));
    }, [config]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-[#d8dde7] px-4 py-4">
                        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
                            <div className="space-y-3">
                                <PaymentOrderFieldRow label={config.labels.transferDueDate} required>
                                    <TransactionDateInput value={values.transferDueDate} className="max-w-[280px]" />
                                </PaymentOrderFieldRow>

                                <PaymentOrderFieldRow label={config.labels.paymentMethod}>
                                    <div className="max-w-[280px]">
                                        <SelectField
                                            value={values.paymentMethod}
                                            onChange={(event) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    paymentMethod: event.target.value,
                                                }))
                                            }
                                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                            selectClassName="text-[15px] text-[#1f2436]"
                                        >
                                            {config.paymentMethodOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </SelectField>
                                    </div>
                                </PaymentOrderFieldRow>
                            </div>

                            <div className="space-y-3">
                                <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
                                    <div className="flex items-center justify-start gap-4 lg:justify-end">
                                        <TransactionFieldLabel label={config.labels.documentNumber} required />
                                        <TransactionSwitch
                                            checked={values.autoNumber}
                                            onChange={(nextValue) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    autoNumber: nextValue,
                                                }))
                                            }
                                        />
                                    </div>

                                    <SelectField
                                        value={values.numberingType}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                numberingType: event.target.value,
                                            }))
                                        }
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        selectClassName="text-[15px] text-[#1f2436]"
                                    >
                                        {config.numberingOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </SelectField>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-h-[620px] gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeSectionId === 'additional-info' ? (
                                <PaymentOrderInfoSection config={config} values={values} setValues={setValues} />
                            ) : (
                                <PaymentOrderDetailsSection config={config} values={values} setValues={setValues} />
                            )}
                        </div>
                    </div>

                    <div className="px-3 pb-3">
                        <div className="flex justify-end">
                            <TransactionTotalCard label={config.footerLabel} value={formatTableTextValue(values.footerValue)} />
                        </div>
                    </div>
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <TransactionDock actions={config.dockActions} />
                </div>
            </div>
        </div>
    );
}

function PaymentOrderFilterBar({ table, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) =>
                        setFilters((current) => ({
                            ...current,
                            [filter.id]: event.target.value,
                        }))
                    }
                    containerClassName="w-auto"
                    className="h-[34px] min-w-[110px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-[15px] text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {filter.options.map((option, index) => (
                        <option key={`${filter.id}-${option.label}-${index}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}

            <button
                type="button"
                className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}

function PaymentOrderTableView({ config, onCreate }) {
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

                return !selectedValue || selectedValue === 'all' ? true : row[filter.rowKey] === selectedValue;
            });

            if (!matchesFilters) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return config.table.columns.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.columns, config.table.filters, config.table.rows, filters, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={<PaymentOrderFilterBar table={config.table} filters={filters} setFilters={setFilters} />}
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <LinkIcon className="h-4.5 w-4.5" />,
                }}
                rightControls={
                    <>
                        <TransactionToolbarIconButton label={config.table.printLabel}>
                            <PrintIcon className="h-4 w-4" />
                        </TransactionToolbarIconButton>
                        <TransactionToolbarSplitButton
                            label={config.table.settingsLabel}
                            icon={<CogIcon className="h-4 w-4" />}
                            items={config.table.settingsItems}
                        />
                    </>
                }
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1280px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${
                                        column.align === 'right' ? 'text-right' : 'text-left'
                                    }`.trim()}
                                >
                                    <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-start'}`.trim()}>
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
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                >
                                    {config.table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-2.5 text-[15px] text-[#131a28]`.trim()}
                                        >
                                            <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell
                                    colSpan={config.table.columns.length}
                                    className="px-2.5 py-3 text-center text-[15px] text-[#131a28]"
                                >
                                    {config.table.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function PaymentOrderView({ page, mode, onOpenContent }) {
    const config = page.paymentOrder;

    return mode === 'table' ? (
        <PaymentOrderTableView config={config} onCreate={onOpenContent} />
    ) : (
        <PaymentOrderFormView config={config} />
    );
}
