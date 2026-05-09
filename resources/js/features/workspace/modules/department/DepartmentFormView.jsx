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
import TextInput from '@/components/ui/TextInput';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import { SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

function buildDefaultValues(form) {
    return {
        name: form.defaults?.name ?? '',
        description: form.defaults?.description ?? '',
        isSubDepartment: Boolean(form.defaults?.isSubDepartment),
        openingDate: form.defaults?.openingDate ?? '',
        openingBalanceKeyword: '',
        allUsers: form.userAccess?.allUsersChecked ?? true,
    };
}

function DepartmentFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,570px)] lg:items-start">
            <label className="pt-2 text-[17px] leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function DepartmentGeneralTab({ form, values, onChange }) {
    return (
        <div className="space-y-6">
            <DepartmentFieldRow label={form.labels.name} required>
                <TextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </DepartmentFieldRow>

            <DepartmentFieldRow label={form.labels.description}>
                <textarea
                    value={values.description}
                    onChange={(event) => onChange('description', event.target.value)}
                    rows={4}
                    className="min-h-[70px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
                />
            </DepartmentFieldRow>

            <div className="lg:pl-[280px]">
                <CheckboxField
                    id="department-sub-department"
                    label={form.labels.subDepartment}
                    checked={values.isSubDepartment}
                    onChange={(event) => onChange('isSubDepartment', event.target.checked)}
                    align="center"
                    labelClassName="text-[17px]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </div>
        </div>
    );
}

function DepartmentOpeningBalanceTable({ openingBalance, keyword }) {
    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return openingBalance.rows.filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            return [row.code, row.name, row.value].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, openingBalance.rows]);

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[720px]">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {openingBalance.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white`.trim()}
                                >
                                    <span
                                        className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-center'}`.trim()}
                                    >
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
                                    className={`${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} border-[#dde1e8]`.trim()}
                                >
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                        {formatTableTextValue(row.code)}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                        {formatTableTextValue(row.name)}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 text-right text-[15px] text-[#131a28]">
                                        {formatTableTextValue(row.value)}
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell
                                    colSpan={openingBalance.columns.length}
                                    className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                                >
                                    {openingBalance.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

function DepartmentOpeningBalanceTab({ form, values, onChange }) {
    const openingBalance = form.openingBalance;

    return (
        <div className="space-y-6">
            <h3 className="text-[24px] font-normal leading-none text-[#1f2436]">{openingBalance.title}</h3>

            <div className="grid gap-3 sm:grid-cols-[140px_266px] sm:items-center">
                <label className="text-[17px] text-[#1f2436]">{openingBalance.dateLabel}</label>
                <TransactionDateInput
                    value={values.openingDate}
                    onChange={(nextValue) => onChange('openingDate', nextValue)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName="w-[42px] shrink-0 justify-center px-0"
                />
            </div>

            <div className="max-w-[420px]">
                <TextInput
                    value={values.openingBalanceKeyword}
                    onChange={(event) => onChange('openingBalanceKeyword', event.target.value)}
                    placeholder={openingBalance.accountPlaceholder}
                    trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName="px-2.5"
                />
            </div>

            <DepartmentOpeningBalanceTable
                openingBalance={openingBalance}
                keyword={values.openingBalanceKeyword}
            />
        </div>
    );
}

function DepartmentUsersTab({ form, values, onChange }) {
    return (
        <div className="space-y-5">
            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-[18px] font-medium text-[#1f2436]">{form.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="department-all-users"
                label={form.userAccess.allUsersLabel}
                checked={values.allUsers}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-[17px]"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName="w-auto"
            />
        </div>
    );
}

export default function DepartmentFormView({ form }) {
    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'department-general');
    const [values, setValues] = useState(() => buildDefaultValues(form));

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'department-general');
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

            <div className="flex min-h-[640px] flex-col gap-5 px-4 py-4 xl:flex-row xl:items-start">
                <div className="order-2 min-w-0 flex-1 xl:order-1">
                    {activeTabId === 'department-opening-balance' ? (
                        <DepartmentOpeningBalanceTab form={form} values={values} onChange={handleChange} />
                    ) : activeTabId === 'department-users' ? (
                        <DepartmentUsersTab form={form} values={values} onChange={handleChange} />
                    ) : (
                        <DepartmentGeneralTab form={form} values={values} onChange={handleChange} />
                    )}
                </div>

                <div className="order-1 flex justify-end xl:order-2 xl:shrink-0">
                    <DockSaveButton label={form.saveLabel} />
                </div>
            </div>
        </div>
    );
}
