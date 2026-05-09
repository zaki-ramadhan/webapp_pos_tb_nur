import { useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    ExternalLinkIcon,
    LinkIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';

function buildInitialValues(config) {
    return (config.controls ?? []).reduce((result, control) => {
        result[control.id] = control.value ?? '';
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

function InquiryIconButton({ icon, label }) {
    const IconComponent = icon === 'external-link' ? ExternalLinkIcon : LinkIcon;

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
        >
            <IconComponent className="h-4.5 w-4.5" />
        </button>
    );
}

function InquiryTextButton({ label, tone = 'default' }) {
    return (
        <button
            type="button"
            className={`inline-flex h-[34px] items-center justify-center rounded-[4px] border px-4 text-[15px] ${
                tone === 'primary'
                    ? 'border-[#7aa2d5] bg-[#f0f6ff] text-[#2353a0]'
                    : 'border-[#7aa2d5] bg-white text-[#2353a0]'
            }`.trim()}
        >
            {label}
        </button>
    );
}

function InquiryControl({ control, value, onChange }) {
    if (control.type === 'select') {
        return (
            <SelectField
                value={value}
                onChange={(event) => onChange(control.id, event.target.value)}
                containerClassName="w-auto shrink-0"
                className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
                selectClassName="text-[15px] text-[#1f2436]"
            >
                {(control.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </SelectField>
        );
    }

    if (control.type === 'date') {
        return (
            <TransactionDateInput
                value={value}
                onChange={(nextValue) => onChange(control.id, nextValue)}
                className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
                inputClassName="text-[15px] text-[#1f2436]"
                trailingClassName="w-[42px] shrink-0 justify-center px-0"
            />
        );
    }

    if (control.type === 'icon-button') {
        return <InquiryIconButton icon={control.icon} label={control.label} />;
    }

    if (control.type === 'button') {
        return <InquiryTextButton label={control.label} tone={control.tone} />;
    }

    return (
        <TextInput
            value={value}
            onChange={(event) => onChange(control.id, event.target.value)}
            placeholder={control.placeholder ?? ''}
            trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
            inputClassName="text-[15px] text-[#1f2436]"
            trailingClassName="px-3"
        />
    );
}

export default function InventoryInquiryView({ config }) {
    const [values, setValues] = useState(() => buildInitialValues(config));
    const [keyword, setKeyword] = useState(config.search?.value ?? '');

    const filteredRows = useMemo(() => {
        const rows = config.table.rows ?? [];
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return rows;
        }

        const searchKeys = config.table.searchKeys?.length
            ? config.table.searchKeys
            : config.table.columns.filter((column) => column.kind !== 'checkbox').map((column) => column.id);

        return rows.filter((row) =>
            searchKeys.some((key) =>
                String(row[key] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            ),
        );
    }, [config.table.columns, config.table.rows, config.table.searchKeys, keyword]);

    function handleChange(controlId, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [controlId]: nextValue,
        }));
    }

    const firstColumnIsCheckbox = config.table.columns[0]?.kind === 'checkbox';

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                    {(config.controls ?? []).map((control) => (
                        <div key={control.id} className={control.wrapperClassName ?? ''}>
                            <InquiryControl control={control} value={values[control.id] ?? ''} onChange={handleChange} />
                        </div>
                    ))}
                </div>

                {config.search ? (
                    <div className="w-full lg:w-auto">
                        <TextInput
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder={config.search.placeholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${config.search.className ?? ''}`.trim()}
                            inputClassName="text-[15px] text-[#1f2436]"
                            trailingClassName="px-3"
                        />
                    </div>
                ) : null}
            </div>

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className={config.table.tableClassName ?? 'min-w-[1280px]'} wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${resolveAlignClassName(column.align)}`.trim()}
                                >
                                    {column.kind === 'checkbox' ? (
                                        <span className="inline-flex h-[22px] w-[22px] rounded-[4px] border border-[#d8dde7] bg-white" />
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
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                >
                                    {config.table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-2.5 text-[15px] text-[#131a28] ${resolveAlignClassName(column.align)}`.trim()}
                                        >
                                            {column.kind === 'checkbox' ? (
                                                <span className="inline-flex h-[18px] w-[18px] rounded-[4px] border border-[#cfd6e2] bg-white" />
                                            ) : (
                                                formatTableTextValue(row[column.id])
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                {firstColumnIsCheckbox ? (
                                    <DataTableCell className="px-2.5" />
                                ) : null}
                                <DataTableCell
                                    colSpan={config.table.columns.length - (firstColumnIsCheckbox ? 1 : 0)}
                                    className="px-2.5 py-3 text-center text-[15px] text-[#131a28]"
                                >
                                    {config.table.emptyLabel ?? 'Belum ada data'}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
