import { useEffect, useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    ExternalLinkIcon,
    IdeaIcon,
    RefreshIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';
import SelectField from '@/components/ui/SelectField';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';

const CONTENT_MIN_HEIGHT_CLASS_NAME = 'min-h-[280px] sm:min-h-[360px] xl:min-h-[60vh]';

function buildInitialControlValues(controls) {
    return (controls ?? []).reduce((result, control) => {
        if (control.id) {
            result[control.id] = control.value ?? '';
        }

        return result;
    }, {});
}

function resolveCellAlignClassName(align) {
    return 'text-left';
}

function resolveActionIcon(action) {
    switch (action.icon) {
        case 'external-link':
            return <ExternalLinkIcon className="h-4.5 w-4.5" />;
        case 'idea':
            return <IdeaIcon className="h-4.5 w-4.5" />;
        case 'transfer':
            return <NavigationIcon type="transfer" className="h-4.5 w-4.5 text-current" />;
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
            className={`h-[34px] min-w-[40px] px-3 font-normal active:scale-[0.98] focus:outline-none ${toneClassName}`.trim()}
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
                className={`h-[34px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
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
                className={`h-[34px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                inputClassName="text-sm text-brand-dark sm:text-xs sm:text-sm"
                trailingClassName="w-[40px] shrink-0 justify-center px-0"
            />
        );
    }

    return (
        <TextInput
            value={value}
            onChange={(event) => onChange(control.id, event.target.value)}
            placeholder={control.placeholder ?? ''}
            trailing={<SearchIcon className="h-5 w-5 text-text-darkest" />}
            className={`h-[34px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
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
    const actions = (config.actions ?? []).filter((action) => action.tone !== 'warning' && action.icon !== 'idea' && action.id !== 'help');
    const hasSidePanel = config.sidePanel?.hidden !== true;
    const [values, setValues] = useState(() => buildInitialControlValues(controls));
    const keywordControl = controls.find((control) => control.type === 'search');
    const keyword = keywordControl ? values[keywordControl.id] ?? '' : '';

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

    return (
        <div className="flex min-h-full flex-col gap-3 pt-3">
            <div className="flex flex-col gap-3 2lg:flex-row 2xl:items-start 2xl:justify-between">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
                    {controls.map((control, index) => (
                        <div key={control.id ?? `control-${index}`} className={control.wrapperClassName ?? ''}>
                            <InquiryControl control={control} value={control.id ? values[control.id] ?? '' : ''} onChange={handleChange} />
                        </div>
                    ))}
                </div>

                {actions.length ? (
                    <div className="flex flex-col items-end gap-2">
                        {actions.map((action) => (
                            <InquiryActionButton
                                key={action.id}
                                action={action}
                                onClick={action.id === 'reload' ? onRefresh : undefined}
                            />
                        ))}
                    </div>
                ) : null}
            </div>

            {error ? (
                <div className="rounded-[6px] border border-danger-border bg-surface px-3 py-2 text-sm text-red-850">
                    {error}
                </div>
            ) : null}

            <div
                className={`grid min-h-0 flex-1 gap-3 ${
                    hasSidePanel ? 'xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_380px]' : ''
                }`.trim()}
            >
                <div className="min-w-0 overflow-hidden rounded-[6px] border border-ui-border-medium bg-white shadow-card-light">
                    <div className="min-h-0 overflow-x-auto">
                        <DataTable className={config.table.tableClassName ?? 'min-w-[680px] md:min-w-[780px]'} wrapperClassName="rounded-none border-0">
                            <DataTableHeader className="bg-table-header-bg">
                                <tr>
                                    <DataTableHead className="w-[50px] px-2.5 text-center text-base font-medium text-white">
                                        No.
                                    </DataTableHead>
                                    {config.table.columns.map((column) => (
                                        <SortableTableHeaderCell
                                            key={column.id}
                                            label={column.label}
                                            align={column.align}
                                            widthClassName={column.widthClassName}
                                            sortable={false}
                                            noWrap={column.noWrap === true}
                                        />
                                    ))}
                                </tr>
                            </DataTableHeader>

                            <DataTableBody>
                                {hasRows ? (
                                    filteredRows.map((row, index) => (
                                        <DataTableRow
                                            key={row.id ?? `row-${index}`}
                                            className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'}`.trim()}
                                        >
                                            <DataTableCell className="px-2.5 text-center text-base text-table-row-number whitespace-nowrap">
                                                {pagination ? (pagination.from + index) : (index + 1)}
                                            </DataTableCell>
                                            {config.table.columns.map((column) => (
                                                <DataTableCell
                                                    key={column.id}
                                                    className={`${resolveCellAlignClassName(column.align)} px-2.5 text-base text-text-workspace-dark ${column.cellClassName ?? ''}`.trim()}
                                                >
                                                    {column.truncate ? (
                                                        <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                                    ) : (
                                                        formatTableTextValue(row[column.id])
                                                    )}
                                                </DataTableCell>
                                            ))}
                                        </DataTableRow>
                                    ))
                                ) : (
                                    <DataTableRow className="bg-white">
                                        <DataTableCell
                                            colSpan={config.table.columns.length + 1}
                                            className="px-2.5 py-3 text-center text-base text-text-workspace-dark"
                                        >
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
                        <div className="border-t border-table-row-border bg-ui-bg-hover px-3 py-2">
                            <Pagination
                                page={pagination.page}
                                perPage={pagination.perPage}
                                total={pagination.total}
                                lastPage={pagination.lastPage}
                                from={pagination.from}
                                to={pagination.to}
                                onPageChange={pagination.onPageChange}
                                onPerPageChange={pagination.onPerPageChange}
                            />
                        </div>
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
