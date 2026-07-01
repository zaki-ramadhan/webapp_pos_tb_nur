import { useEffect, useMemo } from 'react';
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
import { useColumnVisibility, getTableSchemaKey, tableRegistry, cleanHeaderLabel, getColumnMinWidth } from '@/features/workspace/shared/columnVisibility';

import { TRANSACTION_LINE_TITLE_CLASS_NAME } from './transactionStyles';

export function resolveTransactionAlignClassName(align) {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
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
    showNumbering = true,
    cellClassName = '',
}) {
    const cleanedColumns = useMemo(() => {
        return (columns ?? []).map(col => ({
            ...col,
            label: cleanHeaderLabel(col.label)
        }));
    }, [columns]);

    const schemaKey = getTableSchemaKey(cleanedColumns);
    const [visibleColumnIds] = useColumnVisibility(schemaKey, cleanedColumns);

    const activeShowNumbering = showNumbering && rows.length > 0;

    const visibleColumns = useMemo(() => {
        const filtered = cleanedColumns.filter((column) => visibleColumnIds.includes(column.id));
        if (rows.length === 0) {
            return filtered.filter(col => col.kind !== 'spacer' && col.id !== 'spacer' && col.id !== 'statusIcon');
        }
        return filtered;
    }, [cleanedColumns, visibleColumnIds, rows.length]);

    useEffect(() => {
        const activeRes = (typeof window !== 'undefined' ? window.__activePageId : null);
        tableRegistry.setActiveTable(cleanedColumns, rows, activeRes);
        return () => {
            if (tableRegistry.activeTable?.columns === cleanedColumns) {
                tableRegistry.setActiveTable(null, null, null);
            }
        };
    }, [cleanedColumns, rows]);

    const hasLeadingEmptyCell = visibleColumns[0]?.kind === 'spacer' && emptyLeadingCellContent !== null;

    const cleanedMinWidthClassName = (minWidthClassName ?? '').replace(/\b(?:[a-z-]*:)?min-w-\[[^\]]+\]/g, '').trim();

    return (
        <div className={cleanedMinWidthClassName || 'w-full'}>
            <DataTable wrapperClassName="border-table-wrapper-border">
                <DataTableHeader className="bg-table-header-bg">
                    <tr>
                        {activeShowNumbering && (
                            <DataTableHead className="w-[50px] px-3 text-center text-sm font-normal text-white">
                                No.
                            </DataTableHead>
                        )}
                        {visibleColumns.map((column) => {
                            const minWidth = getColumnMinWidth(column.label);
                            return (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-sm font-normal text-white text-center`.trim()}
                                    style={minWidth ? { minWidth } : undefined}
                                >
                                    {renderHeaderCell
                                        ? renderHeaderCell({
                                              ...column,
                                              align: column.align === 'right' ? 'left' : column.align,
                                          })
                                        : column.label}
                                </DataTableHead>
                            );
                        })}
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
                                    className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'} ${customRowClassName}`.trim()}
                                    onClick={clickable ? () => onRowClick(row, index) : undefined}
                                >
                                    {activeShowNumbering && (
                                        <DataTableCell className={`px-3 text-center text-sm text-table-row-number ${cellClassName}`.trim()}>
                                            {index + 1}
                                        </DataTableCell>
                                    )}
                                    {visibleColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-3 text-sm text-text-workspace-dark ${resolveTransactionAlignClassName(column.align)} ${cellClassName}`.trim()}
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
                                <DataTableCell className="px-3 text-center text-text-workspace-inactive">
                                    {emptyLeadingCellContent}
                                </DataTableCell>
                            ) : null}
                            <DataTableCell
                                colSpan={visibleColumns.length - (hasLeadingEmptyCell ? 1 : 0) + (activeShowNumbering ? 1 : 0)}
                                className="px-3 py-3 text-center text-sm text-text-workspace-dark"
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
    spacerHeaderContent = 'No.',
    spacerCellContent = ({ index }) => <span className="text-center text-sm text-table-row-number block w-full">{index + 1}</span>,
    emptyLeadingCellContent = <span className="text-center text-sm text-text-workspace-inactive block w-full">-</span>,
    onRowClick = null,
    getRowClassName = null,
    cellClassName = '',
    searchWrapperClassName = 'sm:max-w-[380px]',
}) {
    const hasRows = rows.length > 0;

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-center sm:justify-between">
                <div className={`min-w-0 flex-1 ${searchWrapperClassName}`.trim()}>
                    {searchInput ?? (
                        <TextInput
                            value={searchValue}
                            onChange={onSearchChange}
                            readOnly={searchReadOnly}
                            placeholder={searchPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-brand-dark" />}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    )}
                </div>

                <div className="flex shrink-0 items-center justify-end gap-3">
                    {showTitleSearchButton ? (
                        <button
                            type="button"
                            className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[4px] border border-ui-border bg-white text-brand-blue-accent"
                            aria-label={`Cari ${title}`}
                        >
                            <SearchIcon className="h-5 w-5" />
                        </button>
                    ) : null}
                    <div className={`${TRANSACTION_LINE_TITLE_CLASS_NAME} inline-flex items-center gap-1`}>
                        {title}
                        {titleRequired ? <span className="text-tab-active-border-t"> *</span> : null}
                    </div>
                </div>
            </div>

            <div className={`mt-1 overflow-x-auto ${hasRows ? 'min-h-0 flex-1' : ''}`.trim()}>
                <TransactionDataTable
                    columns={columns}
                    rows={rows}
                    emptyLabel={emptyLabel}
                    minWidthClassName={minWidthClassName}
                    emptyLeadingCellContent={emptyLeadingCellContent}
                    onRowClick={onRowClick}
                    getRowClassName={getRowClassName}
                    showNumbering={false}
                    renderHeaderCell={(column) => (column.kind === 'spacer' ? spacerHeaderContent : column.label)}
                    renderCell={({ row, column, index }) =>
                        column.kind === 'spacer'
                            ? spacerCellContent({ row, column, index })
                            : formatTableTextValue(row[column.id])
                    }
                    cellClassName={cellClassName}
                />
            </div>
        </div>
    );
}
