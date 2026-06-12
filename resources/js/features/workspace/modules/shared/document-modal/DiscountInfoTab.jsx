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
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { PlusIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

export default function DiscountInfoTab({ values, setValues }) {
    const discountColumns = useMemo(
        () => [
            { id: 'spacer', label: '', widthClassName: 'w-[52px]', align: 'center' },
            { id: 'account', label: 'Akun Diskon', widthClassName: 'w-[68%]', align: 'left' },
            { id: 'amount', label: 'Diskon', widthClassName: 'w-[32%]', align: 'right' },
        ],
        [],
    );

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
                            discountAccount: [],
                        }))
                    }
                    searchLabel="Cari akun diskon"
                    dialogTitle="Pilih Akun Diskon"
                    onSelectAccount={(_, label) =>
                        setValues((current) => ({
                            ...current,
                            discountAccount: label ? [label] : [],
                        }))
                    }
                    heightClassName="h-[36px]"
                />

                <TransactionFieldLabel label="Diskon" />
                <div className="max-w-[170px]">
                    <TextInput
                        value={values.discountAmount}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                discountAmount: event.target.value,
                            }))
                        }
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#111827]"
                    />
                </div>

                <TransactionFieldLabel label="Keterangan Diskon" />
                <textarea
                    value={values.discountNotes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            discountNotes: event.target.value,
                        }))
                    }
                    rows={3}
                    className="min-h-[56px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none"
                />

                <TransactionFieldLabel label="Departemen" />
                <ChipLookupField
                    values={values.department}
                    placeholder="Cari/Pilih..."
                    onRemove={() => {}}
                    searchLabel="Cari departemen"
                    heightClassName="h-[36px]"
                />
            </div>

            <div>
                <button
                    type="button"
                    className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#21539b]"
                    aria-label="Tambah diskon"
                >
                    <PlusIcon className="h-5 w-5 text-[#21539b]" />
                </button>
            </div>

            <div className="overflow-hidden rounded-[4px] border border-[#d1d8e4]">
                <DataTable wrapperClassName="border-none">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {discountColumns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName} px-2.5 text-base font-medium text-white ${
                                        column.align === 'right'
                                            ? 'text-right'
                                            : column.align === 'center'
                                              ? 'text-center'
                                              : 'text-left'
                                    }`.trim()}
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
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                >
                                    <DataTableCell className="px-2.5 text-center text-[#a8afbe]">
                                        <span className="inline-flex items-center justify-center">
                                            <TableActionIcon className="h-4 w-4" />
                                        </span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-base text-[#131a28]">
                                        <span className="block truncate">{row.account}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-right text-base text-[#131a28]">
                                        <span className="block truncate">{row.amount}</span>
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-[#dde1e8] bg-white">
                                <DataTableCell className="px-2.5 text-center text-[#a8afbe]">
                                    <span className="inline-flex items-center justify-center">
                                        <TableActionIcon className="h-4 w-4" />
                                    </span>
                                </DataTableCell>
                                <DataTableCell colSpan={2} className="px-2.5 py-6 text-center text-base text-[#131a28]">
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
