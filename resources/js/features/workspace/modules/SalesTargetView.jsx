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
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import TargetDetailEntryModal from '@/features/workspace/modules/shared/TargetDetailEntryModal';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSectionRail,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import { FunnelIcon, LinkIcon, PlusIcon, PrintIcon, SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';

function buildTargetState(source = {}, config) {
    const detailConfig = source.detailConfig ?? config.draft?.detailConfig ?? {};

    return {
        name: source.name ?? config.draft?.name ?? '',
        targetType: source.targetType ?? config.draft?.targetType ?? '',
        branch: source.branch ?? config.draft?.branch ?? '',
        startDate: source.startDate ?? config.draft?.startDate ?? '',
        endDate: source.endDate ?? config.draft?.endDate ?? '',
        detailSearch: source.detailSearch ?? '',
        detailTitle: detailConfig.title ?? '',
        detailSearchPlaceholder: detailConfig.searchPlaceholder ?? '',
        detailColumns: detailConfig.columns ?? [],
        detailRows: detailConfig.rows ?? [],
        detailModal: detailConfig.modal ?? null,
        notes: source.notes ?? config.draft?.notes ?? '',
        analyst: source.analyst ?? config.draft?.analyst ?? '',
    };
}

function findTargetRecord(config, activeLevel2Tab) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

    if (!recordId) {
        return null;
    }

    return (config.table.rows ?? []).find((row) => row.id === recordId) ?? null;
}

function FormFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
            <TransactionFieldLabel label={label} required={required} />
            <div>{children}</div>
        </div>
    );
}

function SalesTargetDetailsSection({ values, setValues, onOpenModal }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[560px]">
                    <TextInput
                        value={values.detailSearch}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                detailSearch: event.target.value,
                            }))
                        }
                        placeholder={values.detailSearchPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <TransactionToolbarIconButton label={`Cari ${values.detailTitle}`}>
                        <SearchIcon className="h-4.5 w-4.5" />
                    </TransactionToolbarIconButton>
                    <div className="text-right text-[22px] font-normal text-[#1f2436]">
                        {values.detailTitle}
                        {values.detailTitle ? <span className="text-[#ED3969]"> *</span> : null}
                    </div>
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <div className="min-w-[980px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {values.detailColumns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${
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
                            {values.detailRows.length ? (
                                values.detailRows.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${
                                            index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'
                                        }`.trim()}
                                        onClick={() => values.detailModal && onOpenModal(row)}
                                    >
                                        {values.detailColumns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-3 text-[15px] text-[#131a28]`.trim()}
                                            >
                                                {row[column.id] ?? ''}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell
                                        colSpan={values.detailColumns.length}
                                        className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                                    >
                                        Belum ada data
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}

function SalesTargetAdditionalInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,560px)] lg:items-start">
                <TransactionFieldLabel label={config.labels.notes} />
                <TextareaField
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={3}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[58px] text-[15px] text-[#1f2436]"
                />

                <TransactionFieldLabel label={config.labels.analyst} />
                <TextInput
                    value={values.analyst}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            analyst: event.target.value,
                        }))
                    }
                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </div>
        </div>
    );
}

function SalesTargetFormView({ config, activeLevel2Tab }) {
    const detailRecord = useMemo(() => findTargetRecord(config, activeLevel2Tab), [activeLevel2Tab, config]);
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildTargetState(detailRecord ?? config.draft, config));
    const [activeModalRow, setActiveModalRow] = useState(null);
    const isDetail = Boolean(detailRecord);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildTargetState(detailRecord ?? config.draft, config));
        setActiveModalRow(null);
    }, [config, detailRecord]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-[#d8dde7] px-4 py-4">
                        <div className="grid gap-x-10 gap-y-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)]">
                            <div className="space-y-3">
                                <FormFieldRow label={config.labels.name} required>
                                    <TextInput
                                        value={values.name}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                name: event.target.value,
                                            }))
                                        }
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        inputClassName="text-[15px] text-[#1f2436]"
                                    />
                                </FormFieldRow>

                                <FormFieldRow label={config.labels.type}>
                                    <SelectField
                                        value={values.targetType}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                targetType: event.target.value,
                                            }))
                                        }
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        selectClassName="text-[15px] text-[#1f2436]"
                                    >
                                        {config.targetTypeOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </SelectField>
                                </FormFieldRow>

                                <FormFieldRow label={config.labels.branch}>
                                    <SelectField
                                        value={values.branch}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                branch: event.target.value,
                                            }))
                                        }
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        selectClassName="text-[15px] text-[#1f2436]"
                                    >
                                        {config.branchOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </SelectField>
                                </FormFieldRow>
                            </div>

                            <div className="space-y-3">
                                <FormFieldRow label={config.labels.startDate}>
                                    <TransactionDateInput value={values.startDate} className="max-w-[282px]" />
                                </FormFieldRow>

                                <FormFieldRow label={config.labels.endDate} required>
                                    <TransactionDateInput value={values.endDate} className="max-w-[282px]" />
                                </FormFieldRow>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-h-[620px] gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeSectionId === 'additional-info' ? (
                                <SalesTargetAdditionalInfoSection config={config} values={values} setValues={setValues} />
                            ) : (
                                <SalesTargetDetailsSection values={values} setValues={setValues} onOpenModal={setActiveModalRow} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <TransactionDock actions={isDetail ? config.detailDockActions : config.createDockActions} />
                </div>
            </div>

            <TargetDetailEntryModal
                open={Boolean(activeModalRow)}
                modal={values.detailModal}
                row={activeModalRow}
                onClose={() => setActiveModalRow(null)}
            />
        </div>
    );
}

function SalesTargetFilterBar({ config, filters, setFilters }) {
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
                    className="h-[34px] min-w-[138px] rounded-[4px] border-[#cfd6e2]"
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
                className="inline-flex h-[34px] w-[48px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={config.table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}

function SalesTargetTableView({ config, onCreate, onOpenDetail }) {
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
                filters={<SalesTargetFilterBar config={config} filters={filters} setFilters={setFilters} />}
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
                            icon={<NavigationIcon type="settings" className="h-4 w-4" />}
                            items={[{ id: 'settings', label: config.table.settingsLabel }]}
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
                <DataTable className="min-w-[1360px]" wrapperClassName="border-[#d1d8e4]">
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
                        {filteredRows.map((row, index) => (
                            <DataTableRow
                                key={row.id}
                                className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${
                                    index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'
                                }`.trim()}
                                onClick={() =>
                                    onOpenDetail?.({
                                        recordId: row.id,
                                        label: row.name,
                                    })
                                }
                            >
                                {config.table.columns.map((column) => (
                                    <DataTableCell
                                        key={column.id}
                                        className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-2.5 text-[15px] text-[#131a28]`.trim()}
                                    >
                                        <span className="block truncate">{row[column.id] ?? ''}</span>
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

export default function SalesTargetView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = page.salesTarget;

    return mode === 'table' ? (
        <SalesTargetTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SalesTargetFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
