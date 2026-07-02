import { useMemo } from 'react';

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
import TextareaField from '@/components/ui/TextareaField';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { SortIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

function DepartmentFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,430px)] lg:items-start">
            <label className="pt-2 text-xs sm:text-sm leading-6 text-brand-dark">
                {label}
                {required ? <span className="text-tab-active-border-t"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function renderReferenceOptionPrimary(item, secondaryText = '') {
    return (
        <div className="min-w-0">
            <div className="truncate text-xs sm:text-sm font-medium text-text-workspace-dark">{item.label}</div>
            {secondaryText ? (
                <div className="mt-0.5 truncate text-xs text-text-placeholder">{secondaryText}</div>
            ) : null}
        </div>
    );
}

export function DepartmentGeneralTab({ form, values, onChange, parentDepartmentOptions }) {
    return (
        <div className="space-y-4">
            <DepartmentFieldRow label={form.labels.name} required>
                <TextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    className="h-[40px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs sm:text-sm text-brand-dark"
                />
            </DepartmentFieldRow>

            <DepartmentFieldRow label={form.labels.description}>
                <TextareaField
                    value={values.description}
                    onChange={(event) => onChange('description', event.target.value)}
                    rows={4}
                    className="rounded-[4px] border-ui-border"
                    textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                />
            </DepartmentFieldRow>

            <div className="lg:pl-[192px]">
                <CheckboxField
                    id="department-sub-department"
                    label={form.labels.subDepartment}
                    checked={values.isSubDepartment}
                    onChange={(event) => onChange('isSubDepartment', event.target.checked)}
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </div>

            {values.isSubDepartment ? (
                <DepartmentFieldRow label={form.labels.subDepartment}>
                    <ReferenceLookupInput
                        value={values.parentDepartmentName}
                        items={parentDepartmentOptions}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari parent departemen"
                        className="max-w-[710px]"
                        getOptionLabel={(option) => option.label}
                        getOptionSearchText={(option) => option.searchText}
                        renderOption={(option) => renderReferenceOptionPrimary(option, option.code)}
                        onSelect={(option) => onChange('parentDepartment', option)}
                        onClear={() => onChange('parentDepartment', null)}
                    />
                </DepartmentFieldRow>
            ) : null}
        </div>
    );
}

function DepartmentOpeningBalanceTable({ openingBalance, keyword }) {
    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        const normalizedTokens = normalizedKeyword
            .replace(/[\[\]]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);

        return openingBalance.rows.filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            const searchableValue = [row.code, row.name, row.value]
                .map((value) => String(value ?? '').toLowerCase())
                .join(' ');

            return normalizedTokens.every((token) => searchableValue.includes(token));
        });
    }, [keyword, openingBalance.rows]);

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[720px]">
                <DataTable wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {openingBalance.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-base font-normal text-white`.trim()}
                                >
                                    <span className="flex items-center justify-center gap-2">
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
                                    className={`${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'} border-ui-border-row`.trim()}
                                >
                                    <DataTableCell className="px-3 text-base text-text-workspace-dark">
                                        {formatTableTextValue(row.code)}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 text-base text-text-workspace-dark">
                                        {formatTableTextValue(row.name)}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 text-left text-base text-text-workspace-dark">
                                        {formatTableTextValue(row.value)}
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell
                                    colSpan={openingBalance.columns.length}
                                    className="px-3 py-3 text-center text-base text-text-workspace-dark"
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

export function DepartmentOpeningBalanceTab({ form, values, onChange }) {
    const openingBalance = form.openingBalance;

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-normal leading-none text-brand-dark">{openingBalance.title}</h3>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-3">
                    <label className="text-xs sm:text-sm text-brand-dark shrink-0">{openingBalance.dateLabel}</label>
                    <TransactionDateInput
                        value={values.openingDate}
                        onChange={(nextValue) => onChange('openingDate', nextValue)}
                        disableAutoInit={true}
                        className="h-[40px] w-[180px] rounded-[4px] border-ui-border"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                        trailingClassName="w-[42px] shrink-0 justify-center px-0"
                    />
                </div>

                <div className="w-full sm:w-[360px]">
                    <AccountLookupTextInput
                        value={values.openingBalanceKeyword}
                        placeholder={openingBalance.accountPlaceholder}
                        searchLabel="Cari akun perkiraan saldo awal"
                        dialogTitle="Pilih Akun Perkiraan Saldo Awal"
                        className="h-[40px] rounded-[4px] border-ui-border"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                        trailingClassName="px-2.5"
                        onSelectAccount={(_, label) => onChange('openingBalanceKeyword', label ?? '')}
                    />
                </div>
            </div>

            <DepartmentOpeningBalanceTable
                openingBalance={openingBalance}
                keyword={values.openingBalanceKeyword}
            />
        </div>
    );
}

export function DepartmentUsersTab({ form, values, onChange, branchOptions, userOptions }) {
    const filteredUserOptions = userOptions;

    return (
        <div className="space-y-4">
            <div className="border-b border-ui-border-medium pb-2.5">
                <h3 className="text-lg font-medium text-brand-dark">{form.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="department-all-users"
                label={form.userAccess.allUsersLabel}
                checked={values.allUsers}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-base"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName="w-auto"
            />

            {!values.allUsers ? (
                <div className="space-y-3">
                    <div className="pt-1">
                        <h3 className="text-lg font-medium text-brand-dark">
                            {form.userAccess.limitedTitle ?? 'Tentukan pengguna yang dapat memilih departemen ini'}
                        </h3>
                    </div>


                    <DepartmentFieldRow label={form.userAccess.userLabel ?? 'Pengguna'}>
                        <div className="space-y-2">
                            <ReferenceLookupInput
                                values={values.selectedUserLabels}
                                items={filteredUserOptions}
                                placeholder={form.userAccess.userPlaceholder ?? 'Cari/Pilih...'}
                                searchLabel="Cari pengguna"
                                className="max-w-[1220px]"
                                getOptionLabel={(option) => option.label}
                                getOptionSearchText={(option) => option.searchText}
                                renderOption={(option) => renderReferenceOptionPrimary(option, option.email || option.branchLabels.join(', '))}
                                onSelect={(option) => onChange('selectedUser', option)}
                                onRemove={(label) => onChange('removeSelectedUser', label)}
                            />
                            {!values.selectedUserLabels.length ? (
                                <p className="text-sm text-text-placeholder">
                                    Pilih pengguna yang diizinkan memakai departemen ini.
                                </p>
                            ) : null}
                        </div>
                    </DepartmentFieldRow>
                </div>
            ) : null}
        </div>
    );
}
