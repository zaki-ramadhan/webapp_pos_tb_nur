import { useEffect, useMemo, useRef, useState } from 'react';
import { openSourceDocument } from '@/features/workspace/backend/adapters/bankAdapters';
import RefreshButton from '@/features/workspace/shared/RefreshButton';
import BankLedgerTable from '@/features/workspace/modules/shared/BankLedgerTable';
import { TransactionToolbarIconButton, TransactionExportExcelButton, TransactionSwitchViewButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import {
    ChevronDownIcon,
    DownloadIcon,
    ExportIcon,
    RefreshIcon,
} from '@/features/workspace/shared/Icons';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import BankStatementFileImportModal from '@/features/workspace/modules/bank-inquiry/components/BankStatementFileImportModal';
import { getSmartlinkAccounts } from '@/features/workspace/modules/smartlink-ebanking/smartlinkStore';
import { exportToExcelXML } from '@/features/workspace/shared/exportUtils';
import { showSuccessToast, showWarningToast } from '@/components/feedback/toast';
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
import { loadInquiryFilter, saveInquiryFilter } from '@/features/workspace/shared/inquiryFilterPersistence';

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
    const [values, setValues] = useState(() => {
        const initial = buildInitialControlValues(controls);
        if (activePageId) {
            const saved = loadInquiryFilter(activePageId);
            if (saved) {
                return { ...initial, ...saved };
            }
        }
        return initial;
    });
    const keywordControl = controls.find((control) => control.type === 'search');
    const keyword = keywordControl ? values[keywordControl.id] ?? '' : '';
    const [isAlternativeView, setIsAlternativeView] = useState(false);
    const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const isBankStatement = activePageId === 'bank-statement';

    const expectedAccountNumber = useMemo(() => {
        const smartAccounts = getSmartlinkAccounts();
        const matched = smartAccounts.find(
            (acc) =>
                (values.account_id && String(acc.accountId) === String(values.account_id)) ||
                (keyword && (keyword.includes(acc.accountNumber) || keyword.includes(acc.serviceType) || keyword.includes(acc.accountRelation)))
        );
        if (matched?.accountNumber) return matched.accountNumber;
        if (keyword) {
            const match = keyword.match(/#([0-9\-\.]+)/) || keyword.match(/([0-9\-\.]{4,})/);
            if (match) return match[1];
        }
        return '';
    }, [keyword, values.account_id]);

    const handleOpenImport = () => {
        const hasAccountSelected = Boolean(keyword && keyword.trim());
        if (!hasAccountSelected) {
            showWarningToast({
                title: 'Pilih Bank Terlebih Dahulu',
                message: 'Silakan cari dan pilih kas/bank terlebih dahulu sebelum mengimpor rekening koran.',
            });
            return;
        }
        setIsImportModalOpen(true);
    };

    const handleConfirmExport = () => {
        setIsExportConfirmOpen(false);
        const sanitizedBankName = keyword ? keyword.replace(/[^a-zA-Z0-9]/g, '_') : 'semua';
        const filename = `rekening-koran-${sanitizedBankName}`;
        exportToExcelXML(resolvedColumns, filteredRows, filename);
    };

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
        setValues((currentValues) => {
            const nextValues = {
                ...currentValues,
                [controlId]: nextValue,
                ...(extra ? extra : {}),
            };
            if (activePageId) {
                saveInquiryFilter(activePageId, nextValues);
            }
            return nextValues;
        });
    }

    const hasRows = filteredRows.length > 0;

    const reloadAction = (config.actions ?? []).find((action) => action.id === 'reload');
    const exportAction = (config.actions ?? []).find((action) => action.id === 'export-excel');
    const helpAction = (config.actions ?? []).find((action) => action.id === 'help' || action.icon === 'idea' || action.tone === 'warning');
    const otherActions = (config.actions ?? []).filter(
        (action) =>
            action.id !== 'reload' &&
            action.id !== 'export-excel' &&
            action.id !== 'export' &&
            action.id !== 'import' &&
            action.id !== 'help' &&
            action.icon !== 'idea' &&
            action.tone !== 'warning'
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

                        {isBankStatement ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleOpenImport}
                                    className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue shadow-none transition hover:bg-brand-blue-light cursor-pointer active:scale-[0.98]"
                                    aria-label="Impor data"
                                >
                                    <DownloadIcon className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsExportConfirmOpen(true)}
                                    className="inline-flex h-[40px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-2.5 text-brand-blue shadow-none transition hover:bg-brand-blue-light cursor-pointer active:scale-[0.98]"
                                    aria-label="Ekspor data"
                                >
                                    <ExportIcon className="h-4 w-4" />
                                    <ChevronDownIcon className="h-3 w-3" />
                                </button>
                            </>
                        ) : (
                            exportAction ? (
                                <TransactionExportExcelButton
                                    columns={config.table.columns}
                                    rows={filteredRows}
                                    filename={config.label || 'histori-bank'}
                                    label={exportAction.label}
                                />
                            ) : null
                        )}

                        {selectControls.map((control) => (
                            <div key={control.id} className={control.wrapperClassName ?? ''}>
                                <InquiryControl control={control} value={values[control.id] ?? ''} onChange={handleChange} />
                            </div>
                        ))}
                    </div>

                    {otherActions.length || helpAction ? (
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
                            {helpAction ? (
                                <InquiryActionButton
                                    key={helpAction.id}
                                    action={helpAction}
                                    onClick={undefined}
                                />
                            ) : null}
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
                                            <DataTableCell colSpan={resolvedColumns.length} className="px-3 py-2 text-center text-base text-black">
                                                {loading ? 'Memuat data...' : (config.table.emptyLabel ?? 'Belum ada data')}
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
                                            <DataTableCell colSpan={resolvedColumns.length} className="px-3 py-2 text-center text-base text-black">
                                                {loading ? 'Memuat data...' : (config.table.emptyLabel ?? 'Belum ada data')}
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

            <ConfirmationModal
                open={isExportConfirmOpen}
                title="Konfirmasi"
                message="Sistem akan mengekspor semua data Rekening Koran. Anda setuju?"
                confirmLabel="Ya"
                cancelLabel="Batal"
                onClose={() => setIsExportConfirmOpen(false)}
                onConfirm={handleConfirmExport}
                actionsAlign="end"
                actionsOrder="confirm-first"
                actionsGap="gap-2"
                cancelVariant="secondary"
                hideCloseButton
                maxWidthClassName="max-w-[590px]"
            />

            {isBankStatement ? (
                <BankStatementFileImportModal
                    open={isImportModalOpen}
                    bankName={keyword}
                    expectedAccountNumber={expectedAccountNumber}
                    accountId={values.account_id}
                    onClose={() => setIsImportModalOpen(false)}
                    onImportSuccess={(data) => {
                        setIsImportModalOpen(false);
                        onRefresh?.();
                        showSuccessToast({
                            title: 'Impor Berhasil',
                            message: `${data.count || data.rows?.length || 'Semua'} baris mutasi bank berhasil dimuat.`,
                        });
                    }}
                />
            ) : null}
        </div>
    );
}
