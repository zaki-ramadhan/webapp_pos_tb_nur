import { useEffect, useMemo, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
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
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import SectionTab from '@/features/workspace/shared/SectionTab';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { CogIcon, PlusIcon, PrintIcon, RefreshIcon, SaveIcon, SearchIcon, SortIcon, TrashIcon } from '@/features/workspace/shared/Icons';

function PaymentFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[360px_minmax(0,570px)] lg:items-start">
            <label className="pt-2 text-[17px] leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function UnitField({ value, onChange, unit }) {
    return (
        <div className="flex items-center gap-4">
            <TextInput
                value={value}
                onChange={onChange}
                className="h-[40px] w-[116px] rounded-[4px] border-[#cfd6e2]"
                inputClassName="text-right text-[15px] text-[#1f2436]"
            />
            <span className="text-[17px] text-[#1f2436]">{unit}</span>
        </div>
    );
}

function buildCreateValues(config) {
    return {
        discountDays: config.createDefaults?.discountDays ?? '',
        discountPercent: config.createDefaults?.discountPercent ?? '',
        dueDays: config.createDefaults?.dueDays ?? '',
        description: config.createDefaults?.description ?? '',
        isDefault: Boolean(config.createDefaults?.isDefault),
    };
}

function buildDetailValues(config, recordId) {
    const record = config.records.find((item) => item.id === recordId);

    return {
        name: record?.name ?? '',
        isDefault: Boolean(record?.isDefault),
        isInactive: Boolean(record?.isInactive),
    };
}

function PaymentTermsFormView({ page, activeLevel2Tab }) {
    const config = page.paymentTerms;
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetailMode = Boolean(recordId);
    const [createValues, setCreateValues] = useState(() => buildCreateValues(config));
    const [detailValues, setDetailValues] = useState(() => buildDetailValues(config, recordId));

    useEffect(() => {
        setCreateValues(buildCreateValues(config));
    }, [config]);

    useEffect(() => {
        setDetailValues(buildDetailValues(config, recordId));
    }, [config, recordId]);

    return (
        <div className="relative flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab label={config.sectionLabel} tone="accent" className="h-[34px]" />
            </div>

            <div className="flex min-h-[642px] flex-col gap-5 rounded-[4px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    {isDetailMode ? (
                        <div className="max-w-[1180px] space-y-3">
                            <PaymentFieldRow label={config.detailLabels.name}>
                                <ChipLookupField value={detailValues.name} />
                            </PaymentFieldRow>

                            <div className="lg:pl-[360px]">
                                <CheckboxField
                                    id="payment-term-default"
                                    label={config.detailLabels.default}
                                    checked={detailValues.isDefault}
                                    onChange={(event) =>
                                        setDetailValues((current) => ({
                                            ...current,
                                            isDefault: event.target.checked,
                                        }))
                                    }
                                    align="center"
                                    labelClassName="text-[17px]"
                                    inputClassName="mt-0 h-[18px] w-[18px]"
                                    containerClassName="w-auto"
                                />
                            </div>

                            <div className="lg:pl-[360px]">
                                <CheckboxField
                                    id="payment-term-inactive"
                                    label={config.detailLabels.inactive}
                                    checked={detailValues.isInactive}
                                    onChange={(event) =>
                                        setDetailValues((current) => ({
                                            ...current,
                                            isInactive: event.target.checked,
                                        }))
                                    }
                                    align="center"
                                    labelClassName="text-[17px]"
                                    inputClassName="mt-0 h-[18px] w-[18px]"
                                    containerClassName="w-auto"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-[1180px] space-y-3">
                            <PaymentFieldRow label={config.createLabels.discountDays}>
                                <UnitField
                                    value={createValues.discountDays}
                                    onChange={(event) =>
                                        setCreateValues((current) => ({
                                            ...current,
                                            discountDays: event.target.value,
                                        }))
                                    }
                                    unit="Hari"
                                />
                            </PaymentFieldRow>

                            <PaymentFieldRow label={config.createLabels.discountPercent}>
                                <UnitField
                                    value={createValues.discountPercent}
                                    onChange={(event) =>
                                        setCreateValues((current) => ({
                                            ...current,
                                            discountPercent: event.target.value,
                                        }))
                                    }
                                    unit="%"
                                />
                            </PaymentFieldRow>

                            <PaymentFieldRow label={config.createLabels.dueDays}>
                                <UnitField
                                    value={createValues.dueDays}
                                    onChange={(event) =>
                                        setCreateValues((current) => ({
                                            ...current,
                                            dueDays: event.target.value,
                                        }))
                                    }
                                    unit="Hari"
                                />
                            </PaymentFieldRow>

                            <PaymentFieldRow label={config.createLabels.description}>
                                <textarea
                                    value={createValues.description}
                                    onChange={(event) =>
                                        setCreateValues((current) => ({
                                            ...current,
                                            description: event.target.value,
                                        }))
                                    }
                                    rows={4}
                                    className="min-h-[72px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
                                />
                            </PaymentFieldRow>

                            <PaymentFieldRow label={config.createLabels.default}>
                                <CheckboxField
                                    id="payment-term-create-default"
                                    label={config.createLabels.yesLabel}
                                    checked={createValues.isDefault}
                                    onChange={(event) =>
                                        setCreateValues((current) => ({
                                            ...current,
                                            isDefault: event.target.checked,
                                        }))
                                    }
                                    align="center"
                                    labelClassName="text-[17px]"
                                    inputClassName="mt-0 h-[18px] w-[18px]"
                                    containerClassName="w-auto"
                                />
                            </PaymentFieldRow>
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

function PaymentTermsTableView({ page, onCreate, onOpenDetail }) {
    const table = page.paymentTerms.table;
    const [keyword, setKeyword] = useState('');
    const [inactiveFilter, setInactiveFilter] = useState(table.filterOptions?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (inactiveFilter !== 'all' && row.inactiveValue !== inactiveFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return table.columns.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [inactiveFilter, keyword, table.columns, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                filters={
                    <SelectField
                        value={inactiveFilter}
                        onChange={(event) => setInactiveFilter(event.target.value)}
                        containerClassName="w-auto shrink-0"
                        className="h-[34px] min-w-[130px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="px-3 text-[15px] text-[#394157]"
                    >
                        {table.filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                }
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                printButton={{
                    label: table.printLabel,
                    icon: <PrintIcon className="h-4 w-4" />,
                }}
                menuButton={{
                    label: table.actionsLabel,
                    icon: <CogIcon className="h-4 w-4" />,
                    items: table.menuItems,
                    widthClassName: 'w-[190px]',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
                className="space-y-3"
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1380px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${column.align === 'right' ? 'text-right' : 'text-left'}`.trim()}
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
                                        label: row.name,
                                        tabLabel: row.tabLabel ?? row.name,
                                    })
                                }
                            >
                                {table.columns.map((column) => (
                                    <DataTableCell
                                        key={column.id}
                                        className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-2.5 text-[15px] text-[#131a28]`.trim()}
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

export default function PaymentTermsView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    return mode === 'table' ? (
        <PaymentTermsTableView page={page} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <PaymentTermsFormView page={page} activeLevel2Tab={activeLevel2Tab} />
    );
}
