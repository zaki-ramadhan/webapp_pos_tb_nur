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

import { TRANSACTION_LINE_TITLE_CLASS_NAME } from './transactionStyles';

export function resolveTransactionAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}

export function TransactionDataTable({
    columns,
    rows,
    emptyLabel,
    minWidthClassName = 'min-w-[760px]',
    renderHeaderCell = null,
    renderCell = null,
    emptyLeadingCellContent = null,
    onRowClick = null,
    getRowClassName = null,
}) {
    const hasLeadingEmptyCell = columns[0]?.kind === 'spacer' && emptyLeadingCellContent !== null;

    return (
        <div className={minWidthClassName}>
            <DataTable wrapperClassName="border-[#d1d8e4]">
                <DataTableHeader className="bg-[#5f7690]">
                    <tr>
                        {columns.map((column) => (
                            <DataTableHead
                                key={column.id}
                                className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${resolveTransactionAlignClassName(column.align)}`.trim()}
                            >
                                {renderHeaderCell ? renderHeaderCell(column) : column.label}
                            </DataTableHead>
                        ))}
                    </tr>
                </DataTableHeader>

                <DataTableBody>
                    {rows.length ? (
                        rows.map((row, index) => {
                            const customRowClassName = getRowClassName?.(row, index) ?? '';
                            const clickable = typeof onRowClick === 'function';

                            return (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${customRowClassName}`.trim()}
                                    onClick={clickable ? () => onRowClick(row, index) : undefined}
                                >
                                    {columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-3 text-[15px] text-[#131a28] ${resolveTransactionAlignClassName(column.align)}`.trim()}
                                        >
                                            {renderCell
                                                ? renderCell({
                                                      row,
                                                      column,
                                                      index,
                                                  })
                                                : formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            );
                        })
                    ) : (
                        <DataTableRow className="bg-white">
                            {hasLeadingEmptyCell ? (
                                <DataTableCell className="px-3 text-center text-[#a8afbe]">
                                    {emptyLeadingCellContent}
                                </DataTableCell>
                            ) : null}
                            <DataTableCell
                                colSpan={columns.length - (hasLeadingEmptyCell ? 1 : 0)}
                                className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                            >
                                {emptyLabel}
                            </DataTableCell>
                        </DataTableRow>
                    )}
                </DataTableBody>
            </DataTable>
        </div>
    );
}

export function TransactionLineItemsSection({
    searchValue,
    onSearchChange,
    searchPlaceholder,
    title,
    columns,
    rows,
    emptyLabel,
    minWidthClassName = 'min-w-[760px]',
    titleRequired = true,
    showTitleSearchButton = false,
    searchReadOnly = false,
    searchInput = null,
    spacerHeaderContent = null,
    spacerCellContent = null,
    emptyLeadingCellContent = null,
}) {
    const hasRows = rows.length > 0;

    return (
        <div className={`flex flex-col ${hasRows ? 'min-h-[540px]' : 'min-h-[240px]'}`.trim()}>
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[560px]">
                    {searchInput ?? (
                        <TextInput
                            value={searchValue}
                            onChange={onSearchChange}
                            readOnly={searchReadOnly}
                            placeholder={searchPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    )}
                </div>

                <div className="flex items-center justify-end gap-3">
                    {showTitleSearchButton ? (
                        <button
                            type="button"
                            className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[4px] border border-[#cfd6e2] bg-white text-[#21539b]"
                            aria-label={`Cari ${title}`}
                        >
                            <SearchIcon className="h-5 w-5" />
                        </button>
                    ) : null}
                    <div className={TRANSACTION_LINE_TITLE_CLASS_NAME}>
                        {title}
                        {titleRequired ? <span className="text-[#ED3969]"> *</span> : null}
                    </div>
                </div>
            </div>

            <div className={`mt-4 overflow-x-auto ${hasRows ? 'min-h-0 flex-1' : ''}`.trim()}>
                <TransactionDataTable
                    columns={columns}
                    rows={rows}
                    emptyLabel={emptyLabel}
                    minWidthClassName={minWidthClassName}
                    emptyLeadingCellContent={emptyLeadingCellContent}
                    renderHeaderCell={(column) => (column.kind === 'spacer' ? spacerHeaderContent : column.label)}
                    renderCell={({ row, column }) =>
                        column.kind === 'spacer' ? spacerCellContent : formatTableTextValue(row[column.id])
                    }
                />
            </div>
        </div>
    );
}
