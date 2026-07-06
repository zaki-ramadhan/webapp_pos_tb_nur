import { useEffect, useMemo, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { TransactionDateInput, TransactionToolbarIconButton, TransactionExportExcelButton, TransactionSwitchViewButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    ColumnsIcon,
    DownloadIcon,
    ExternalLinkIcon,
    IdeaIcon,
    RefreshIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';
import SelectField from '@/components/ui/SelectField';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import useTableSort from '@/features/workspace/shared/useTableSort';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';

const CONTENT_MIN_HEIGHT_CLASS_NAME = 'min-h-[280px] sm:min-h-[360px] xl:min-h-[60vh]';

function buildInitialControlValues(controls) {
    return (controls ?? []).reduce((result, control) => {
        if (control.id) {
            result[control.id] = control.value ?? '';
        }

        return result;
    }, {});
}

function resolveActionIcon(action) {
    switch (action.icon) {
        case 'external-link':
            return <ExternalLinkIcon className="h-4.5 w-4.5" />;
        case 'idea':
            return <IdeaIcon className="h-4.5 w-4.5" />;
        case 'transfer':
            return <NavigationIcon type="transfer" className="h-4.5 w-4.5 text-current" />;
        case 'download':
            return <DownloadIcon className="h-4.5 w-4.5" />;
        case 'columns':
            return <ColumnsIcon className="h-4.5 w-4.5" />;
        case 'link':
        default:
            return <RefreshIcon className="h-4.5 w-4.5" />;
    }
}

function InquiryActionButton({ action, onClick }) {
    const toneClassName =
        action.tone === 'warning'
            ? 'border-transparent bg-warning text-white hover:bg-warning'
            : 'border-brand-blue-border bg-white text-brand-blue hover:bg-bg-brand-blue-toggled';

    return (
        <Button
            aria-label={action.label}
            title={action.label}
            onClick={onClick}
            variant="secondary"
            size="sm"
            className={`h-[40px] min-w-[40px] px-3 font-normal active:scale-[0.98] focus:outline-none ${toneClassName}`.trim()}
        >
            {resolveActionIcon(action)}
        </Button>
    );
}

function InquiryControl({ control, value, onChange }) {
    if (control.type === 'select') {
        return (
            <SelectField
                value={value}
                onChange={(event) => onChange(control.id, event.target.value)}
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                selectClassName="text-sm text-brand-dark sm:text-xs sm:text-sm"
            >
                {(control.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </SelectField>
        );
    }

    if (control.type === 'label') {
        return <span className={`text-sm text-text-darkest sm:text-base ${control.className ?? ''}`.trim()}>{control.label}</span>;
    }

    if (control.type === 'date') {
        return (
            <TransactionDateInput
                value={value}
                onChange={(nextValue) => onChange(control.id, nextValue)}
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                inputClassName="text-sm text-brand-dark py-1 h-full"
                trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
            />
        );
    }

    if (control.type === 'search') {
        return (
            <AccountLookupTextInput
                id={control.id}
                value={value}
                placeholder={control.placeholder ?? 'Cari/Pilih...'}
                searchLabel="Cari kas/bank"
                dialogTitle="Pilih Kas/Bank"
                queryParams={{ account_type: 'Cash/Bank' }}
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                inputClassName="text-sm text-brand-dark py-1 h-full"
                trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
                onSelectAccount={(record, label) => {
                    onChange(control.id, label);
                }}
            />
        );
    }

    return (
        <TextInput
            value={value}
            onChange={(event) => onChange(control.id, event.target.value)}
            placeholder={control.placeholder ?? ''}
            trailing={<SearchIcon className="h-5 w-5 text-text-darkest" />}
            className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
            inputClassName="text-sm text-brand-dark sm:text-xs sm:text-sm"
            trailingClassName="px-3"
        />
    );
}

export default function InquiryWorkspaceView({
    config,
    rows = null,
    loading = false,
    error = '',
    onRefresh = null,
    onValuesChange = null,
    pagination = null,
}) {
    const controls = config.controls ?? [];
    const hasSidePanel = config.sidePanel?.hidden !== true;
    const [values, setValues] = useState(() => buildInitialControlValues(controls));
    const keywordControl = controls.find((control) => control.type === 'search');
    const keyword = keywordControl ? values[keywordControl.id] ?? '' : '';
    const [isAlternativeView, setIsAlternativeView] = useState(false);

    useEffect(() => {
        onValuesChange?.(values);
    }, [onValuesChange, values]);

    const filteredRows = useMemo(() => {
        const sourceRows = rows ?? config.table.rows ?? [];
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

    function handleChange(controlId, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [controlId]: nextValue,
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

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);
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

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
                    {searchControl ? (
                        <div className={searchControl.wrapperClassName ?? ''}>
                            <InquiryControl control={searchControl} value={values[searchControl.id] ?? ''} onChange={handleChange} />
                        </div>
                    ) : null}

                    {dateControls.length ? (
                        <div className="flex items-center gap-1 shrink-0">
                            {dateControls.map((control, index) => (
                                <div key={control.id ?? `control-date-${index}`} className={control.type === 'label' ? 'px-0.5 text-center text-sm text-text-darkest shrink-0' : 'w-[140px] sm:w-[155px] shrink-0'}>
                                    <InquiryControl control={control} value={control.id ? values[control.id] ?? '' : ''} onChange={handleChange} />
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {reloadAction ? (
                        <TransactionToolbarIconButton
                            label={reloadAction.label}
                            onClick={onRefresh}
                        >
                            <RefreshIcon className="h-4 w-4" />
                        </TransactionToolbarIconButton>
                    ) : null}

                    {exportAction ? (
                        <TransactionExportExcelButton
                            columns={config.table.columns}
                            rows={filteredRows}
                            filename={config.label || 'histori-bank'}
                            label={exportAction.label}
                        />
                    ) : null}
                </div>

                {otherActions.length ? (
                    <div className="flex items-center gap-2">
                        {otherActions.map((action) => {
                            if (action.id === 'switch-view') {
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

            {error ? (
                <div className="rounded-[6px] border border-danger-border bg-surface px-3 py-2 text-sm text-red-850 mt-3">
                    {error}
                </div>
            ) : null}

            <div
                className={`grid min-h-0 flex-1 gap-3 mt-3 ${
                    hasSidePanel ? 'xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_380px]' : ''
                }`.trim()}
            >
                <div className="min-w-0 overflow-hidden flex flex-col">
                    <div className="min-h-0 overflow-x-auto">
                        <DataTable className={config.table.tableClassName ?? 'min-w-[680px] md:min-w-[780px]'} wrapperClassName="border-table-wrapper-border">
                            <DataTableHeader className="bg-table-header-bg">
                                <tr>
                                    {sortedRows.length > 0 && (
                                        <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-normal text-white">
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
                                            sortDirection={sortKey === column.id ? sortDir : null}
                                            onSort={() => handleSort(column.id)}
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
                                        return (
                                            <DataTableRow
                                                key={row.id || index}
                                                className={`cursor-pointer border-ui-border-row transition hover:bg-workspace-hover-bg ${
                                                    index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'
                                                }`.trim()}
                                            >
                                                <DataTableCell className="px-3 text-center text-base text-table-row-number">
                                                    {displayIndex}
                                                </DataTableCell>
                                                {resolvedColumns.map((column) => {
                                                    let cellContent = null;
                                                    const val = row[column.id];

                                                    if (column.id === 'type') {
                                                        const valStr = String(val || '').toLowerCase();
                                                        if (valStr.includes('debit') || valStr.includes('db') || valStr.includes('dr')) {
                                                            cellContent = <span className="text-slate-700">Dr</span>;
                                                        } else if (valStr.includes('credit') || valStr.includes('cr') || valStr.includes('kredit')) {
                                                            cellContent = <span className="text-slate-700">Cr</span>;
                                                        } else {
                                                            cellContent = formatTableTextValue(val, column);
                                                        }
                                                    } else if (column.id === 'mutation') {
                                                        const typeVal = String(row['type'] || '').toLowerCase();
                                                        const isCredit = typeVal.includes('credit') || typeVal.includes('cr') || typeVal.includes('kredit');
                                                        const formattedVal = formatTableTextValue(val, column);
                                                        if (isCredit) {
                                                            cellContent = <span className="text-rose-600">{formattedVal}</span>;
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
                                        <DataTableCell colSpan={resolvedColumns.length + 1} className="px-3 py-3 text-center text-base text-text-workspace-dark">
                                            {loading ? 'Memuat data...' : (config.table.emptyLabel ?? 'Belum ada data')}
                                        </DataTableCell>
                                    </DataTableRow>
                                )}
                            </DataTableBody>
                        </DataTable>
                    </div>

                    {!hasRows ? (
                        <div className={`border-t border-table-row-border bg-white ${config.table.emptySpaceClassName ?? CONTENT_MIN_HEIGHT_CLASS_NAME}`.trim()} />
                    ) : null}

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

                {hasSidePanel ? (
                    <div
                        className={`overflow-hidden rounded-[6px] border border-ui-border-medium bg-white shadow-card-light ${config.sidePanel?.className ?? CONTENT_MIN_HEIGHT_CLASS_NAME}`.trim()}
                    >
                        {config.sidePanel?.content ? (
                            <div className="h-full">{config.sidePanel.content}</div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
