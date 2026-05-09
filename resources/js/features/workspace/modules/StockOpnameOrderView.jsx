import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    buildStockOpnameOrderConfig,
    buildStockOpnameOrderRecord,
} from '@/features/workspace/modules/stockOpnameOrderConfig';
import StockOpnameOrderItemModal from '@/features/workspace/modules/shared/StockOpnameOrderItemModal';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionRail,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    FunnelIcon,
    LinkIcon,
    PrintIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneItems(items = []) {
    return items.map((item) => ({ ...item }));
}

function cloneRows(rows = []) {
    return rows.map((row) => ({ ...row }));
}

function buildFormValues(source = {}) {
    return {
        ...source,
        branches: cloneList(source.branches),
        department: cloneList(source.department),
        workers: cloneList(source.workers),
        warehouse: cloneList(source.warehouse),
        category: cloneList(source.category),
        supplier: cloneList(source.supplier),
        brand: cloneList(source.brand),
        resultItems: cloneItems(source.resultItems),
        processSummaryRows: cloneRows(source.processSummaryRows),
        processHistoryRows: cloneRows(source.processHistoryRows),
    };
}

function TableFilterField({ filter, value, onChange }) {
    return (
        <SelectField
            value={value}
            onChange={(event) => onChange(filter.id, event.target.value)}
            containerClassName="w-auto"
            className="h-[40px] min-w-[118px] rounded-[4px] border-[#cfd6e2]"
            selectClassName="text-[15px] text-[#1f2436]"
        >
            {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                    {filter.label}: {option.label}
                </option>
            ))}
        </SelectField>
    );
}

