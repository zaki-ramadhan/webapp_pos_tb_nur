import { useEffect, useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
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
    LinkIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';
import SelectField from '@/components/ui/SelectField';

const CONTENT_MIN_HEIGHT_CLASS_NAME = 'min-h-[280px] sm:min-h-[360px] xl:min-h-[60vh]';

function buildInitialControlValues(controls) {
    return (controls ?? []).reduce((result, control) => {
        if (control.id) {
            result[control.id] = control.value ?? '';
        }

        return result;
    }, {});
}

function resolveAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

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
            return <LinkIcon className="h-4.5 w-4.5" />;
    }
}

function InquiryActionButton({ action, onClick }) {
    const toneClassName =
        action.tone === 'warning'
            ? 'border-[#f4b038] bg-[#ffab13] text-white'
            : 'border-[#7aa2d5] bg-white text-[#2353a0]';

    return (
        <button
            type="button"
            aria-label={action.label}
            title={action.label}
            onClick={onClick}
            className={`inline-flex h-[34px] min-w-[40px] items-center justify-center rounded-[4px] border px-3 ${toneClassName}`.trim()}
        >
            {resolveActionIcon(action)}
        </button>
    );
}

function InquiryControl({ control, value, onChange }) {
    if (control.type === 'select') {
        return (
            <SelectField
                value={value}
                onChange={(event) => onChange(control.id, event.target.value)}
                className={`h-[34px] rounded-[4px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
                selectClassName="text-[14px] text-[#1f2436] sm:text-[15px]"
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
        return <span className={`text-[14px] text-[#111827] sm:text-[15px] ${control.className ?? ''}`.trim()}>{control.label}</span>;
    }

    if (control.type === 'date') {
        return (
            <TransactionDateInput
                value={value}
                onChange={(nextValue) => onChange(control.id, nextValue)}
                className={`h-[34px] rounded-[4px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
                inputClassName="text-[14px] text-[#1f2436] sm:text-[15px]"
                trailingClassName="w-[40px] shrink-0 justify-center px-0"
            />
        );
    }

    return (
        <TextInput
            value={value}
            onChange={(event) => onChange(control.id, event.target.value)}
            placeholder={control.placeholder ?? ''}
            trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
            className={`h-[34px] rounded-[4px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
            inputClassName="text-[14px] text-[#1f2436] sm:text-[15px]"
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
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between">
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
                <div className="rounded-[6px] border border-[#f0c4c4] bg-[#fff6f6] px-3 py-2 text-[14px] text-[#a33939]">
                    {error}
                </div>
            ) : null}

            <div
                className={`grid min-h-0 flex-1 gap-3 ${
                    hasSidePanel ? 'xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_380px]' : ''
                }`.trim()}
            >
                <div className="overflow-hidden rounded-[6px] border border-[#d6dce8] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="min-h-0 overflow-x-auto">
                        <DataTable className={config.table.tableClassName ?? 'min-w-[680px] md:min-w-[780px]'} wrapperClassName="rounded-none border-0">
                            <DataTableHeader className="bg-[#5f7690]">
                                <tr>
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
                                            className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                        >
                                            {config.table.columns.map((column) => (
                                                <DataTableCell
                                                    key={column.id}
                                                    className={`${resolveAlignClassName(column.align)} px-2.5 text-[15px] text-[#131a28] ${column.cellClassName ?? ''}`.trim()}
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
                                            colSpan={config.table.columns.length}
                                            className="px-2.5 py-3 text-center text-[15px] text-[#131a28]"
                                        >
                                            {loading ? 'Memuat data...' : (config.table.emptyLabel ?? 'Belum ada data')}
                                        </DataTableCell>
                                    </DataTableRow>
                                )}
                            </DataTableBody>
                        </DataTable>
                    </div>

                    {!hasRows ? (
                        <div className={`border-t border-[#edf1f6] bg-white ${config.table.emptySpaceClassName ?? CONTENT_MIN_HEIGHT_CLASS_NAME}`.trim()} />
                    ) : null}
                </div>

                {hasSidePanel ? (
                    <div
                        className={`overflow-hidden rounded-[6px] border border-[#d6dce8] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] ${config.sidePanel?.className ?? CONTENT_MIN_HEIGHT_CLASS_NAME}`.trim()}
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
