import { useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { LinkIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function buildInitialValues(config) {
    return (config.controls ?? []).reduce((result, control) => {
        result[control.id] = control.value ?? '';
        return result;
    }, {});
}

function resolveHeaderAlignClassName(align) {
    return 'text-center';
}

function resolveCellAlignClassName(align) {
    return 'text-left';
}


function ToolbarIconButton({ action }) {
    const icon =
        action.icon === 'settings'
            ? <NavigationIcon type="settings" className="h-4.5 w-4.5 text-current" />
            : <LinkIcon className="h-4.5 w-4.5" />;

    return (
        <button
            type="button"
            aria-label={action.label}
            title={action.label}
            className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue"
        >
            {icon}
        </button>
    );
}

export default function TransferBatchWorkspaceView({ config }) {
    const [values, setValues] = useState(() => buildInitialValues(config));
    const [keyword, setKeyword] = useState(config.search?.value ?? '');
    const toolbarActions = (config.toolbarActions ?? []).filter((action) => action.tone !== 'warning' && action.icon !== 'idea' && action.id !== 'help');

    const filteredRows = useMemo(() => {
        const rows = config.table.rows ?? [];
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return rows;
        }

        return rows.filter((row) =>
            (config.table.searchKeys ?? []).some((key) =>
                String(row[key] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            ),
        );
    }, [config.table.rows, config.table.searchKeys, keyword]);

    const firstColumnIsCheckbox = config.table.columns[0]?.kind === 'checkbox';

    return (
        <div className="flex min-h-full flex-col overflow-hidden rounded-[6px] border border-ui-border-medium bg-white shadow-card-light">
            <div className="border-b border-ui-border-medium px-3 py-3">
                <div className="flex flex-col gap-3 lg:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                        {(config.controls ?? []).map((control) => (
                            <div key={control.id} className={control.wrapperClassName ?? ''}>
                                <SelectField
                                    value={values[control.id] ?? ''}
                                    onChange={(event) =>
                                        setValues((currentValues) => ({
                                            ...currentValues,
                                            [control.id]: event.target.value,
                                        }))
                                    }
                                    className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                                    selectClassName="text-xs sm:text-sm text-brand-dark"
                                >
                                    {(control.options ?? []).map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>
                        ))}

                        {toolbarActions.length ? (
                            <div className="flex flex-col gap-2">
                                {toolbarActions.map((action) => (
                                    <ToolbarIconButton key={action.id} action={action} />
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {config.search ? (
                        <div className="w-full xl:w-auto xl:min-w-[420px]">
                            <TextInput
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder={config.search.placeholder}
                                trailing={<SearchIcon className="h-5 w-5 text-text-darkest" />}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                trailingClassName="px-3"
                            />
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 overflow-x-auto">
                    <DataTable
                        className={config.table.tableClassName ?? 'min-w-[780px] sm:min-w-[1024px] lg:min-w-[1280px]'}
                        wrapperClassName="rounded-none border-0"
                    >
                        <DataTableHeader className="bg-table-header-bg">
                            <tr>
                                <DataTableHead className="w-[50px] px-2.5 text-center text-base font-medium text-white">
                                    No.
                                </DataTableHead>
                                {config.table.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-2.5 text-base font-medium text-white ${resolveHeaderAlignClassName(column.align)}`.trim()}
                                    >
                                        {column.kind === 'checkbox' ? (
                                            <span className="inline-flex h-[22px] w-[22px] rounded-[4px] border border-ui-border-medium bg-white" />
                                        ) : (
                                            column.label
                                        )}
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {filteredRows.length ? (
                                filteredRows.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'}`.trim()}
                                    >
                                        <DataTableCell className="px-2.5 text-center text-base text-table-row-number whitespace-nowrap">
                                            {index + 1}
                                        </DataTableCell>
                                        {config.table.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`px-2.5 text-base text-text-workspace-dark ${resolveCellAlignClassName(column.align)}`.trim()}
                                            >
                                                {column.kind === 'checkbox' ? (
                                                    <span className="inline-flex h-[18px] w-[18px] rounded-[4px] border border-ui-border bg-white" />
                                                ) : (
                                                    formatTableTextValue(row[column.id])
                                                )}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white">
                                    {firstColumnIsCheckbox ? <DataTableCell className="px-2.5" /> : null}
                                    <DataTableCell
                                        colSpan={config.table.columns.length - (firstColumnIsCheckbox ? 1 : 0) + 1}
                                        className="px-2.5 py-3 text-center text-base text-text-workspace-dark"
                                    >
                                        {config.table.emptyLabel ?? 'Belum ada data'}
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>

                {!filteredRows.length ? (
                    <EmptyState
                        fill
                        tone="subtle"
                        size="sm"
                        iconName={config.emptyState?.icon ?? 'document'}
                        title={config.emptyState?.title ?? 'Belum ada data'}
                        description={config.emptyState?.description ?? 'Belum ada data'}
                        className="min-h-[260px] px-6 py-10"
                        titleClassName="text-base font-medium text-text-muted"
                        descriptionClassName="mt-2 text-sm leading-5 text-text-light"
                    />
                ) : null}
            </div>

            {config.footer ? (
                <div className="border-t border-ui-border-medium bg-white px-3 py-2.5">
                    <div className="grid gap-3 lg:grid-cols-[160px_minmax(0,1fr)_190px] lg:items-center">
                        <div className="flex items-center justify-between gap-3 rounded-[4px] border border-table-cell-border bg-ui-bg-hover px-3 py-2">
                            <span className="text-base text-text-workspace-muted">{config.footer.totalLabel}</span>
                            <span className="text-lg font-semibold text-text-workspace-muted">{config.footer.totalValue}</span>
                        </div>

                        <SelectField
                            value={config.footer.selectValue}
                            onChange={() => {}}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            selectClassName="text-xs sm:text-sm text-brand-dark"
                        >
                            {config.footer.selectOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <button
                            type="button"
                            disabled
                            className="inline-flex h-[40px] w-full items-center justify-center rounded-[4px] border border-tab-primary-inactive-hover-bg bg-tab-primary-inactive-bg px-4 text-base font-medium text-white disabled:cursor-not-allowed lg:w-auto"
                        >
                            {config.footer.actionLabel}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
