import { useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/ui/Pagination';

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
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import SectionTab from '@/features/workspace/shared/SectionTab';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PlusIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function PrintDesignFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[170px_minmax(0,380px)] lg:items-center">
            <label className="text-xs sm:text-sm text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function PrintDesignFormView({ form }) {
    const [name, setName] = useState(form.defaults?.name ?? '');
    const [type, setType] = useState(form.defaults?.type ?? form.typeOptions?.[0]?.value ?? '');
    const [allUsers, setAllUsers] = useState(Boolean(form.userAccess?.allUsersChecked));

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
            <div className="shrink-0 px-1 pt-0.5">
                <SectionTab label={form.sectionLabel} tone="accent" className="h-[34px]" />
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-5 rounded-[4px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-stretch overflow-hidden">
                <div className="order-2 min-w-0 flex-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col lg:order-1">
                    <div className="flex-1 min-h-0 flex flex-col">
                        <div className="space-y-3">
                            <PrintDesignFieldRow label="Nama Desain" required>
                                <TextInput
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                />
                            </PrintDesignFieldRow>

                            <PrintDesignFieldRow label="Tipe" required>
                                <SelectField
                                    value={type}
                                    onChange={(event) => setType(event.target.value)}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    selectClassName="text-xs sm:text-sm text-[#1f2436]"
                                >
                                    {form.typeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectField>
                            </PrintDesignFieldRow>
                        </div>

                        <div className="mt-12">
                            <div className="border-b border-[#d9dee8] pb-2">
                                <h3 className="text-xl font-medium text-[#1f2436]">Akses Pengguna</h3>
                            </div>

                            <div className="pt-4">
                                <CheckboxField
                                    id="print-design-all-users"
                                    label={form.userAccess.allUsersLabel}
                                    checked={allUsers}
                                    onChange={(event) => setAllUsers(event.target.checked)}
                                    align="center"
                                    labelClassName="text-base"
                                    inputClassName="mt-0 h-[18px] w-[18px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-1 flex justify-end lg:order-2 lg:shrink-0 lg:self-start">
                    <DockSaveButton label={form.saveLabel} />
                </div>
            </div>
        </div>
    );
}

function PrintDesignTableView({ table, onCreate }) {
    const [keyword, setKeyword] = useState('');
    const [transactionType, setTransactionType] = useState(table.filters?.[0]?.options?.[0]?.value ?? 'all');

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(25);

    useEffect(() => {
        setPage(1);
    }, [keyword, transactionType]);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (transactionType !== 'all' && row.transactionTypeValue !== transactionType) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            const searchCols = table.columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
            return searchCols.slice(0, 2).some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, table.rows, transactionType]);

    const paginatedRows = useMemo(() => {
        const start = (page - 1) * perPage;
        return filteredRows.slice(start, start + perPage);
    }, [filteredRows, page, perPage]);

    const total = filteredRows.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const from = total > 0 ? (page - 1) * perPage + 1 : 0;
    const to = Math.min(total, page * perPage);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={
                    table.filters?.map((filter) => (
                        <SelectField
                            key={filter.id}
                            value={transactionType}
                            onChange={(event) => setTransactionType(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[40px] min-w-[228px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#394157]"
                        >
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                    )) ?? null
                }
                topRowClassName="mb-4"
                size="compact"
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[310px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {filteredRows.length > 0 ? (
                                <DataTableHead className="w-[50px] px-3 py-2 text-center text-base font-medium text-white">
                                    No.
                                </DataTableHead>
                            ) : null}
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {paginatedRows.length ? (
                            paginatedRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                >
                                    {filteredRows.length > 0 ? (
                                        <DataTableCell className="px-3 text-center text-base text-[#646d83]">
                                            {from + index}
                                        </DataTableCell>
                                    ) : null}
                                    <DataTableCell className="px-3 text-base text-[#131a28]">
                                        <span className="block truncate">{formatTableTextValue(row.designName)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-3 text-base text-[#131a28]">
                                        <span className="block truncate">{formatTableTextValue(row.transactionTypeLabel)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-3 text-base text-[#131a28]">
                                        <span className="block truncate">{formatTableTextValue(row.userList)}</span>
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={filteredRows.length > 0 ? table.columns.length + 1 : table.columns.length} className="px-3 py-3 text-center text-base text-[#131a28]">
                                    Belum ada data
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>

            {total > 0 ? (
                <Pagination
                    page={page}
                    perPage={perPage}
                    total={total}
                    lastPage={lastPage}
                    from={from}
                    to={to}
                    onPageChange={setPage}
                    onPerPageChange={(nextPerPage) => {
                        setPerPage(nextPerPage);
                        setPage(1);
                    }}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}

export default function PrintDesignView({ page, mode, onOpenContent }) {
    return mode === 'table' ? (
        <PrintDesignTableView table={page.table} onCreate={onOpenContent} />
    ) : (
        <PrintDesignFormView form={page.form} />
    );
}
