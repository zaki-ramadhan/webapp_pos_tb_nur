import { useMemo } from 'react';

import TextInput from '@/components/ui/TextInput';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { PlusIcon, TableActionIcon } from '@/features/workspace/shared/Icons';
import TextareaField from '@/components/ui/TextareaField';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

export default function DiscountInfoTab({ values, setValues }) {
    const discountColumns = useMemo(
        () => [
            { id: 'spacer', label: '', widthClassName: 'w-[64px]', align: 'center' },
            { id: 'account', label: 'Akun Diskon', widthClassName: 'w-[68%]', align: 'left' },
            { id: 'amount', label: 'Diskon', widthClassName: 'w-[32%]', align: 'right' },
        ],
        [],
    );

    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="space-y-3">
            <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
                <TransactionFieldLabel label="Akun Diskon" />
                <AccountLookupField
                    values={values.discountAccount}
                    placeholder="Cari/Pilih..."
                    onRemove={() =>
                        setValues((current) => ({
                            ...current,
                            __discountAccountId: null,
                            discountAccount: [],
                        }))
                    }
                    searchLabel="Cari akun diskon"
                    dialogTitle="Pilih Akun Diskon"
                    onSelectAccount={(record, label) =>
                        setValues((current) => ({
                            ...current,
                            __discountAccountId: record ? record.id : null,
                            discountAccount: label ? [label] : [],
                        }))
                    }
                    heightClassName="h-[36px]"
                />

                <TransactionFieldLabel label="Diskon" />
                <div className="max-w-[170px]">
                    <FormattedAmountInput
                        id="discountAmount"
                        value={values.discountAmount}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                discountAmount: event.target.value,
                            }))
                        }
                        maxLength={11}
                        prefix="Rp"
                        className="h-[36px] rounded-[4px] border-ui-border"
                        inputClassName="text-right text-xs sm:text-sm text-text-darkest"
                    />
                </div>

                <TransactionFieldLabel label="Keterangan Diskon" />
                <TextareaField
                    value={values.discountNotes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            discountNotes: event.target.value,
                        }))
                    }
                    rows={3}
                    className="border-ui-border"
                    textareaClassName="min-h-[56px] text-xs sm:text-sm text-brand-dark"
                />

                {!hideDepartment ? (
                    <>
                        <TransactionFieldLabel label="Departemen" />
                        <AccountLookupField
                            resource="departments"
                            values={values.department}
                            placeholder="Cari/Pilih..."
                            onRemove={() =>
                                setValues((current) => ({
                                    ...current,
                                    __departmentId: null,
                                    department: [],
                                }))
                            }
                            searchLabel="Cari departemen"
                            dialogTitle="Pilih Departemen"
                            onSelectAccount={(record, label) =>
                                setValues((current) => ({
                                    ...current,
                                    __departmentId: record ? record.id : null,
                                    department: label ? [label] : [],
                                }))
                            }
                            heightClassName="h-[36px]"
                        />
                    </>
                ) : null}
            </div>

            <div>
                <button
                    type="button"
                    className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue-accent"
                    aria-label="Tambah diskon"
                >
                    <PlusIcon className="h-5 w-5 text-brand-blue-accent" />
                </button>
            </div>

            <div className="overflow-hidden rounded-[4px] border border-table-wrapper-border">
                <DataTable wrapperClassName="border-none">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {discountColumns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName} px-2.5 text-base font-medium text-white text-center`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {values.discountRows.length ? (
                            values.discountRows.map((row, index) => (
                                <DataTableRow
                                    key={`${row.account}-${row.amount}-${index}`}
                                    className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'}`.trim()}
                                >
                                    <DataTableCell className="px-2.5 text-center text-text-workspace-inactive">
                                        <span className="inline-flex items-center justify-center">
                                            <TableActionIcon className="h-4 w-4" />
                                        </span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-base text-text-workspace-dark">
                                        <span className="block truncate">{row.account}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-left text-base text-text-workspace-dark">
                                        <span className="block truncate">{row.amount}</span>
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-ui-border-row bg-white">
                                <DataTableCell className="px-2.5 text-center text-text-workspace-inactive">
                                    <span className="inline-flex items-center justify-center">
                                        <TableActionIcon className="h-4 w-4" />
                                    </span>
                                </DataTableCell>
                                <DataTableCell colSpan={2} className="px-2.5 py-6 text-center text-base text-text-workspace-dark">
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
