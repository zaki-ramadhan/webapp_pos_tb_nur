import { useMemo } from 'react';

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
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { SearchIcon } from '@/features/workspace/shared/Icons';

function resolveAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}

function SectionCard({ children, className = '' }) {
    return (
        <div className={`rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:px-4 ${className}`.trim()}>
            {children}
        </div>
    );
}

function StockOpnameLookupField({ value, placeholder, readOnly = false, highlighted = false, className = '', onChange = null }) {
    return (
        <TextInput
            value={value}
            readOnly={readOnly}
            onChange={onChange}
            placeholder={placeholder}
            trailing={readOnly ? null : <SearchIcon className="h-5 w-5 text-[#1f2436]" />}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${highlighted ? 'border-[#97d868] bg-[#f5ffef]' : ''} ${className}`.trim()}
            inputClassName={`text-[15px] ${highlighted ? 'font-semibold text-[#6baa2d]' : 'text-[#1f2436]'}`.trim()}
            trailingClassName="px-3"
        />
    );
}

export function StockOpnameResultHeader({ config, values, setValues, isDetail }) {
    return (
        <SectionCard>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] xl:items-start">
                <div className="grid gap-4 sm:max-w-[620px]">
                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.date} required />
                        <TransactionDateInput value={values.date} className="w-full max-w-[332px]" />
                    </div>

                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.opnameOrder} required />
                        <StockOpnameLookupField
                            value={values.opnameOrder}
                            placeholder={config.orderPlaceholder}
                            readOnly={isDetail}
                            highlighted={isDetail}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    opnameOrder: event.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="grid gap-2 xl:justify-self-end xl:min-w-[420px]">
                    <div className="flex flex-wrap items-center justify-start gap-3 xl:justify-end">
                        <TransactionFieldLabel label={config.labels.number} required />
                        {!isDetail ? (
                            <TransactionSwitch
                                checked={values.autoNumber}
                                onChange={(nextValue) =>
                                    setValues((current) => ({
                                        ...current,
                                        autoNumber: nextValue,
                                    }))
                                }
                            />
                        ) : null}

                        {values.autoNumber && !isDetail ? (
                            <SelectField
                                value={values.numberingType}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        numberingType: event.target.value,
                                    }))
                                }
                                containerClassName="w-full xl:w-[350px]"
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#1f2436]"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        ) : (
                            <TextInput
                                value={values.number}
                                readOnly
                                trailing={isDetail ? <span className="text-[22px] font-semibold text-[#1f2436]">x</span> : null}
                                className="h-[40px] w-full rounded-[4px] border-[#cfd6e2] xl:w-[420px]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        )}
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}

export function StockOpnameResultItemsSection({ config, values, setValues, onOpenItem }) {
    const rows = useMemo(() => {
        const keyword = values.itemSearch.trim().toLowerCase();

        if (!keyword) {
            return values.resultItems;
        }

        return values.resultItems.filter((item) =>
            [item.code, item.name, item.quantity, item.unit]
                .join(' ')
                .toLowerCase()
                .includes(keyword),
        );
    }, [values.itemSearch, values.resultItems]);

    return (
        <SectionCard className="min-h-[620px]">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <TextInput
                        value={values.itemSearch}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                itemSearch: event.target.value,
                            }))
                        }
                        placeholder={config.itemSearchPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] lg:max-w-[560px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />

                    <SelectField
                        value={values.takeAction}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                takeAction: event.target.value,
                            }))
                        }
                        containerClassName="w-auto shrink-0"
                        className="h-[36px] min-w-[84px] rounded-[4px] border-[#7aa2d5]"
                        selectClassName="px-3 text-[15px] text-[#21539b]"
                        iconClassName="mr-2 text-[#21539b]"
                    >
                        {(values.takeOptions?.length ? values.takeOptions : config.takeOptions).map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </div>

                <div className="flex items-center gap-3 self-end lg:self-auto">
                    <TransactionToolbarIconButton label={`Cari ${config.labels.itemDetails}`}>
                        <SearchIcon className="h-5 w-5 text-[#1f2436]" />
                    </TransactionToolbarIconButton>
                    <div className="text-right text-[22px] font-normal text-[#1f2436]">
                        {values.resultCountLabel} <span className="text-[#ED3969]">*</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[860px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.itemTable.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${resolveAlignClassName(column.align)}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {rows.length ? (
                            rows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} hover:bg-[#eef3fb]`.trim()}
                                    onClick={() => onOpenItem(row)}
                                >
                                    {config.itemTable.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-3 text-[15px] text-[#131a28] ${resolveAlignClassName(column.align)}`.trim()}
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={config.itemTable.columns.length} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    {config.itemTable.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </SectionCard>
    );
}

export function StockOpnameResultInfoSection({ config, values, setValues, isDetail }) {
    return (
        <SectionCard className="min-h-[620px]">
            <TransactionSectionHeading title={config.infoSectionTitle} icon="info" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[180px_minmax(0,560px)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.notes} />
                <TextareaField
                    value={values.notes}
                    readOnly={isDetail}
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
        </SectionCard>
    );
}
