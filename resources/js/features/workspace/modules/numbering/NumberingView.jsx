import { useEffect, useMemo, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
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
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { CogIcon, PlusIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function buildDefaultValues(form) {
    return {
        name: form.defaults?.name ?? '',
        transactionType: form.defaults?.transactionType ?? form.transactionTypeOptions?.[0]?.value ?? '',
        numberingType: form.defaults?.numberingType ?? form.numberingTypeOptions?.[0]?.value ?? '',
        counterDigits: String(form.defaults?.counterDigits ?? 5),
        componentPicker:
            form.defaults?.componentPicker ?? form.componentOptions?.[0]?.value ?? '',
        selectedComponents: form.defaults?.selectedComponents ?? [],
        userScopeAll: Boolean(form.userAccess?.allUsersChecked),
    };
}

function findLabelByValue(options = [], value) {
    return options.find((option) => option.value === value)?.label ?? value;
}

function findCodeByValue(options = [], value) {
    return options.find((option) => option.value === value)?.code ?? '';
}

function buildNumberingPreview(form, values) {
    if (!values.name.trim()) {
        return '-';
    }

    const digits = Number(values.counterDigits) || 0;
    const counter = String(1).padStart(Math.max(1, digits), '0');
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const transactionCode = findCodeByValue(form.transactionTypeOptions, values.transactionType);
    const components = values.selectedComponents.length
        ? values.selectedComponents
        : values.componentPicker
          ? [values.componentPicker]
          : [];

    const componentValues = components.map((componentId) => {
        switch (componentId) {
            case 'year':
                return year;
            case 'month':
                return month;
            case 'transaction-code':
                return transactionCode;
            default:
                return findLabelByValue(form.componentOptions, componentId);
        }
    });

    const separator = values.numberingType === 'fixed' ? '-' : '/';
    const leftParts = [transactionCode, ...componentValues].filter(Boolean);

    return [...leftParts, counter].join(separator);
}

function NumberingFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[290px_minmax(0,420px)] lg:items-center">
            <label className="text-[17px] text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function NumberingComponentsBuilder({ form, values, onChange }) {
    const selectedLabels = values.selectedComponents.map((componentId) =>
        findLabelByValue(form.componentOptions, componentId),
    );

    function handleAddComponent() {
        if (!values.componentPicker || values.selectedComponents.includes(values.componentPicker)) {
            return;
        }

        onChange('selectedComponents', [...values.selectedComponents, values.componentPicker]);
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1 max-w-[390px]">
                    <SelectField
                        value={values.componentPicker}
                        onChange={(event) => onChange('componentPicker', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {form.componentOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                </div>

                <button
                    type="button"
                    onClick={handleAddComponent}
                    className="inline-flex h-[40px] w-[56px] items-center justify-center rounded-[6px] bg-[#66bf13] text-white transition hover:bg-[#5aad12]"
                    aria-label="Tambah komponen penomoran"
                >
                    <PlusIcon className="h-6 w-6" />
                </button>
            </div>

            {selectedLabels.length ? (
                <div className="flex flex-wrap gap-2">
                    {selectedLabels.map((label) => (
                        <span
                            key={label}
                            className="inline-flex items-center rounded-[5px] border border-[#b8d1f1] bg-[#eef5ff] px-2.5 py-1 text-[13px] text-[#295089]"
                        >
                            {label}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function NumberingGeneralTab({ form, values, onChange, preview }) {
    return (
        <div className="space-y-4">
            <NumberingFieldRow label="Nama" required>
                <TextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </NumberingFieldRow>

            <NumberingFieldRow label="Tipe Transaksi">
                <SelectField
                    value={values.transactionType}
                    onChange={(event) => onChange('transactionType', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-[15px] text-[#1f2436]"
                >
                    {form.transactionTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            </NumberingFieldRow>

            <NumberingFieldRow label="Tipe Penomoran">
                <SelectField
                    value={values.numberingType}
                    onChange={(event) => onChange('numberingType', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-[15px] text-[#1f2436]"
                >
                    {form.numberingTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            </NumberingFieldRow>

            <NumberingFieldRow label="Jumlah Digit Counter" required>
                <TextInput
                    value={values.counterDigits}
                    onChange={(event) => onChange('counterDigits', event.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                    className="h-[40px] w-[106px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-right text-[15px] text-[#1f2436]"
                />
            </NumberingFieldRow>

            <NumberingFieldRow label="Komponen Penomoran">
                <NumberingComponentsBuilder form={form} values={values} onChange={onChange} />
            </NumberingFieldRow>

            <NumberingFieldRow label="Contoh hasil penomoran">
                <div className="min-h-[24px] pt-1 text-[17px] font-semibold text-[#131a28]">{preview}</div>
            </NumberingFieldRow>
        </div>
    );
}

function NumberingUsersTab({ form, values, onChange }) {
    return (
        <div className="space-y-5">
            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-[18px] font-medium text-[#1f2436]">{form.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="numbering-all-users"
                label={form.userAccess.allUsersLabel}
                checked={values.userScopeAll}
                onChange={(event) => onChange('userScopeAll', event.target.checked)}
                align="center"
                labelClassName="text-[17px]"
                inputClassName="mt-0 h-[18px] w-[18px]"
            />
        </div>
    );
}

function NumberingFormView({ form }) {
    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'numbering');
    const [values, setValues] = useState(() => buildDefaultValues(form));

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'numbering');
        setValues(buildDefaultValues(form));
    }, [form]);

    const preview = useMemo(() => buildNumberingPreview(form, values), [form, values]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={form.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
                className="border-b border-[#d5d9e1] bg-[#f4f4f5] px-2 pt-[6px] sm:px-2"
            />

            <div className="flex min-h-[640px] flex-col gap-5 px-4 py-4 xl:flex-row xl:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    {activeTabId === 'numbering-users' ? (
                        <NumberingUsersTab form={form} values={values} onChange={handleChange} />
                    ) : (
                        <NumberingGeneralTab form={form} values={values} onChange={handleChange} preview={preview} />
                    )}
                </div>

                <div className="flex justify-end xl:shrink-0">
                    <DockSaveButton label={form.saveLabel} />
                </div>
            </div>
        </div>
    );
}

function NumberingTableView({ table, onCreate }) {
    const [keyword, setKeyword] = useState('');
    const [transactionType, setTransactionType] = useState(table.filters?.[0]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (transactionType !== 'all' && row.transactionTypeValue !== transactionType) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.name, row.transactionTypeLabel, row.userScopeLabel].some((value) =>
                String(value).toLowerCase().includes(normalizedKeyword),
            );
        });
    }, [keyword, table.rows, transactionType]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={
                    table.filters?.map((filter) => (
                        <SelectField
                            key={filter.id}
                            value={transactionType}
                            onChange={(event) => setTransactionType(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[40px] min-w-[228px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#394157]"
                        >
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                    )) ?? null
                }
                topRowClassName="mb-4"
                size="compact"
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{ label: table.refreshLabel }}
                menuButton={{
                    label: table.actionsLabel,
                    icon: <CogIcon className="h-5 w-5" />,
                    buttonClassName: 'w-[70px]',
                    items: table.menuItems,
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[310px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.map((row, index) => (
                            <DataTableRow
                                key={row.id}
                                className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                            >
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.name)}</span>
                                </DataTableCell>
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.transactionTypeLabel)}</span>
                                </DataTableCell>
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.userScopeLabel)}</span>
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function NumberingView({ page, mode, onOpenContent }) {
    return mode === 'table' ? (
        <NumberingTableView table={page.table} onCreate={onOpenContent} />
    ) : (
        <NumberingFormView form={page.form} />
    );
}
