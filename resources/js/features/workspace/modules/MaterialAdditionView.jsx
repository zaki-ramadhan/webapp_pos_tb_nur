import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    buildMaterialAdditionConfig,
    buildMaterialAdditionRecord,
} from '@/features/workspace/modules/materialAdditionConfig';
import WorkOrderItemModal from '@/features/workspace/modules/shared/WorkOrderItemModal';
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
    ChevronDownIcon,
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
        warehouse: cloneList(item.warehouse),
        department: cloneList(item.department),
        serialNumbers: [...(item.serialNumbers ?? [])],
    }));
}

function cloneAdditionalCosts(rows = []) {
    return rows.map((row) => ({ ...row }));
}

function buildFormValues(source = {}) {
    return {
        ...source,
        branches: cloneList(source.branches),
        items: cloneItems(source.items),
        additionalCosts: cloneAdditionalCosts(source.additionalCosts),
        itemModal: source.itemModal
            ? {
                  ...source.itemModal,
                  tabs: (source.itemModal.tabs ?? []).map((tab) => ({ ...tab })),
              }
            : null,
    };
}

function TableFilterField({ filter, value, onChange }) {
    return (
        <SelectField
            value={value}
            onChange={(event) => onChange(filter.id, event.target.value)}
            className="h-[40px] min-w-[110px] rounded-[4px] border-[#cfd6e2]"
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

function MaterialAdditionTableView({ config, onCreate, onOpenDetail }) {
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

            if (filters.type !== 'all' && row.typeFilter !== filters.type) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [row.number, row.date, row.type, row.workOrderNumber, row.notes]
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
                        <TransactionToolbarIconButton label="Cetak daftar">
                            <PrintIcon className="h-4.5 w-4.5" />
                        </TransactionToolbarIconButton>
                        <TransactionToolbarSplitButton
                            label="Pengaturan tabel"
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
                    minWidthClassName="min-w-[1280px]"
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

function MaterialAdditionHeader({ config, values, setValues, isDetail }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:items-start">
                <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.date} required />
                        <TransactionDateInput value={values.date} className="max-w-[330px]" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.type} />
                        <SelectField
                            value={values.type}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    type: event.target.value,
                                }))
                            }
                            className="h-[40px] max-w-[330px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.typeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.workOrderNumber} required />
                        <TextInput
                            value={values.workOrderNumber}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    workOrderNumber: event.target.value,
                                }))
                            }
                            placeholder={config.workOrderPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] max-w-[506px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {isDetail ? (
                        <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                            <TextInput
                                value={values.numberingType}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
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

                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            className="inline-flex h-[38px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                        >
                            {config.favoriteButtonLabel}
                        </button>
                        <button
                            type="button"
                            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                        >
                            <span>{config.processButtonLabel}</span>
                            <ChevronDownIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MaterialAdditionSectionHeader({ searchValue, onSearchChange, placeholder, title }) {
    return (
        <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-[720px]">
                <div className="min-w-0 flex-1">
                    <TextInput
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder={placeholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
                <TransactionToolbarIconButton label={`Cari ${title}`}>
                    <SearchIcon className="h-4.5 w-4.5" />
                </TransactionToolbarIconButton>
                <div className="text-right text-[22px] font-normal text-[#1f2436]">
                    {title} <span className="text-[#ED3969]">*</span>
                </div>
            </div>
        </div>
    );
}

function MaterialAdditionSectionTable({ columns, rows, emptyLabel, onRowClick, clickable = false }) {
    return (
        <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
            <TransactionDataTable
                columns={columns}
                rows={rows}
                emptyLabel={emptyLabel}
                minWidthClassName="min-w-[980px]"
                onRowClick={clickable ? onRowClick : null}
                getRowClassName={() => (clickable ? 'cursor-pointer hover:bg-[#eef3fb]' : '')}
                renderCell={({ row, column }) => <span className="block truncate">{formatTableTextValue(row[column.id])}</span>}
            />
        </div>
    );
}

function MaterialAdditionItemsSection({ config, values, setValues, isDetail, onOpenItem }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <MaterialAdditionSectionHeader
                searchValue={values.itemSearch}
                onSearchChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        itemSearch: event.target.value,
                    }))
                }
                placeholder={config.itemSearchPlaceholder}
                title={values.itemCountLabel ?? config.itemSectionTitle}
            />

            <MaterialAdditionSectionTable
                columns={config.itemTable.columns}
                rows={values.items}
                emptyLabel={config.itemTable.emptyLabel}
                onRowClick={onOpenItem}
                clickable={isDetail}
            />
        </div>
    );
}

function MaterialAdditionChargesSection({ config, values, setValues }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <MaterialAdditionSectionHeader
                searchValue={values.chargeSearch}
                onSearchChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        chargeSearch: event.target.value,
                    }))
                }
                placeholder={config.chargeSearchPlaceholder}
                title={config.chargeSectionTitle}
            />

            <MaterialAdditionSectionTable
                columns={config.chargeTable.columns}
                rows={values.additionalCosts}
                emptyLabel={config.chargeTable.emptyLabel}
            />
        </div>
    );
}

function MaterialAdditionAdditionalInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
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

                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
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
            </div>
        </div>
    );
}

function MaterialAdditionFormView({ config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildMaterialAdditionRecord(
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
                header={<MaterialAdditionHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={values.dockActions ?? []}
            >
                {activeSectionId === 'charges' ? (
                    <MaterialAdditionChargesSection config={config} values={values} setValues={setValues} />
                ) : activeSectionId === 'additional-info' ? (
                    <MaterialAdditionAdditionalInfoSection config={config} values={values} setValues={setValues} />
                ) : (
                    <MaterialAdditionItemsSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                        onOpenItem={setSelectedItem}
                    />
                )}
            </TransactionFormLayout>

            <WorkOrderItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={values.itemModal}
                item={selectedItem}
            />
        </>
    );
}

export default function MaterialAdditionView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildMaterialAdditionConfig(page.materialAddition), [page.materialAddition]);

    if (mode === 'table') {
        return <MaterialAdditionTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <MaterialAdditionFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
}
