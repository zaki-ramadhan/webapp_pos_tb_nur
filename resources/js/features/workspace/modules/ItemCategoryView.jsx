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
import TextInput from '@/components/ui/TextInput';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import { TransactionToolbarIconButton, TransactionToolbarSplitButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CloseIcon,
    DownloadIcon,
    ExternalLinkIcon,
    PrintIcon,
    SaveIcon,
    SortIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

function buildFormValues(config, detailRow = null) {
    const detailRecord = detailRow ? config.detailRecords?.[detailRow.id] : null;
    const source = {
        ...(config.createDefaults ?? {}),
        ...(detailRecord ?? {}),
    };

    return {
        name: source.name ?? '',
        isDefault: Boolean(source.isDefault),
        isSubCategory: Boolean(source.isSubCategory),
        accounts: (config.accountFields ?? []).reduce((result, field) => {
            result[field.id] = source.accounts?.[field.id] ?? '';
            return result;
        }, {}),
    };
}

function ItemCategoryFieldRow({ label, required = false, children, className = '' }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
            <label className="pt-2 text-[17px] leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function ClearableTextInput({ value, onChange, className = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            inputClassName="text-[15px] text-[#1f2436]"
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#111827] transition hover:bg-[#eef2f7]"
                        aria-label="Kosongkan nama kategori"
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null
            }
            trailingClassName={value ? 'pr-2' : ''}
        />
    );
}

function ItemCategoryGeneralTab({ config, values, onChange }) {
    return (
        <div className="space-y-4">
            <ItemCategoryFieldRow label={config.labels.name} required>
                <ClearableTextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    className="max-w-[420px]"
                />
            </ItemCategoryFieldRow>

            <ItemCategoryFieldRow label={config.labels.isDefault}>
                <CheckboxField
                    id="item-category-default"
                    label={config.labels.yes}
                    checked={values.isDefault}
                    onChange={(event) => onChange('isDefault', event.target.checked)}
                    align="center"
                    labelClassName="text-[17px]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </ItemCategoryFieldRow>

            <div className="lg:pl-[280px]">
                <CheckboxField
                    id="item-category-subcategory"
                    label={config.labels.isSubCategory}
                    checked={values.isSubCategory}
                    onChange={(event) => onChange('isSubCategory', event.target.checked)}
                    align="center"
                    labelClassName="text-[17px]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </div>
        </div>
    );
}

function ItemCategoryAccountsTab({ config, values, onAccountChange }) {
    return (
        <div className="max-w-[1180px] space-y-4">
            <p className="pt-1 text-[17px] italic leading-7 text-[#1f2436]">{config.accountIntro}</p>

            <div className="space-y-3">
                {config.accountFields.map((field) => (
                    <ItemCategoryFieldRow key={field.id} label={field.label}>
                        <ChipLookupField
                            value={values.accounts[field.id] ?? ''}
                            placeholder={config.accountPlaceholder}
                            searchLabel={`Cari ${field.label}`}
                            onRemove={() => onAccountChange(field.id, '')}
                            className="max-w-[640px]"
                        />
                    </ItemCategoryFieldRow>
                ))}
            </div>

            <div className="flex items-start gap-3 pt-1">
                <span className="mt-0.5 h-6 w-[4px] shrink-0 rounded-full bg-[#b9bdc5]" />
                <p className="text-[14px] italic leading-6 text-[#ef513f]">{config.accountNote}</p>
            </div>
        </div>
    );
}

function renderDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

function ItemCategoryFormView({ page, activeLevel2Tab }) {
    const config = page.itemCategory;
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return config.table.rows.find((row) => row.id === recordId) ?? null;
    }, [activeLevel2Tab, config.table.rows]);
    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.tabs?.[0]?.id ?? 'item-category-general');
    const [values, setValues] = useState(() => buildFormValues(config, detailRow));

    useEffect(() => {
        setActiveTabId(config.tabs?.[0]?.id ?? 'item-category-general');
        setValues(buildFormValues(config, detailRow));
    }, [config, detailRow]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    function handleAccountChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            accounts: {
                ...currentValues.accounts,
                [field]: nextValue,
            },
        }));
    }

    const dockActions = isDetail ? config.detailDockActions : config.createDockActions;

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={config.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
                className="border-b border-[#d5d9e1] bg-[#f4f4f5] px-2 pt-[6px] sm:px-2"
            />

            <div className="flex min-h-[642px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                <div className="order-2 min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4 lg:order-1">
                    {activeTabId === 'item-category-accounts' ? (
                        <ItemCategoryAccountsTab config={config} values={values} onAccountChange={handleAccountChange} />
                    ) : (
                        <ItemCategoryGeneralTab config={config} values={values} onChange={handleChange} />
                    )}
                </div>

                <div className="order-1 flex justify-end lg:order-2 lg:shrink-0">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        {dockActions.map((action) => (
                            <DockActionButton
                                key={action.id}
                                label={action.label}
                                tone={action.tone}
                                icon={renderDockIcon(action.icon)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function resolveRowAlignClassName(align) {
    return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
}

function ItemCategoryTableView({ page, onCreate, onOpenDetail }) {
    const config = page.itemCategory;
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            return [row.name, row.defaultLabel].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.rows, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                }}
                rightControls={
                    <>
                        <TransactionToolbarSplitButton
                            label={config.table.downloadLabel}
                            icon={<DownloadIcon className="h-4.5 w-4.5" />}
                            items={config.table.downloadItems}
                        />
                        <TransactionToolbarSplitButton
                            label={config.table.shareLabel}
                            icon={<ExternalLinkIcon className="h-4.5 w-4.5" />}
                            items={config.table.shareItems}
                        />
                        <TransactionToolbarIconButton label={config.table.printLabel}>
                            <PrintIcon className="h-4.5 w-4.5" />
                        </TransactionToolbarIconButton>
                    </>
                }
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <div className="min-w-[1060px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {config.table.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${resolveRowAlignClassName(column.align)}`.trim()}
                                    >
                                        {column.kind === 'spacer' ? (
                                            <span className="flex justify-center text-white/55">
                                                <SortIcon className="h-3 w-3" />
                                            </span>
                                        ) : (
                                            <span
                                                className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`.trim()}
                                            >
                                                {column.sortable ? <SortIcon className="h-3 w-3 shrink-0 text-white/55" /> : null}
                                                <span>{column.label}</span>
                                            </span>
                                        )}
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.name,
                                            tabLabel: row.tabLabel ?? row.name,
                                        })
                                    }
                                >
                                    {config.table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.cellClassName ?? ''} px-3 text-[15px] text-[#131a28]`.trim()}
                                        >
                                            {column.kind === 'spacer' ? null : (
                                                <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}

export default function ItemCategoryView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    return mode === 'table' ? (
        <ItemCategoryTableView page={page} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <ItemCategoryFormView page={page} activeLevel2Tab={activeLevel2Tab} />
    );
}
