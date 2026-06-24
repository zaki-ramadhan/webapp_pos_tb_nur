import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { SearchIcon } from '@/features/workspace/shared/Icons';

export default function TransferFeeSection({ config, values, handlers = {} }) {
    return (
        <div className="flex min-h-[540px] flex-col">
            <div className="flex flex-col gap-3 border-b border-ui-border-medium pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[560px]">
                    <TextInput
                        value={values.feeLookup}
                        readOnly
                        placeholder={config.feeLookupPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-brand-dark" />}
                        className="h-[40px] rounded-[4px] border-ui-border"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                        onClick={handlers.onSelectFeeAccount}
                    />
                </div>

                <div className="text-right text-2xl font-normal text-brand-dark">{config.feeTitle}</div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <div className="min-w-[880px]">
                    <DataTable wrapperClassName="border-table-wrapper-border">
                        <DataTableHeader className="bg-table-header-bg">
                            <tr>
                                {config.feeTable.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white text-center`.trim()}
                                    >
                                        {column.label}
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {values.feeRows.length ? (
                                values.feeRows.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-ui-border-row transition hover:bg-workspace-hover-bg ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'} ${handlers.onEditFeeItem ? 'cursor-pointer' : ''}`.trim()}
                                        onClick={handlers.onEditFeeItem ? () => handlers.onEditFeeItem(row) : undefined}
                                    >
                                        {config.feeTable.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`text-left px-3 text-base text-text-workspace-dark`.trim()}
                                            >
                                                {formatTableTextValue(row[column.id])}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell colSpan={config.feeTable.columns.length} className="px-3 py-3 text-center text-base text-tab-view-active-text">
                                        {config.feeTable.emptyLabel}
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}
