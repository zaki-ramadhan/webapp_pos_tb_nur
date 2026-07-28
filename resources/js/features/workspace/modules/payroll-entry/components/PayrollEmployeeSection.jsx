import BackendLookupTextInput from '@/features/workspace/shared/BackendLookupTextInput';
import {
    TransactionDataTable,
    TransactionHeaderButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { SortIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

export function PayrollEmployeeSection({ config, values, setValues, onTake, handlers = {} }) {
    return (
        <div className="flex flex-col min-h-0">
            <div className="flex flex-col gap-3 pb-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="w-full sm:max-w-[360px]">
                        <BackendLookupTextInput
                            resource="employees"
                            value={values.employeeLookup}
                            placeholder={config.employeeLookupPlaceholder}
                            searchLabel="Cari karyawan"
                            getOptionLabel={(record) => record?.full_name ?? ''}
                            getOptionSearchText={(record) =>
                                [record?.full_name, record?.employee_code, record?.position]
                                    .filter(Boolean)
                                    .join(' ')
                            }
                            renderOption={(record) => (
                                <div className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-normal text-brand-dark">
                                        {record?.full_name ?? record?.name ?? ''}
                                    </span>
                                    <span className="mt-1 flex items-center justify-between gap-4 text-xs sm:text-[13px]">
                                        <span className="truncate text-brand-dark font-normal">
                                            {record?.employee_code ?? record?.code ?? String(record?.id ?? '')}
                                        </span>
                                    </span>
                                </div>
                            )}
                            onSelect={handlers.onSelectEmployee}
                            className="h-[40px]"
                        />
                    </div>

                    <TransactionHeaderButton
                        label={config.takeButtonLabel}
                        className="h-[38px] px-4 text-base"
                        onClick={onTake}
                    />
                </div>

                <div className="text-right text-2xl font-normal text-brand-dark">
                    {config.employeeSectionTitle} <span className="text-tab-active-border-t">*</span>
                </div>
            </div>

            <div className="mt-1.5 min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.employeeTable.columns}
                    rows={config.employeeTable.rows}
                    emptyLabel={config.employeeTable.emptyLabel}
                    minWidthClassName="min-w-[760px]"
                    onRowClick={handlers.onEditEmployeeRow}
                    getRowClassName={
                        handlers.onEditEmployeeRow
                            ? () => 'cursor-pointer transition hover:bg-workspace-hover-bg'
                            : undefined
                    }
                    renderHeaderCell={(column) =>
                        column.kind === 'spacer' ? (
                            <span className="flex justify-center">
                                <SortIcon className="h-3 w-3 text-white/55" />
                            </span>
                        ) : (
                            column.label
                        )
                    }
                    renderCell={({ row, column }) => formatTableTextValue(row[column.id], column)}
                />
            </div>
        </div>
    );
}
