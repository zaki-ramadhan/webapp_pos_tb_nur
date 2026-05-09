import { useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import SectionTab from '@/features/workspace/shared/SectionTab';
import PanelActions from '@/features/workspace/shared/PanelActions';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { CrossStatusIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function UserFormView({ form }) {
    const [accessType, setAccessType] = useState(form.accessOptions[0]?.value ?? 'operator');
    const activeAccess = form.accessOptions.find((option) => option.value === accessType);
    const actions =
        form.actions ?? [
            {
                id: 'save',
                label: form.saveLabel,
                icon: 'save',
                tone: 'muted',
            },
        ];

    return (
        <div className="relative flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab
                    label={form.sectionLabel}
                    tone="accent"
                    className="h-[34px]"
                />
            </div>

            <div className="flex-1 rounded-[4px] border border-[#cfd6e2] bg-white px-3 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <h2 className="max-w-[1100px] text-[20px] font-medium leading-8 text-[#111827]">
                        {form.title}
                    </h2>
                    <PanelActions actions={actions} />
                </div>

                <div className="mt-8 grid gap-x-8 gap-y-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
                    <label className="pt-3 text-[16px] text-[#20273b]">
                        {form.identifierLabel} <span className="text-[#ED3969]">*</span>
                    </label>
                    <TextInput
                        placeholder={form.identifierPlaceholder}
                        className="h-[42px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px]"
                    />

                    <div className="pt-1 text-[16px] text-[#20273b]">{form.accessLabel}</div>
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-10 text-[16px] text-[#20273b]">
                            {form.accessOptions.map((option) => (
                                <label key={option.value} className="inline-flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="access-type"
                                        value={option.value}
                                        checked={accessType === option.value}
                                        onChange={(event) => setAccessType(event.target.value)}
                                        className="h-5 w-5 border-slate-300 text-[#2f62ab] focus:ring-[#2f62ab]"
                                    />
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                        {activeAccess?.note ? (
                            <div className="inline-flex items-start gap-3 rounded-[4px] border-l-[4px] border-[#7a7a7a] bg-[#fff7f8] px-3 py-2 text-[13px] italic leading-5 text-[#ff4a4a]">
                                <span className="mt-0.5 inline-flex h-3.5 w-3.5 rounded-sm bg-[#666]" />
                                <span>{activeAccess.note}</span>
                            </div>
                        ) : null}
                    </div>

                    <div className="pt-2 text-[16px] text-[#20273b]">{form.groupLabel}</div>
                    <TextInput
                        placeholder={form.groupPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                        className="h-[42px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px]"
                    />
                </div>
            </div>
        </div>
    );
}

function UserTableView({ table }) {
    const [keyword, setKeyword] = useState('');
    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return table.rows;
        }

        return table.rows.filter((row) =>
            [row.name, row.phone, row.email, row.accessType].some((value) =>
                value.toLowerCase().includes(normalizedKeyword),
            ),
        );
    }, [keyword, table.rows]);

    return (
        <div className="min-h-full rounded-[4px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{ label: table.createLabel }}
                refreshButton={{ label: table.refreshLabel }}
                menuButton={{
                    label: table.actionsLabel,
                    items: [
                        {
                            id: 'export',
                            label: 'Ekspor Data',
                        },
                        {
                            id: 'reload',
                            label: 'Muat Ulang',
                        },
                    ],
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[344px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3">
                <DataTable>
                    <DataTableHeader>
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead key={column}>{column}</DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.map((row) => (
                            <DataTableRow key={row.email}>
                                <DataTableCell>{formatTableTextValue(row.name)}</DataTableCell>
                                <DataTableCell>{formatTableTextValue(row.phone)}</DataTableCell>
                                <DataTableCell>{formatTableTextValue(row.email)}</DataTableCell>
                                <DataTableCell className="text-center">
                                    {row.twoFactor ? (
                                        <span className="text-[#1f9d55]">Aktif</span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center">
                                            <CrossStatusIcon />
                                        </span>
                                    )}
                                </DataTableCell>
                                <DataTableCell>{formatTableTextValue(row.accessType)}</DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function UsersManagementView({ page, mode }) {
    return mode === 'table' ? <UserTableView table={page.table} /> : <UserFormView form={page.form} />;
}