function StockOpnameOrderTableView({ config, onCreate, onOpenDetail }) {
    const [searchValue, setSearchValue] = useState('');
    const [filters, setFilters] = useState(() =>
        (config.table.filters ?? []).reduce(
            (result, filter) => ({
                ...result,
                [filter.id]: filter.value ?? 'all',
            }),
            {},
        ),
    );

    const rows = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();

        return (config.table.rows ?? []).filter((row) => {
            if (filters.date !== 'all' && row.dateFilter !== filters.date) {
                return false;
            }

            if (filters.status !== 'all' && row.statusFilter !== filters.status) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return config.table.columns.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(keyword),
            );
        });
    }, [config.table.columns, config.table.rows, filters, searchValue]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={
                    <div className="flex flex-wrap items-center gap-2">
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
                        <button
                            type="button"
                            className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                            aria-label="Filter lanjutan"
                        >
                            <FunnelIcon className="h-4.5 w-4.5" />
                        </button>
                    </div>
                }
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <LinkIcon className="h-4.5 w-4.5" />,
                }}
                rightControls={
                    <>
                        <TransactionToolbarIconButton label="Cetak daftar">
                            <PrintIcon className="h-4.5 w-4.5" />
                        </TransactionToolbarIconButton>
                        <TransactionToolbarSplitButton
                            label="Pengaturan tabel"
                            items={config.table.settingsItems}
                        />
                    </>
                }
                search={{
                    value: searchValue,
                    onChange: (event) => setSearchValue(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={rows}
                    emptyLabel="Belum ada data"
                    minWidthClassName="min-w-[1460px]"
                    onRowClick={(row) => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
                    getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) => (
                        <span className="flex items-center gap-2">
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                    renderCell={({ row, column }) => <span className="block truncate">{formatTableTextValue(row[column.id])}</span>}
                />
            </div>
        </div>
    );
}

function SectionCard({ children, className = '' }) {
    return (
        <div className={`rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:px-4 ${className}`.trim()}>
            {children}
        </div>
    );
}

function StockOpnameOrderHeader({ config, values, isDetail }) {
    return (
        <SectionCard>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] xl:items-start">
                <div className="grid gap-4 sm:max-w-[420px]">
                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.date} />
                        <TransactionDateInput value={values.date} className="w-full max-w-[296px]" />
                    </div>

                    {isDetail ? (
                        <div className="grid gap-2">
                            <TransactionFieldLabel label={config.labels.status} />
                            <TextInput
                                value={values.status}
                                readOnly
                                className="h-[40px] max-w-[420px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#4b5565]"
                            />
                        </div>
                    ) : null}
                </div>

                <div className="grid gap-2 xl:justify-self-end xl:min-w-[420px]">
                    <div className="flex flex-wrap items-center justify-start gap-3 xl:justify-end">
                        <TransactionFieldLabel label={config.labels.number} required />
                        <TransactionSwitch checked={values.autoNumber} onChange={() => {}} />
                        {values.autoNumber && !isDetail ? (
                            <SelectField
                                value={values.numberingType}
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

function StockOpnameOrderInfoSection({ config, values, isDetail }) {
    return (
        <SectionCard className="min-h-[620px]">
            <h3 className="border-b border-[#d8dde7] pb-4 text-[23px] font-normal text-[#111827]">{config.infoSectionTitle}</h3>

            <div className="mt-5 grid gap-5 xl:grid-cols-2 xl:gap-x-9">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.branch} required={!isDetail} />
                        <ChipLookupField values={values.branches} placeholder="Cari/Pilih..." searchLabel="Cari cabang" />
                    </div>

                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.department} />
                        <ChipLookupField values={values.department} placeholder="Cari/Pilih..." searchLabel="Cari departemen" />
                    </div>

                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.startDate} required />
                        <TransactionDateInput value={values.startDate} className="w-full max-w-[348px]" />
                    </div>

                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.responsiblePerson} required />
                        <TextInput
                            value={values.responsiblePerson}
                            readOnly
                            trailing={isDetail ? <span className="text-[22px] font-semibold text-[#1f2436]">×</span> : null}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                            trailingClassName="px-3"
                        />
                    </div>

                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.workers} required />
                        <ChipLookupField values={values.workers} placeholder="Cari/Pilih..." searchLabel="Cari petugas" />
                    </div>

                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.notes} />
                        <TextareaField
                            value={values.notes}
                            readOnly
                            rows={5}
                            className="rounded-[4px] border-[#cfd6e2]"
                            textareaClassName="min-h-[100px] text-[15px] text-[#1f2436]"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.warehouse} required />
                        <ChipLookupField values={values.warehouse} placeholder="Cari/Pilih..." searchLabel="Cari gudang" />
                    </div>

                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.category} />
                        <ChipLookupField values={values.category} placeholder="Cari/Pilih..." searchLabel="Cari kategori barang" />
                    </div>

                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.supplier} />
                        <ChipLookupField values={values.supplier} placeholder="Cari/Pilih..." searchLabel="Cari pemasok barang" />
                    </div>

                    <div className="grid gap-2">
                        <TransactionFieldLabel label={config.labels.brand} />
                        <ChipLookupField values={values.brand} placeholder="Cari/Pilih..." searchLabel="Cari merek barang" />
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}

function StockOpnameOrderResultsSection({ config, values, onOpenItem }) {
    const [searchValue, setSearchValue] = useState(values.resultSearch ?? '');
    const [filterValue, setFilterValue] = useState(values.resultFilter ?? 'all');

    useEffect(() => {
        setSearchValue(values.resultSearch ?? '');
        setFilterValue(values.resultFilter ?? 'all');
    }, [values.resultFilter, values.resultSearch]);

    const rows = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();

        return values.resultItems.filter((item) => {
            if (filterValue !== 'all') {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [item.name, item.code, item.systemQuantity, item.countedQuantity, item.unit]
                .join(' ')
                .toLowerCase()
                .includes(keyword);
        });
    }, [filterValue, searchValue, values.resultItems]);

    return (
        <SectionCard className="min-h-[620px]">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                        aria-label="Tautkan hasil stok opname"
                    >
                        <LinkIcon className="h-4.5 w-4.5" />
                    </button>
                    <div className="text-[24px] font-normal text-[#1f2436]">{values.resultCountLabel}</div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <TextInput
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder={config.resultSearchPlaceholder}
                        className="h-[40px] w-full rounded-[4px] border-[#cfd6e2] sm:w-[410px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                    <SelectField
                        value={filterValue}
                        onChange={(event) => setFilterValue(event.target.value)}
                        containerClassName="w-full sm:w-[410px]"
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {config.resultFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                </div>
            </div>

            <div className="mt-4 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={config.resultTable.columns}
                    rows={rows}
                    emptyLabel={config.resultTable.emptyLabel}
                    minWidthClassName="min-w-[1120px]"
                    onRowClick={onOpenItem}
                    getRowClassName={() => 'cursor-pointer hover:bg-[#eef3fb]'}
                />
            </div>
        </SectionCard>
    );
}

