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
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[560px]">
                    <TextInput
                        value={values.feeLookup}
                        readOnly
                        placeholder={config.feeLookupPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        onClick={handlers.onSelectFeeAccount}
                    />
                </div>

                <div className="text-right text-2xl font-normal text-[#1f2436]">{config.feeTitle}</div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <div className="min-w-[880px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {config.feeTable.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${column.align === 'right' ? 'text-right' : 'text-left'}`.trim()}
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
                                        className={`border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${handlers.onEditFeeItem ? 'cursor-pointer' : ''}`.trim()}
                                        onClick={handlers.onEditFeeItem ? () => handlers.onEditFeeItem(row) : undefined}
                                    >
                                        {config.feeTable.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-3 text-base text-[#131a28]`.trim()}
                                            >
                                                {formatTableTextValue(row[column.id])}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell colSpan={config.feeTable.columns.length} className="px-3 py-3 text-center text-base text-[#6b7280]">
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
