import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    buildStockTransferConfig,
    buildStockTransferRecord,
} from '@/features/workspace/modules/stockTransferConfig';
import StockTransferItemModal from '@/features/workspace/modules/shared/StockTransferItemModal';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    DownloadIcon,
    FunnelIcon,
    LinkIcon,
    PrintIcon,
    SearchIcon,
    SortIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneItems(items = []) {
    return items.map((item) => ({
        ...item,
        unitLookup: cloneList(item.unitLookup ?? item.unit),
        serialNumbers: [...(item.serialNumbers ?? [])],
    }));
}

function buildFormValues(source = {}) {
    return {
        ...source,
        warehouse: cloneList(source.warehouse),
        counterpartWarehouse: cloneList(source.counterpartWarehouse),
        branches: cloneList(source.branches),
        items: cloneItems(source.items),
        itemModal: source.itemModal
            ? {
                  ...source.itemModal,
                  tabs: (source.itemModal.tabs ?? []).map((tab) => ({ ...tab })),
              }
            : null,
    };
}

function StockTransferFieldRow({ label, required = false, children, labelClassName = '' }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className={labelClassName} />
            <div>{children}</div>
        </div>
    );
}

function StockTransferHeader({ config, values, setValues, isDetail }) {
    const counterpartLabel = values.counterpartWarehouseLabel ?? config.labels.counterpartWarehouse;

    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:items-start">
                <div className="space-y-3">
                    <div className={`grid gap-3 ${isDetail ? 'lg:grid-cols-[minmax(0,332px)_minmax(0,332px)]' : 'lg:grid-cols-[minmax(0,332px)]'}`.trim()}>
                        <StockTransferFieldRow label={config.labels.process}>
                            {isDetail ? (
                                <TextInput
                                    value={values.process}
                                    readOnly
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />
                            ) : (
                                <SelectField
                                    value={values.process}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            process: event.target.value,
                                            counterpartWarehouseLabel:
                                                event.target.value === 'Terima Barang' ? 'Gudang Pengirim' : 'Gudang Tujuan',
                                        }))
                                    }
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    selectClassName="text-[15px] text-[#1f2436]"
                                >
                                    {config.processOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </SelectField>
                            )}
                        </StockTransferFieldRow>

                        {isDetail ? (
                            <div className="lg:pt-0.5">
                                <TextInput
                                    value={values.referenceNumber}
                                    readOnly
                                    className="h-[40px] rounded-[4px] border-[#97d868] bg-[#f5ffef]"
                                    inputClassName="text-[15px] font-semibold text-[#6baa2d]"
                                />
                            </div>
                        ) : null}
                    </div>

                    <StockTransferFieldRow label={config.labels.warehouse} required>
                        <ChipLookupField
                            values={values.warehouse}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari gudang"
                            onRemove={(warehouseValue) =>
                                setValues((current) => ({
                                    ...current,
                                    warehouse: current.warehouse.filter((item) => item !== warehouseValue),
                                }))
                            }
                            className="max-w-[684px]"
                        />
                    </StockTransferFieldRow>

                    <StockTransferFieldRow label={counterpartLabel} required>
                        <ChipLookupField
                            values={values.counterpartWarehouse}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari gudang tujuan"
                            onRemove={(warehouseValue) =>
                                setValues((current) => ({
                                    ...current,
                                    counterpartWarehouse: current.counterpartWarehouse.filter((item) => item !== warehouseValue),
                                }))
                            }
                            className="max-w-[684px]"
                        />
                    </StockTransferFieldRow>
                </div>

                <div className="space-y-3">
                    {isDetail ? (
                        <StockTransferFieldRow label={config.labels.documentNumber} required labelClassName="sm:text-right">
                            <TextInput
                                value={values.documentNumber}
                                readOnly
                                trailing={<span className="text-[22px] font-semibold text-[#1f2436]">×</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </StockTransferFieldRow>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start gap-4 sm:justify-end">
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
                    )}

                    <StockTransferFieldRow label={config.labels.date} required labelClassName="sm:text-right">
                        <TransactionDateInput value={values.date} className="max-w-[234px]" />
                    </StockTransferFieldRow>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                        >
                            {config.takeButtonLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StockTransferDetailsSection({ config, values, setValues, isDetail, onOpenItem }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-[720px]">
                    <div className="min-w-0 flex-1">
                        <TextInput
                            value={values.itemSearch}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    itemSearch: event.target.value,
                                }))
                            }
                            placeholder={config.detailSearchPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-[34px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                    >
                        {config.takeButtonLabel}
                    </button>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <TransactionToolbarIconButton label={`Cari ${config.itemSectionTitle}`}>
                        <SearchIcon className="h-4.5 w-4.5" />
                    </TransactionToolbarIconButton>
                    <div className="text-right text-[22px] font-normal text-[#1f2436]">
                        {values.itemCountLabel ?? config.itemSectionTitle} <span className="text-[#ED3969]">*</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.itemTable.columns}
                    rows={values.items}
                    emptyLabel={config.itemTable.emptyLabel}
                    minWidthClassName="min-w-[980px]"
                    onRowClick={isDetail ? onOpenItem : null}
                    getRowClassName={() => (isDetail ? 'cursor-pointer hover:bg-[#eef3fb]' : '')}
                />
            </div>
        </div>
    );
}