function ProcessSummaryCard({ rows }) {
    return (
        <div className="rounded-[6px] border border-[#d6dce8] bg-white">
            {rows.map((row) => (
                <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e4e8ef] px-4 py-3 last:border-b-0">
                    <div className="text-[17px] text-[#1f2436]">{row.label}</div>
                    <div className={`text-right text-[17px] ${row.tone === 'link' ? 'font-semibold text-[#28b565]' : 'text-[#1f2436]'}`.trim()}>
                        {row.value}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ProcessHistoryCard({ rows }) {
    return (
        <div className="space-y-3">
            {rows.map((row) => (
                <div key={row.id} className="rounded-[6px] border border-[#d6dce8] bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-[18px] font-medium text-[#1564d7]">{row.number}</div>
                            <div className="mt-1 text-[14px] text-[#3d4659]">{row.date}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[18px] font-medium text-[#1f2436]">{row.itemCount}</div>
                            <div className="mt-1 text-[14px] text-[#3d4659]">{row.worker}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function StockOpnameOrderProcessSection({ values }) {
    return (
        <SectionCard className="min-h-[620px]">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] xl:gap-x-9">
                <div>
                    <h3 className="text-[24px] font-normal text-[#111827]">Informasi Proses Stok Opname</h3>
                    <div className="mt-4">
                        <ProcessSummaryCard rows={values.processSummaryRows} />
                    </div>
                </div>

                <div>
                    <h3 className="text-[24px] font-normal text-[#111827]">Riwayat Hasil Stok Opname</h3>
                    <div className="mt-4">
                        <ProcessHistoryCard rows={values.processHistoryRows} />
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}

function StockOpnameOrderFormView({ config, activeLevel2Tab }) {
    const isDetail = activeLevel2Tab?.tabType === 'detail';
    const recordId = activeLevel2Tab?.recordId;
    const baseRecord = useMemo(() => {
        if (!isDetail) {
            return buildFormValues(config.draft);
        }

        const sourceRow = (config.table.rows ?? []).find((row) => row.id === recordId) ?? { id: recordId };

        return buildFormValues(buildStockOpnameOrderRecord(sourceRow, config));
    }, [config, isDetail, recordId]);
    const [values, setValues] = useState(() => buildFormValues(baseRecord));
    const [activeSectionId, setActiveSectionId] = useState(isDetail ? config.detailSectionTabs[0]?.id ?? 'info' : config.createSectionTabs[0]?.id ?? 'info');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        setValues(buildFormValues(baseRecord));
        setActiveSectionId(isDetail ? config.detailSectionTabs[0]?.id ?? 'info' : config.createSectionTabs[0]?.id ?? 'info');
        setSelectedItem(null);
    }, [baseRecord, config.createSectionTabs, config.detailSectionTabs, isDetail]);

    const sectionTabs = isDetail ? config.detailSectionTabs : config.createSectionTabs;

    return (
        <div className="grid gap-4 xl:grid-cols-[36px_minmax(0,1fr)_112px] xl:items-start">
            <TransactionSectionRail tabs={sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

            <div className="grid gap-4">
                <StockOpnameOrderHeader config={config} values={values} isDetail={isDetail} />

                {activeSectionId === 'results' ? (
                    <StockOpnameOrderResultsSection config={config} values={values} onOpenItem={setSelectedItem} />
                ) : activeSectionId === 'process' ? (
                    <StockOpnameOrderProcessSection values={values} />
                ) : (
                    <StockOpnameOrderInfoSection config={config} values={values} isDetail={isDetail} />
                )}
            </div>

            <TransactionDock actions={values.dockActions ?? []} />

            <StockOpnameOrderItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={values.itemModal}
                item={selectedItem}
            />
        </div>
    );
}

export default function StockOpnameOrderView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildStockOpnameOrderConfig(page.stockOpnameOrder), [page.stockOpnameOrder]);

    if (mode === 'table') {
        return <StockOpnameOrderTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <StockOpnameOrderFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
}
