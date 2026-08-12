import { useMemo } from 'react';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { SortIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

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
                                    className="px-3 py-2 text-center text-base text-black"
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

export default function DepartmentOpeningBalanceTab({ form, values, onChange }) {
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
