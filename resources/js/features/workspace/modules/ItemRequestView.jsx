import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { buildItemRequestConfig, buildItemRequestRecord } from '@/features/workspace/modules/itemRequestConfig';
import ItemRequestItemModal from '@/features/workspace/modules/shared/ItemRequestItemModal';
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

function cloneItems(items) {
    return (items ?? []).map((item) => ({
        ...item,
        unit: cloneList(item.unit),
        department: cloneList(item.department),
    }));
}

function buildFormValues(source = {}) {
    return {
        ...source,
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

function FormFieldRow({ label, required = false, children, labelClassName = '' }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className={labelClassName} />
            <div>{children}</div>
        </div>
    );
}

function ItemRequestHeaderActions({ config }) {
    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <button
                type="button"
                className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
            >
                {config.takeButtonLabel}
            </button>
        </div>
    );
}

function ItemRequestFormHeader({ config, values, setValues, isDetail }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:items-start">
                <div className="space-y-3">
                    <FormFieldRow label={config.labels.requestDate} required>
                        <TransactionDateInput value={values.requestDate} className="max-w-[280px]" />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.requestType}>
                        <SelectField
                            value={values.requestType}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    requestType: event.target.value,
                                }))
                            }
                            className="h-[40px] max-w-[280px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.requestTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </FormFieldRow>
                </div>

                <div className="space-y-3">
                    {isDetail ? (
                        <FormFieldRow label={config.labels.documentNumber} required labelClassName="sm:text-right">
                            <TextInput
                                value={values.documentNumber}
                                readOnly
                                trailing={<span className="text-[22px] font-semibold text-[#1f2436]">×</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </FormFieldRow>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
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

                    <div className="flex justify-end">
                        <ItemRequestHeaderActions config={config} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ItemRequestDetailsSection({ config, values, setValues, isDetail, onOpenItem }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[640px]">
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

                <div className="flex items-center gap-2">
                    <TransactionToolbarIconButton label="Buka rincian barang">
                        <LinkIcon className="h-4.5 w-4.5" />
                    </TransactionToolbarIconButton>

                    {isDetail ? (
                        <TransactionToolbarSplitButton
                            label="Opsi rincian barang"
                            icon={<TableActionIcon className="h-4.5 w-4.5" />}
                            items={config.itemTable.copyItems}
                        />
                    ) : null}
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <div className="flex items-center justify-end gap-3 pb-3">
                    <TransactionToolbarIconButton label={`Cari ${config.itemSectionTitle}`}>
                        <SearchIcon className="h-4.5 w-4.5" />
                    </TransactionToolbarIconButton>

                    <button type="button" className="text-right text-[22px] font-normal text-[#1f2436]">
                        {values.itemCountLabel ?? config.itemSectionTitle} <span className="text-[#ED3969]">*</span>
                    </button>
                </div>

                <TransactionDataTable
                    columns={config.itemTable.columns}
                    rows={values.items}
                    emptyLabel={config.itemTable.emptyLabel}
                    minWidthClassName="min-w-[940px]"
                    emptyLeadingCellContent={
                        <span className="inline-flex items-center justify-center">
                            <TableActionIcon className="h-4 w-4" />
                        </span>
                    }
                    onRowClick={onOpenItem}
                    getRowClassName={() => 'cursor-pointer hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) =>
                        column.kind === 'spacer' ? (
                            <span className="flex justify-center text-white/55">
                                <TableActionIcon className="h-4 w-4" />
                            </span>
                        ) : (
                            column.label
                        )
                    }
                    renderCell={({ row, column }) =>
                        column.kind === 'spacer' ? (
                            <span className="inline-flex items-center justify-center text-[#a8afbe]">
                                <TableActionIcon className="h-4 w-4" />
                            </span>
                        ) : (
                            formatTableTextValue(row[column.id])
                        )
                    }
                />
            </div>
        </div>
    );
}

function ItemRequestAdditionalInfoSection({ config, values, setValues, isDetail }) {
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

                {isDetail ? (
                    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                        <TransactionFieldLabel label={config.labels.closeRequest} />
                        <label className="inline-flex items-center gap-3 text-[17px] text-[#1f2436]">
                            <input
                                type="checkbox"
                                checked={values.closeRequest}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        closeRequest: event.target.checked,
                                    }))
                                }
                                className="h-[20px] w-[20px] rounded border border-[#cfd6e2]"
                            />
                            <span>Ya (Tidak dapat diproses lagi)</span>
                        </label>
                    </div>
                ) : null}

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
                    />
                </div>
            </div>
        </div>
    );
}

function ItemRequestFormView({ config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildItemRequestRecord(
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
                header={<ItemRequestFormHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={values.dockActions ?? []}
            >
                {activeSectionId === 'additional-info' ? (
                    <ItemRequestAdditionalInfoSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                    />
                ) : (
                    <ItemRequestDetailsSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                        onOpenItem={setSelectedItem}
                    />
                )}
            </TransactionFormLayout>

            <ItemRequestItemModal
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

function ItemRequestTableView({ config, onCreate, onOpenDetail }) {
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
            if (filters.date && filters.date !== 'all' && row.dateFilter !== filters.date) {
                return false;
            }

            if (filters.status && filters.status !== 'all' && row.statusFilter !== filters.status) {
                return false;
            }

            if (filters.printed && filters.printed !== 'all' && row.printedFilter !== filters.printed) {
                return false;
            }

            if (filters.type && filters.type !== 'all' && row.typeFilter !== filters.type) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [
                row.number,
                row.date,
                row.requestType,
                row.notes,
                row.status,
                row.estimatedTotal,
            ]
                .join(' ')
                .toLowerCase()
                .includes(keyword);
        });
    }, [config.table.rows, filters, searchValue]);

    const handleChangeFilter = (filterId, nextValue) => {
        setFilters((current) => ({
            ...current,
            [filterId]: nextValue,
        }));
    };

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
                                onChange={handleChangeFilter}
                            />
                        ))}
                        <TransactionToolbarSplitButton
                            label="Filter lanjutan"
                            icon={<FunnelIcon className="h-4.5 w-4.5" />}
                            items={[
                                { id: 'reset-filter', label: 'Reset filter' },
                                { id: 'save-filter', label: 'Simpan filter' },
                            ]}
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
                            label="Unduh daftar"
                            icon={<DownloadIcon className="h-4.5 w-4.5" />}
                            items={config.table.downloadItems}
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
                    minWidthClassName="min-w-[1060px]"
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

export default function ItemRequestView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildItemRequestConfig(page.itemRequest), [page.itemRequest]);

    if (mode === 'table') {
        return <ItemRequestTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return <ItemRequestFormView config={config} activeLevel2Tab={activeLevel2Tab} />;
}
