import { useEffect, useMemo, useState } from 'react';

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
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PlusIcon, PrintIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function buildDefaultValues(form) {
    return {
        name: form.defaults?.name ?? '',
        phone: form.defaults?.phone ?? '',
        street: form.defaults?.street ?? '',
        city: form.defaults?.city ?? '',
        postalCode: form.defaults?.postalCode ?? '',
        province: form.defaults?.province ?? '',
        country: form.defaults?.country ?? '',
        allUsers: Boolean(form.userAccess?.allUsersChecked),
    };
}

function BranchFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
            <label className="text-[17px] text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function PrefixedTextArea({ value, onChange, prefix, className = '', textareaClassName = '' }) {
    return (
        <div className={`flex overflow-hidden rounded-[4px] border border-[#cfd6e2] bg-white ${className}`.trim()}>
            <div className="flex min-w-[88px] items-start justify-start border-r border-[#cfd6e2] bg-[#f3f3f4] px-3 py-3 text-[15px] text-[#8b94a7]">
                {prefix}
            </div>
            <textarea
                value={value}
                onChange={onChange}
                rows={4}
                className={`min-h-[112px] w-full resize-none px-4 py-3 text-[15px] text-[#1f2436] outline-none ${textareaClassName}`.trim()}
            />
        </div>
    );
}

function PrefixedInput({ value, onChange, prefix, className = '', inputClassName = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            prefixClassName="min-w-[92px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-[15px] text-[#8b94a7]"
            inputClassName={`text-[15px] text-[#1f2436] ${inputClassName}`.trim()}
        />
    );
}

function BranchGeneralTab({ form, values, onChange }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
                <PreferencesSectionHeading title="Info Umum" icon="building" />

                <div className="space-y-4">
                    <BranchFieldRow label="Nama" required>
                        <TextInput
                            value={values.name}
                            onChange={(event) => onChange('name', event.target.value)}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </BranchFieldRow>

                    <BranchFieldRow label="No. Telepon">
                        <TextInput
                            value={values.phone}
                            onChange={(event) => onChange('phone', event.target.value)}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </BranchFieldRow>
                </div>
            </div>

            <div className="space-y-4">
                <PreferencesSectionHeading title="Info Lainnya" icon="building" />

                <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
                    <label className="pt-2 text-[17px] text-[#1f2436]">Alamat</label>
                    <div className="space-y-3">
                        <PrefixedTextArea
                            value={values.street}
                            onChange={(event) => onChange('street', event.target.value)}
                            prefix="Jalan"
                        />

                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_184px]">
                            <PrefixedInput
                                value={values.city}
                                onChange={(event) => onChange('city', event.target.value)}
                                prefix="Kota"
                            />
                            <PrefixedInput
                                value={values.postalCode}
                                onChange={(event) => onChange('postalCode', event.target.value)}
                                prefix="K.Pos"
                            />
                        </div>

                        <PrefixedInput
                            value={values.province}
                            onChange={(event) => onChange('province', event.target.value)}
                            prefix="Provinsi"
                        />

                        <PrefixedInput
                            value={values.country}
                            onChange={(event) => onChange('country', event.target.value)}
                            prefix="Negara"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function BranchUsersTab({ form, values, onChange }) {
    return (
        <div className="space-y-5">
            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-[18px] font-medium text-[#1f2436]">{form.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="branch-all-users"
                label={form.userAccess.allUsersLabel}
                checked={values.allUsers}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-[17px]"
                inputClassName="mt-0 h-[18px] w-[18px]"
            />
        </div>
    );
}

function BranchFormView({ form }) {
    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'branch-general');
    const [values, setValues] = useState(() => buildDefaultValues(form));

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'branch-general');
        setValues(buildDefaultValues(form));
    }, [form]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={form.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[640px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    {activeTabId === 'branch-users' ? (
                        <BranchUsersTab form={form} values={values} onChange={handleChange} />
                    ) : (
                        <BranchGeneralTab form={form} values={values} onChange={handleChange} />
                    )}
                </div>

                <div className="flex justify-end lg:shrink-0">
                    <DockSaveButton label={form.saveLabel} />
                </div>
            </div>
        </div>
    );
}

function BranchTableView({ table, onCreate }) {
    const [keyword, setKeyword] = useState('');
    const [inactiveFilter, setInactiveFilter] = useState(table.filters?.[0]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (inactiveFilter !== 'all' && row.inactiveValue !== inactiveFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.phone, row.inactiveLabel, row.name, row.userList].some((value) =>
                String(value).toLowerCase().includes(normalizedKeyword),
            );
        });
    }, [inactiveFilter, keyword, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={
                    table.filters?.map((filter) => (
                        <SelectField
                            key={filter.id}
                            value={inactiveFilter}
                            onChange={(event) => setInactiveFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[40px] min-w-[192px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#394157]"
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
                printButton={{
                    label: table.printLabel,
                    icon: <PrintIcon className="h-5 w-5" />,
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
                        {filteredRows.map((row, index) => (
                            <DataTableRow
                                key={row.id}
                                className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                            >
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.phone)}</span>
                                </DataTableCell>
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.inactiveLabel)}</span>
                                </DataTableCell>
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.name)}</span>
                                </DataTableCell>
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.userList)}</span>
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function BranchView({ page, mode, onOpenContent }) {
    return mode === 'table' ? (
        <BranchTableView table={page.table} onCreate={onOpenContent} />
    ) : (
        <BranchFormView form={page.form} />
    );
}
