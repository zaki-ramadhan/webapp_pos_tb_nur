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
import {
    buildWorkCompletionConfig,
    buildWorkCompletionRecord,
} from './inventoryFulfillmentConfig';
import {
    ReadonlyDocumentTextarea,
    SearchableTableSection,
} from '@/features/workspace/modules/shared/SalesDocumentSections';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSectionRail,
    TransactionSwitch,
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
} from '@/features/workspace/shared/Icons';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';

function buildFormState(source = {}) {
    return {
        ...source,
        items: [...(source.items ?? [])],
        branches: [...(source.branches ?? [])],
        dockActions: [...(source.dockActions ?? [])],
    };
}

function WorkCompletionFilterBar({ config, filters, setFilters }) {
    return (
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
                    containerClassName="w-auto"
                    className="h-[34px] min-w-[118px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-[15px] text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {filter.options.map((option, optionIndex) => (
                        <option key={`${filter.id}-${option.label}-${optionIndex}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}

            <button
                type="button"
                className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={config.table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
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

function WorkCompletionTableView({ config, onCreate, onOpenDetail }) {
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
                filters={<WorkCompletionFilterBar config={config} filters={filters} setFilters={setFilters} />}
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
                        <TransactionToolbarSplitButton
                            label="Unduh"
                            icon={<DownloadIcon className="h-4 w-4" />}
                            items={config.table.downloadItems}
                        />
                        <TransactionToolbarSplitButton
                            label="Cetak"
                            icon={<PrintIcon className="h-4 w-4" />}
                            items={config.table.printItems}
                        />
                        <TransactionToolbarSplitButton
                            label="Pengaturan tabel"
                            icon={<NavigationIcon type="settings" className="h-4 w-4" />}
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
                <DataTable className="min-w-[1320px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${resolveAlignClassName(column.align)}`.trim()}
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
                                    className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    onClick={() => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
                                >
                                    {config.table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-2.5 text-[15px] text-[#131a28] ${resolveAlignClassName(column.align)}`.trim()}
                                        >
                                            <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={config.table.columns.length} className="px-2.5 py-3 text-center text-[15px] text-[#131a28]">
                                    Belum ada data
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

function WorkCompletionHeaderActions({ label }) {
    return (
        <div className="flex justify-end">
            <button
                type="button"
                className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
            >
                {label}
            </button>
        </div>
    );
}

function WorkCompletionDetailsSection({ config, values }) {
    return (
        <SearchableTableSection
            searchValue={values.itemSearch}
            searchPlaceholder={config.itemSearchPlaceholder}
            title={values.itemCountLabel || config.itemSectionTitle}
            columns={config.itemTable.columns}
            rows={values.items}
            emptyLabel={config.itemTable.emptyLabel}
            minWidthClassName={config.itemTable.minWidthClassName}
            showTitleSearchButton
        />
    );
}

function WorkCompletionAdditionalInfoSection({ config, values }) {
    return (
        <div className="min-h-[620px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.branch} required />
                <ChipLookupField values={values.branches} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari cabang" heightClassName="h-[34px]" />

                <TransactionFieldLabel label={config.labels.notes} />
                <ReadonlyDocumentTextarea value={values.notes} className="min-h-[84px]" />
            </div>
        </div>
    );
}

function WorkCompletionFormView({ config, activeLevel2Tab }) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.draft;
        }

        const row = config.table.rows.find((item) => item.id === activeRecordId);

        return buildWorkCompletionRecord(row, config);
    }, [activeRecordId, config]);
    const isDetail = Boolean(activeRecordId);
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildFormState(sourceRecord));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord));
    }, [config, sourceRecord]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-[#d8dde7] px-4 py-4">
                        <div className="grid gap-x-10 gap-y-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                            <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                <TransactionFieldLabel label={config.labels.entryDate} required />
                                <TransactionDateInput value={values.entryDate} className="max-w-[282px]" />

                                <TransactionFieldLabel label={config.labels.jobOrderNumber} required />
                                <TextInput
                                    value={values.jobOrderNumber}
                                    readOnly
                                    placeholder={config.jobOrderPlaceholder}
                                    trailing={!isDetail ? <SearchIcon className="h-5 w-5 text-[#111827]" /> : null}
                                    className={`h-[40px] rounded-[4px] ${isDetail ? 'border-[#97da73] bg-[#f2ffee]' : 'border-[#cfd6e2]'}`.trim()}
                                    inputClassName={`text-[15px] ${isDetail ? 'text-[#54a62e]' : 'text-[#1f2436]'}`.trim()}
                                    trailingClassName="px-3"
                                />

                                <TransactionFieldLabel label={config.labels.completionType} />
                                <SelectField
                                    value={values.completionType}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            completionType: event.target.value,
                                        }))
                                    }
                                    className="h-[40px] max-w-[282px] rounded-[4px] border-[#cfd6e2]"
                                    selectClassName="text-[15px] text-[#1f2436]"
                                >
                                    {config.completionTypeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>

                            <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                <div className="flex items-center justify-start gap-4 sm:justify-end">
                                    <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
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
                                </div>

                                {!isDetail && values.autoNumber ? (
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
                                ) : (
                                    <TextInput
                                        value={values.documentNumber}
                                        readOnly
                                        trailing={<span className="text-[18px] font-semibold text-[#1f2436]">×</span>}
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        inputClassName="text-[15px] text-[#1f2436]"
                                        trailingClassName="px-3"
                                    />
                                )}

                                <div />
                                <WorkCompletionHeaderActions label={config.takeButtonLabel} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeSectionId === 'additional-info' ? (
                                <WorkCompletionAdditionalInfoSection config={config} values={values} />
                            ) : (
                                <WorkCompletionDetailsSection config={config} values={values} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <TransactionDock actions={values.dockActions} />
                </div>
            </div>
        </div>
    );
}

export default function WorkCompletionView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(() => buildWorkCompletionConfig(page.workCompletion), [page.workCompletion]);

    return mode === 'table' ? (
        <WorkCompletionTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <WorkCompletionFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
