import { useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import SectionTab from '@/features/workspace/shared/SectionTab';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CogIcon,
    InfoIcon,
    PlusIcon,
    RefreshIcon,
    SearchIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';
import Tooltip from '@/components/ui/Tooltip';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapApprovalRuleRow } from '@/features/workspace/backend/workspaceBackendAdapters';

function ApprovalHeading({ title }) {
    return (
        <div className="border-b border-[#d9dee8] pb-2">
            <h3 className="text-[18px] font-medium text-[#1564d7] sm:text-[20px]">{title}</h3>
        </div>
    );
}

function getApprovalFieldTooltip(label) {
    const cleanLabel = String(label || '').trim();
    if (cleanLabel.includes('Syarat min.')) {
        return 'Syarat minimum nilai nominal transaksi atau persentase diskon yang memerlukan penyetujuan.';
    }
    if (cleanLabel.includes('Pembuat Transaksi')) {
        return 'Pengguna pembuat transaksi yang pengajuannya akan disaring oleh aturan ini.';
    }
    return `Informasi tentang ${cleanLabel}`;
}

function ApprovalFieldLabel({ label, required = false, info = false }) {
    return (
        <div className="flex items-center gap-2 pt-1 text-[16px] text-[#1f2436]">
            <span>
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </span>
            {info ? (
                <Tooltip content={getApprovalFieldTooltip(label)} portal>
                    <InfoIcon className="h-5 w-5 text-[#1f2436] cursor-help" />
                </Tooltip>
            ) : null}
        </div>
    );
}


function ThresholdField({ valueLabel }) {
    return (
        <div className="space-y-3">
            <TextInput
                placeholder=""
                prefix={valueLabel}
                prefixClassName="min-w-[110px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-[15px] text-[#9299aa]"
                trailing={<TableActionIcon className="h-5 w-5 text-[#1f2436]" />}
                trailingClassName="px-3 text-[#1f2436]"
                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                inputClassName="text-[15px] text-[#1f2436]"
            />

            <TextInput
                placeholder="Diskon (%)"
                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                inputClassName="text-[15px] text-[#1f2436]"
            />
        </div>
    );
}

function TransactionApprovalFormView({ form }) {
    const [transactionType, setTransactionType] = useState(form.defaults?.transactionType ?? form.transactionTypeOptions?.[0]?.value ?? '');
    const [branch, setBranch] = useState(form.defaults?.branch ?? form.branchOptions?.[0]?.value ?? '');
    const [approvalRule, setApprovalRule] = useState(form.defaults?.approvalRule ?? form.approvalRuleOptions?.[0]?.value ?? '');

    return (
        <div className="relative flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab label={form.sectionLabel} tone="accent" className="h-[34px]" />
            </div>

            <div className="flex min-h-[642px] flex-col gap-5 rounded-[4px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] xl:flex-row xl:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="space-y-4">
                            <ApprovalHeading title="Kriteria Pengajuan" />

                            <div className="grid gap-3 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-center">
                                <ApprovalFieldLabel label="Tipe Transaksi" />
                                <SelectField
                                    value={transactionType}
                                    onChange={(event) => setTransactionType(event.target.value)}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    selectClassName="text-[15px] text-[#1f2436]"
                                >
                                    {form.transactionTypeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectField>

                                <ApprovalFieldLabel label="Syarat min. Nilai/Diskon" info />
                                <ThresholdField valueLabel={form.valueLabel} />

                                <ApprovalFieldLabel label="Pembuat Transaksi" info />
                                <TextInput
                                    placeholder="Cari/Pilih..."
                                    trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />

                                <ApprovalFieldLabel label="Cabang" />
                                <SelectField
                                    value={branch}
                                    onChange={(event) => setBranch(event.target.value)}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    selectClassName="text-[15px] text-[#1f2436]"
                                >
                                    {form.branchOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ApprovalHeading title="Kriteria Penyetuju" />

                            <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                                <ApprovalFieldLabel label="Disetujui Oleh" required />
                                <TextInput
                                    placeholder="Cari/Pilih..."
                                    trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />

                                <ApprovalFieldLabel label="Dengan Syarat" />
                                <SelectField
                                    value={approvalRule}
                                    onChange={(event) => setApprovalRule(event.target.value)}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    selectClassName="text-[15px] text-[#1f2436]"
                                >
                                    {form.approvalRuleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end xl:shrink-0">
                    <DockSaveButton label={form.saveLabel} />
                </div>
            </div>
        </div>
    );
}

function TransactionApprovalTableView({ table, onCreate, onRefresh, onOpenDetail }) {
    const [filters, setFilters] = useState(() =>
        table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? '';
            return result;
        }, {}),
    );

    const filteredRows = useMemo(() => {
        return table.rows.filter((row) => {
            return table.filters.every((filter) => {
                const selectedValue = filters[filter.id];
                if (!selectedValue || selectedValue === 'all') {
                    return true;
                }

                return row[filter.rowKey] === selectedValue;
            });
        });
    }, [filters, table.filters, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={table.filters.map((filter) => (
                    <SelectField
                        key={filter.id}
                        value={filters[filter.id]}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                [filter.id]: event.target.value,
                            }))
                        }
                        containerClassName="w-auto shrink-0"
                        className="h-[40px] min-w-[228px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#394157]"
                    >
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                ))}
                topRowClassName="mb-4"
                size="compact"
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: table.refreshLabel,
                    onClick: onRefresh,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                menuButton={{
                    label: table.actionsLabel,
                    icon: <CogIcon className="h-5 w-5" />,
                    buttonClassName: 'w-[70px]',
                    items: table.menuItems,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    onClick={() => onOpenDetail?.(row)}
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                >
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">{formatTableTextValue(row.transactionTypeLabel)}</DataTableCell>
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">{formatTableTextValue(row.valueLabel)}</DataTableCell>
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">{formatTableTextValue(row.approvedBy)}</DataTableCell>
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">{formatTableTextValue(row.createdBy)}</DataTableCell>
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">{formatTableTextValue(row.branchLabel)}</DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-[#dde1e8] bg-white">
                                <DataTableCell colSpan={table.columns.length} className="px-3 py-8 text-center text-[15px] text-[#131a28]">
                                    {table.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function TransactionApprovalView({
    page,
    mode,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'transaction-approval-rules',
        filters: {
            per_page: 100,
        },
    });

    const resolvedTable = useMemo(() => ({
        ...page.table,
        rows: rows.map(mapApprovalRuleRow),
        pageValue: total.toLocaleString('id-ID'),
        refreshLabel: loading ? 'Memuat...' : page.table.refreshLabel,
    }), [loading, page.table, rows, total]);

    return mode === 'table' ? (
        <TransactionApprovalTableView
            table={resolvedTable}
            onCreate={onOpenContent}
            onRefresh={reload}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <TransactionApprovalFormView
            form={page.form}
            onRefresh={reload}
        />
    );
}
