import { useEffect, useMemo, useRef, useState } from 'react';
import { openSourceDocument } from '@/features/workspace/backend/adapters/bankAdapters';
import RefreshButton from '@/features/workspace/shared/RefreshButton';
import BankLedgerTable from '@/features/workspace/modules/shared/BankLedgerTable';
import { TransactionToolbarIconButton, TransactionExportExcelButton, TransactionSwitchViewButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import {
    RefreshIcon,
} from '@/features/workspace/shared/Icons';
import Pagination from '@/components/ui/Pagination';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import useTableSort, { sortRows } from '@/features/workspace/shared/useTableSort';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';
import { InquiryActionButton, InquiryControl } from './components/InquiryControls';

const CONTENT_MIN_HEIGHT_CLASS_NAME = 'min-h-[280px] sm:min-h-[360px] xl:min-h-[60vh]';

function buildInitialControlValues(controls) {
    return (controls ?? []).reduce((result, control) => {
        if (control.id) {
            result[control.id] = control.value ?? '';
        }

        return result;
    }, {});
}

export default function InquiryWorkspaceView({
    pageId = '',
    config,
    rows = null,
    loading = false,
    error = '',
    onRefresh = null,
    onValuesChange = null,
    pagination = null,
}) {
    const activePageId = pageId || config.id || '';
    const controls = config.controls ?? [];
    const hasSidePanel = config.sidePanel?.hidden !== true;
    const [values, setValues] = useState(() => buildInitialControlValues(controls));
    const keywordControl = controls.find((control) => control.type === 'search');
    const keyword = keywordControl ? values[keywordControl.id] ?? '' : '';
    const [isAlternativeView, setIsAlternativeView] = useState(false);

    const onValuesChangeRef = useRef(onValuesChange);
    useEffect(() => {
        onValuesChangeRef.current = onValuesChange;
    });

    useEffect(() => {
        onValuesChangeRef.current?.(values);
    }, [values]);

    const filteredRows = useMemo(() => {
        if (rows !== null && rows !== undefined) {
            return rows;
        }

        const sourceRows = config.table.rows ?? [];
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return sourceRows;
        }

        const searchKeys =
            config.table.searchKeys?.length
                ? config.table.searchKeys
                : config.table.columns.map((column) => column.id);

        return sourceRows.filter((row) =>
            searchKeys.some((key) =>
                String(row[key] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            ),
        );
    }, [config.table.columns, config.table.rows, config.table.searchKeys, keyword, rows]);

    function handleChange(controlId, nextValue, extra = null) {
        setValues((currentValues) => ({
            ...currentValues,
            [controlId]: nextValue,
            ...(extra ? extra : {}),
        }));
    }

    const hasRows = filteredRows.length > 0;

    const reloadAction = (config.actions ?? []).find((action) => action.id === 'reload');
    const exportAction = (config.actions ?? []).find((action) => action.id === 'export-excel');
    const helpAction = (config.actions ?? []).find((action) => action.id === 'help' || action.icon === 'idea' || action.tone === 'warning');
    const otherActions = (config.actions ?? []).filter(
        (action) => action.id !== 'reload' && action.id !== 'export-excel' && action.id !== 'help' && action.icon !== 'idea' && action.tone !== 'warning'
    );

    const searchControl = controls.find(c => c.type === 'search');
    const dateControls = controls.filter(c => c.type === 'date' || c.type === 'label');
    const selectControls = controls.filter(c => c.type === 'select');

    const isServerSort = Boolean(pagination?.onSort || config.table?.onSort);
    const { sortKey, sortDir, handleSort: handleClientSort } = useTableSort(filteredRows);
    const activeSortKey = isServerSort ? (pagination?.sortBy || config.table?.sortBy || sortKey) : sortKey;
    const activeSortDir = isServerSort ? (pagination?.sortDirection || config.table?.sortDirection || sortDir) : sortDir;

    const handleSortClick = (columnId) => {
        const nextDir = activeSortKey === columnId ? (activeSortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        if (isServerSort) {
            const onSort = pagination?.onSort || config.table?.onSort;
            onSort?.(columnId, nextDir);
        }
        handleClientSort(columnId, nextDir);
    };

    const sortedRows = useMemo(() => {
        if (activeSortKey) {
            return sortRows(filteredRows, activeSortKey, activeSortDir);
        }
        return filteredRows;
    }, [filteredRows, activeSortKey, activeSortDir]);
    const { handleResizeStart, getCellStyle } = useColumnResize(config.id || 'bank-inquiry');

    const resolvedColumns = useMemo(() => {
        return config.table.columns.map((col) => {
            if (isAlternativeView) {
                if (col.id === 'mutation') {
                    return { ...col, id: 'debit', label: 'Debit' };
                }
                if (col.id === 'type') {
                    return { ...col, id: 'credit', label: 'Kredit' };
                }
            }
            return col;
        });
    }, [config.table.columns, isAlternativeView]);

    const isAccessRestricted = Boolean(
        (error && String(error).toLowerCase().includes('hak akses'))
    );

    const restrictionText = 'Anda tidak memiliki hak akses ke halaman ini. Hubungi Owner untuk menambahkan akses.';

    return (
        <div className="min-h-full">
            <fieldset disabled={isAccessRestricted} className="w-full border-0 p-0 m-0 disabled:opacity-60 disabled:pointer-events-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
                        {searchControl ? (
                            <div className={searchControl.wrapperClassName ?? ''}>
                                <InquiryControl control={searchControl} value={values[searchControl.id] ?? ''} onChange={handleChange} />
                            </div>
                        ) : null}

                        {dateControls.map((control, idx) => (
                            <div key={control.id || `date-ctrl-${idx}`} className={control.wrapperClassName ?? ''}>
                                <InquiryControl control={control} value={values[control.id] ?? ''} onChange={handleChange} />
                            </div>
                        ))}

                        {reloadAction ? (
                            <RefreshButton
                                label="Muat ulang"
                                onClick={onRefresh}
                                loading={loading}
                            />
                        ) : null}

                        {exportAction ? (
                            <TransactionExportExcelButton
                                columns={config.table.columns}
                                rows={filteredRows}
                                filename={config.label || 'histori-bank'}
                                label={exportAction.label}
                            />
                        ) : null}

                        {selectControls.map((control) => (
                            <div key={control.id} className={control.wrapperClassName ?? ''}>
                                <InquiryControl control={control} value={values[control.id] ?? ''} onChange={handleChange} />
                            </div>
                        ))}
                    </div>

                    {otherActions.length ? (
                        <div className="flex flex-wrap items-center gap-2">
                            {otherActions.map((action) => {
                                if (action.type === 'switch-view') {
                                    return (
                                        <TransactionSwitchViewButton
                                            key={action.id}
                                            active={isAlternativeView}
                                            onClick={() => setIsAlternativeView((prev) => !prev)}
                                            label={action.label}
                                        />
                                    );
                                }
                                return (
                                    <InquiryActionButton
                                        key={action.id}
                                        action={action}
                                        onClick={undefined}
                                    />
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            </fieldset>

            {error && !isAccessRestricted ? (
                <div className="rounded-[6px] border border-danger-border bg-surface px-3 py-2 text-sm text-red-850 mt-3">
                    {error}
                </div>
            ) : null}

            {hasSidePanel ? (
                <div
                    className="grid min-h-0 flex-1 gap-3 mt-3 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_380px]"
                >
                    <div className="min-w-0 overflow-hidden flex flex-col flex-1">
                        <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
                            <DataTable className={config.table.tableClassName ?? 'min-w-[680px] md:min-w-[780px]'} wrapperClassName="flex-1 min-h-0 overflow-auto border-table-wrapper-border">
                                <DataTableHeader className="bg-table-header-bg">
                                    <tr>
                                        {sortedRows.length > 0 && (
                                            <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-light text-white">
                                                No.
                                            </DataTableHead>
                                        )}
                                        {resolvedColumns.map((column) => (
                                            <SortableTableHeaderCell
                                                key={column.id}
                                                label={column.label}
                                                align={column.align}
                                                widthClassName={column.widthClassName}
                                                sortable={column.sortable !== false}
                                                sortDirection={activeSortKey === column.id ? activeSortDir : null}
                                                onSort={column.sortable !== false ? () => handleSortClick(column.id) : null}
                                                style={getCellStyle(column.id, { position: 'relative' })}
                                                onResizeStart={(e) => handleResizeStart(e, column.id)}
                                            />
                                        ))}
                                    </tr>
                                </DataTableHeader>

                                <DataTableBody>
                                    {sortedRows.length ? (
                                        sortedRows.map((row, index) => {
                                            const offset = pagination ? pagination.from - 1 : 0;
                                            const displayIndex = offset + index + 1;
                                            const isClickable = Boolean(row.document_id && row.document_type);
                                            return (
                                                <DataTableRow
                                                    key={row.id || index}
                                                    onClick={isClickable ? () => openSourceDocument(row) : undefined}
                                                    className={`${isClickable ? 'cursor-pointer' : ''} border-ui-border-row transition hover:bg-workspace-hover-bg ${
                                                        index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'
                                                    }`.trim()}
                                                >
                                                    <DataTableCell className="px-3 text-center text-base text-table-row-number">
                                                        {displayIndex}
                                                    </DataTableCell>
                                                    {resolvedColumns.map((column) => {
                                                        let cellContent = null;
                                                        const val = row[column.id];

                                                        if (column.id === 'action' || column.cell) {
                                                            cellContent = column.cell ? column.cell(row) : null;
                                                        } else if (column.id === 'sourceNumber') {
                                                            cellContent = (
                                                                <span className="text-slate-900 font-normal">
                                                                    {val || '-'}
                                                                </span>
                                                            );
                                                        } else if (column.id === 'balance' || column.id === 'mutation') {
                                                            const num = parseNumericInput(val);
                                                            const formattedVal = formatTableTextValue(val, column);
                                                            if (num < 0) {
                                                                cellContent = <span className="text-red-600">{formattedVal}</span>;
                                                            } else {
                                                                cellContent = <span className="text-slate-700">{formattedVal}</span>;
                                                            }
                                                        } else {
                                                            cellContent = formatTableTextValue(val, column);
                                                        }

                                                        return (
                                                            <DataTableCell
                                                                key={column.id}
                                                                className={`px-2.5 text-base text-text-workspace-dark ${
                                                                    column.align === 'right' ? 'text-right' : 
                                                                    column.align === 'center' ? 'text-center' : 'text-left'
                                                                }`.trim()}
                                                                style={getCellStyle(column.id)}
                                                                onResizeStart={(e) => handleResizeStart(e, column.id)}
                                                            >
                                                                {cellContent}
                                                            </DataTableCell>
                                                        );
                                                    })}
                                                </DataTableRow>
                                            );
                                        })
                                    ) : (
                                        <DataTableRow className="bg-white">
                                            <DataTableCell colSpan={resolvedColumns.length + 1} className="px-3 py-2 text-center text-base text-black">
                                                {loading ? 'Memuat data...' : (config.table.emptyLabel ?? 'Tidak ada data')}
                                            </DataTableCell>
                                        </DataTableRow>
                                    )}
                                </DataTableBody>
                            </DataTable>
                        </div>

                        {pagination ? (
                            <Pagination
                                page={pagination.page}
                                perPage={pagination.perPage}
                                total={pagination.total}
                                lastPage={pagination.lastPage}
                                from={pagination.from}
                                to={pagination.to}
                                onPageChange={pagination.onPageChange}
                                onPerPageChange={pagination.onPerPageChange}
                                className="mt-3"
                            />
                        ) : null}
                    </div>

                    <div
                        className={`overflow-hidden rounded-[6px] border border-ui-border-medium bg-white shadow-card-light ${config.sidePanel?.className ?? CONTENT_MIN_HEIGHT_CLASS_NAME}`.trim()}
                    >
                        {config.sidePanel?.content ? (
                            <div className="h-full">{config.sidePanel.content}</div>
                        ) : null}
                    </div>
                </div>
            ) : (
                <>
                    <div className="mt-3 min-h-0 overflow-x-auto">
                        {activePageId === 'bank-history' || activePageId === 'account-history' ? (
                            <BankLedgerTable
                                rows={isAccessRestricted ? [] : (rows ?? [])}
                                loading={loading}
                                startDate={values.startDate ?? ''}
                                emptyLabel={isAccessRestricted ? restrictionText : config.table.emptyLabel}
                                className={config.table.tableClassName ?? 'min-w-[1200px]'}
                            />
                        ) : (
                            <DataTable className={config.table.tableClassName ?? 'min-w-[680px] md:min-w-[780px]'} wrapperClassName="border-table-wrapper-border">
                                <DataTableHeader className="bg-table-header-bg">
                                    <tr>
                                        {sortedRows.length > 0 && (
                                            <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-light text-white">
                                                No.
                                            </DataTableHead>
                                        )}
                                        {resolvedColumns.map((column) => (
                                            <SortableTableHeaderCell
                                                key={column.id}
                                                label={column.label}
                                                align={column.align}
                                                widthClassName={column.widthClassName}
                                                sortable={column.sortable !== false}
                                                sortDirection={activeSortKey === column.id ? activeSortDir : null}
                                                onSort={column.sortable !== false ? () => handleSortClick(column.id) : null}
                                                style={getCellStyle(column.id, { position: 'relative' })}
                                                onResizeStart={(e) => handleResizeStart(e, column.id)}
                                            />
                                        ))}
                                    </tr>
                                </DataTableHeader>

                                <DataTableBody>
                                    {sortedRows.length ? (
                                        sortedRows.map((row, index) => {
                                            const offset = pagination ? pagination.from - 1 : 0;
                                            const displayIndex = offset + index + 1;
                                            const isClickable = Boolean(row.document_id && row.document_type);
                                            return (
                                                <DataTableRow
                                                    key={row.id || index}
                                                    onClick={isClickable ? () => openSourceDocument(row) : undefined}
                                                    className={`${isClickable ? 'cursor-pointer' : ''} border-ui-border-row transition hover:bg-workspace-hover-bg ${
                                                        index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'
                                                    }`.trim()}
                                                >
                                                    <DataTableCell className="px-3 text-center text-base text-table-row-number">
                                                        {displayIndex}
                                                    </DataTableCell>
                                                    {resolvedColumns.map((column) => {
                                                        let cellContent = null;
                                                        const val = row[column.id];

                                                        if (column.id === 'action' || column.cell) {
                                                            cellContent = column.cell ? column.cell(row) : null;
                                                        } else if (column.id === 'sourceNumber') {
                                                            cellContent = (
                                                                <span className="text-slate-900 font-normal">
                                                                    {val || '-'}
                                                                </span>
                                                            );
                                                        } else if (column.id === 'balance' || column.id === 'mutation') {
                                                            const num = parseNumericInput(val);
                                                            const formattedVal = formatTableTextValue(val, column);
                                                            if (num < 0) {
                                                                cellContent = <span className="text-red-600">{formattedVal}</span>;
                                                            } else {
                                                                cellContent = <span className="text-slate-700">{formattedVal}</span>;
                                                            }
                                                        } else {
                                                            cellContent = formatTableTextValue(val, column);
                                                        }

                                                        return (
                                                            <DataTableCell
                                                                key={column.id}
                                                                className={`px-2.5 text-base text-text-workspace-dark ${
                                                                    column.align === 'right' ? 'text-right' : 
                                                                    column.align === 'center' ? 'text-center' : 'text-left'
                                                                }`.trim()}
                                                                style={getCellStyle(column.id)}
                                                                onResizeStart={(e) => handleResizeStart(e, column.id)}
                                                            >
                                                                {cellContent}
                                                            </DataTableCell>
                                                        );
                                                    })}
                                                </DataTableRow>
                                            );
                                        })
                                    ) : (
                                        <DataTableRow className="bg-white">
                                            <DataTableCell colSpan={resolvedColumns.length + 1} className="px-3 py-2 text-center text-base text-black">
                                                {loading ? 'Memuat data...' : (config.table.emptyLabel ?? 'Tidak ada data')}
                                            </DataTableCell>
                                        </DataTableRow>
                                    )}
                                </DataTableBody>
                            </DataTable>
                        )}
                    </div>

                    {pagination ? (
                        <Pagination
                            page={pagination.page}
                            perPage={pagination.perPage}
                            total={pagination.total}
                            lastPage={pagination.lastPage}
                            from={pagination.from}
                            to={pagination.to}
                            onPageChange={pagination.onPageChange}
                            onPerPageChange={pagination.onPerPageChange}
                            className="mt-3"
                        />
                    ) : null}
                </>
            )}
        </div>
    );
}