function StockTransferInfoSection({ config, values, setValues, isDetail }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,560px)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.notes} />
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

                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,560px)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.branch} required />
                    <ChipLookupField
                        values={values.branches}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari cabang"
                        onRemove={(branchValue) =>
                            setValues((current) => ({
                                ...current,
                                branches: current.branches.filter((item) => item !== branchValue),
                            }))
                        }
                        heightClassName="h-[36px]"
                    />
                </div>

                {isDetail ? (
                    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,560px)] lg:items-start">
                        <TransactionFieldLabel label={config.labels.printedEmail} />
                        <TextInput
                            value={values.printedEmail}
                            readOnly
                            className="h-[36px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                            inputClassName="text-[15px] text-[#5f6980]"
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function StockTransferFormView({ config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildStockTransferRecord(
                      config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId },
                      config,
                  )
                : config.draft,
        [activeRecordId, config],
    );
    const [values, setValues] = useState(() => buildFormValues(sourceRecord));
    const [selectedItem, setSelectedItem] = useState(null);
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormValues(sourceRecord));
        setSelectedItem(null);
    }, [config.sectionTabs, sourceRecord]);

    return (
        <>
            <TransactionFormLayout
                header={<StockTransferHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={values.dockActions ?? []}
            >
                {activeSectionId === 'additional-info' ? (
                    <StockTransferInfoSection config={config} values={values} setValues={setValues} isDetail={isDetail} />
                ) : (
                    <StockTransferDetailsSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                        onOpenItem={setSelectedItem}
                    />
                )}
            </TransactionFormLayout>

            <StockTransferItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={values.itemModal}
                item={selectedItem}
            />
        </>
    );
}

function TableFilterField({ filter, value, onChange }) {
    return (
        <SelectField
            value={value}
            onChange={(event) => onChange(filter.id, event.target.value)}
            className="h-[40px] min-w-[118px] rounded-[4px] border-[#cfd6e2]"
            selectClassName="text-[15px] text-[#1f2436]"
            containerClassName="w-auto"
        >
            {(filter.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                    {filter.label}: {option.label}
                </option>
            ))}
        </SelectField>
    );
}

function StockTransferTableView({ config, onCreate, onOpenDetail }) {
    const [filters, setFilters] = useState(() =>
        (config.table.filters ?? []).reduce(
            (result, filter) => ({
                ...result,
                [filter.id]: filter.value ?? 'all',
            }),
            {},
        ),
    );
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        setFilters(
            (config.table.filters ?? []).reduce(
                (result, filter) => ({
                    ...result,
                    [filter.id]: filter.value ?? 'all',
                }),
                {},
            ),
        );
        setSearchValue('');
    }, [config.table.filters]);

    const rows = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();

        return (config.table.rows ?? []).filter((row) => {
            if (filters.date !== 'all' && row.dateFilter !== filters.date) {
                return false;
            }

            if (filters.route !== 'all' && row.routeFilter !== filters.route) {
                return false;
            }

            if (filters.shipmentStatus !== 'all' && row.statusFilter !== filters.shipmentStatus) {
                return false;
            }

            if (filters.warehouse !== 'all' && row.warehouseFilter !== filters.warehouse) {
                return false;
            }

            if (filters.process !== 'all' && row.processFilter !== filters.process) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [
                row.number,
                row.date,
                row.process,
                row.routeWarehouse,
                row.warehouse,
                row.notes,
                row.shipmentStatus,
            ]
                .join(' ')
                .toLowerCase()
                .includes(keyword);
        });
    }, [config.table.rows, filters, searchValue]);

    return (
        <div className="flex min-h-full flex-col gap-3 rounded-[6px] border border-[#cfd6e2] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:px-4">
            <TableToolbar
                filters={
                    <>
                        {(config.table.filters ?? []).map((filter) => (
                            <TableFilterField
                                key={filter.id}
                                filter={filter}
                                value={filters[filter.id] ?? filter.value ?? 'all'}
                                onChange={(filterId, nextValue) =>
                                    setFilters((current) => ({
                                        ...current,
                                        [filterId]: nextValue,
                                    }))
                                }
                            />
                        ))}
                        <TransactionToolbarSplitButton
                            label="Filter lanjutan"
                            icon={<FunnelIcon className="h-4.5 w-4.5" />}
                            items={[{ id: 'reset-filter', label: 'Reset filter' }]}
                        />
                    </>
                }
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    onClick: () => setSearchValue(''),
                    icon: <LinkIcon className="h-4.5 w-4.5" />,
                }}
                rightControls={
                    <>
                        <TransactionToolbarSplitButton
                            label="Buka pemindahan terkait"
                            icon={<LinkIcon className="h-4.5 w-4.5" />}
                            items={config.table.transferItems}
                        />
                        <TransactionToolbarIconButton label="Cetak daftar">
                            <PrintIcon className="h-4.5 w-4.5" />
                        </TransactionToolbarIconButton>
                        <TransactionToolbarSplitButton
                            label="Atur tampilan tabel"
                            icon={<TableActionIcon className="h-4.5 w-4.5" />}
                            items={config.table.settingsItems}
                        />
                    </>
                }
                search={{
                    value: searchValue,
                    onChange: (event) => setSearchValue(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                }}
                pageValue={config.table.pageValue}
            />

            <div className="min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={rows}
                    emptyLabel="Belum ada data"
                    minWidthClassName="min-w-[1320px]"
                    onRowClick={(row) =>
                        onOpenDetail({
                            recordId: row.id,
                            label: row.number,
                            tabLabel: row.number,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) => (
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
                    )}
                />
            </div>
        </div>
    );
}

export default function StockTransferView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildStockTransferConfig(page.stockTransfer), [page.stockTransfer]);

    if (mode === 'table') {
        return <StockTransferTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <StockTransferFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
}
