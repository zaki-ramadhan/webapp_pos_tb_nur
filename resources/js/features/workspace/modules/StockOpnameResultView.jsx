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
import TableListView from '@/features/workspace/modules/TableListView';
import StockOpnameResultItemModal from '@/features/workspace/modules/shared/StockOpnameResultItemModal';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSectionRail,
    TransactionSwitch,
    TransactionToolbarIconButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    buildStockOpnameResultConfig,
    buildStockOpnameResultRecord,
} from '@/features/workspace/modules/stockOpnameResultConfig';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PrintIcon, SearchIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

function cloneItems(items = []) {
    return items.map((item) => ({ ...item }));
}

function buildFormValues(source = {}) {
    return {
        ...source,
        takeOptions: source.takeOptions?.length ? [...source.takeOptions] : [],
        resultItems: cloneItems(source.resultItems),
        itemModal: source.itemModal ? { ...source.itemModal } : null,
    };
}

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

function StockOpnameLookupField({
    value,
    placeholder,
    readOnly = false,
    highlighted = false,
    className = '',
    onChange = null,
}) {
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

function StockOpnameResultHeader({ config, values, setValues, isDetail }) {
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
                                trailing={isDetail ? <span className="text-[22px] font-semibold text-[#1f2436]">×</span> : null}
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

function StockOpnameResultItemsSection({ config, values, setValues, onOpenItem }) {
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

function StockOpnameResultInfoSection({ config, values, setValues, isDetail }) {
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

function StockOpnameResultFormView({ config, activeLevel2Tab }) {
    const isDetail = activeLevel2Tab?.tabType === 'detail';
    const recordId = activeLevel2Tab?.recordId;
    const baseRecord = useMemo(() => {
        if (!isDetail) {
            return buildFormValues(config.draft);
        }

        const sourceRow = (config.table.rows ?? []).find((row) => row.id === recordId) ?? { id: recordId };

        return buildFormValues(buildStockOpnameResultRecord(sourceRow, config));
    }, [config, isDetail, recordId]);
    const [values, setValues] = useState(() => buildFormValues(baseRecord));
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs[0]?.id ?? 'items');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        setValues(buildFormValues(baseRecord));
        setActiveSectionId(config.sectionTabs[0]?.id ?? 'items');
        setSelectedItem(null);
    }, [baseRecord, config.sectionTabs]);

    return (
        <div className="grid gap-4 xl:grid-cols-[36px_minmax(0,1fr)_112px] xl:items-start">
            <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

            <div className="grid gap-4">
                <StockOpnameResultHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />

                {activeSectionId === 'info' ? (
                    <StockOpnameResultInfoSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                    />
                ) : (
                    <StockOpnameResultItemsSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        onOpenItem={setSelectedItem}
                    />
                )}
            </div>

            <TransactionDock actions={values.dockActions ?? []} />

            <StockOpnameResultItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={values.itemModal}
                item={selectedItem}
            />
        </div>
    );
}

function StockOpnameResultTableView({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onCreate,
            }}
            rightControls={
                <TransactionToolbarIconButton label="Cetak daftar">
                    <PrintIcon className="h-4 w-4" />
                </TransactionToolbarIconButton>
            }
            menuButton={{
                label: config.table.settingsLabel,
                icon: <TableActionIcon className="h-4.5 w-4.5" />,
                items: [{ id: 'arrange-columns', label: config.table.settingsLabel }],
                widthClassName: 'w-[180px]',
            }}
            onRowClick={(row) =>
                onOpenDetail?.({
                    recordId: row.id,
                    label: row.number,
                    tabLabel: row.number,
                })
            }
        />
    );
}

export default function StockOpnameResultView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildStockOpnameResultConfig(page.stockOpnameResult), [page.stockOpnameResult]);

    if (mode === 'table') {
        return <StockOpnameResultTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <StockOpnameResultFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
}
