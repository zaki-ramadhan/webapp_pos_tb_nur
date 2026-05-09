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
import TextareaField from '@/components/ui/TextareaField';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CloseIcon,
    CogIcon,
    FunnelIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SaveIcon,
    SearchIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function buildFormValues(config, detailRow = null) {
    const defaults = config.createDefaults ?? {};
    const detailRecord = detailRow ? config.detailRecords?.[detailRow.id] : null;
    const source = {
        ...defaults,
        ...(detailRecord ?? {}),
    };

    return {
        name: source.name ?? '',
        description: source.description ?? '',
        responsiblePerson: source.responsiblePerson ?? '',
        isDamagedWarehouse: Boolean(source.isDamagedWarehouse),
        inactive: Boolean(source.inactive),
        allUsers: source.allUsers ?? true,
        street: source.street ?? '',
        city: source.city ?? '',
        postalCode: source.postalCode ?? '',
        province: source.province ?? '',
        country: source.country ?? '',
        groupBranch: cloneList(source.groupBranch),
        users: cloneList(source.users),
    };
}

function WarehouseFieldRow({ label, required = false, children, className = '' }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
            <label className="pt-2 text-[17px] leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function ClearableTextInput({ value, onChange, placeholder = '', className = '', inputClassName = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            inputClassName={`text-[15px] text-[#1f2436] ${inputClassName}`.trim()}
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#111827] transition hover:bg-[#eef2f7]"
                        aria-label="Kosongkan isian"
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null
            }
            trailingClassName={value ? 'pr-2' : ''}
        />
    );
}

function PrefixedTextArea({ prefix, value, onChange }) {
    return (
        <div className="flex overflow-hidden rounded-[4px] border border-[#cfd6e2] bg-white">
            <div className="flex min-w-[40px] items-start justify-start border-r border-[#cfd6e2] bg-[#f3f3f4] px-2 py-3 text-[15px] text-[#8b94a7]">
                {prefix}
            </div>
            <textarea
                value={value}
                onChange={onChange}
                rows={4}
                className="min-h-[74px] w-full resize-none px-4 py-3 text-[15px] text-[#1f2436] outline-none"
            />
        </div>
    );
}

function PrefixedInput({ prefix, value, onChange, className = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            prefixClassName="min-w-[48px] border-[#cfd6e2] bg-[#f3f3f4] px-2 text-[15px] text-[#8b94a7]"
            inputClassName="text-[15px] text-[#1f2436]"
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#111827] transition hover:bg-[#eef2f7]"
                        aria-label={`Kosongkan ${prefix}`}
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null
            }
            trailingClassName={value ? 'pr-2' : ''}
        />
    );
}

function WarehouseGeneralTab({ config, values, onChange, isDetail }) {
    return (
        <div className="space-y-4">
            <WarehouseFieldRow label={config.labels.name} required>
                <ClearableTextInput value={values.name} onChange={(event) => onChange('name', event.target.value)} />
            </WarehouseFieldRow>

            <WarehouseFieldRow label={config.labels.description}>
                <TextareaField
                    value={values.description}
                    onChange={(event) => onChange('description', event.target.value)}
                    rows={4}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[76px] text-[15px] text-[#1f2436]"
                />
            </WarehouseFieldRow>

            <WarehouseFieldRow label={config.labels.responsiblePerson}>
                <ClearableTextInput
                    value={values.responsiblePerson}
                    onChange={(event) => onChange('responsiblePerson', event.target.value)}
                    className="max-w-[420px]"
                />
            </WarehouseFieldRow>

            <div className="space-y-3 lg:pl-[260px]">
                <CheckboxField
                    id="warehouse-damaged"
                    label={config.labels.damagedWarehouse}
                    checked={values.isDamagedWarehouse}
                    onChange={(event) => onChange('isDamagedWarehouse', event.target.checked)}
                    align="center"
                    labelClassName="text-[17px]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />

                {isDetail ? (
                    <CheckboxField
                        id="warehouse-inactive"
                        label={config.labels.inactive}
                        checked={values.inactive}
                        onChange={(event) => onChange('inactive', event.target.checked)}
                        align="center"
                        labelClassName="text-[17px]"
                        inputClassName="mt-0 h-[18px] w-[18px]"
                        containerClassName="w-auto"
                    />
                ) : null}
            </div>
        </div>
    );
}

function WarehouseAddressTab({ config, values, onChange }) {
    return (
        <WarehouseFieldRow label={config.labels.address}>
            <div className="max-w-[720px] space-y-3">
                <PrefixedTextArea prefix="Jalan" value={values.street} onChange={(event) => onChange('street', event.target.value)} />

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.74fr)]">
                    <PrefixedInput prefix="Kota" value={values.city} onChange={(event) => onChange('city', event.target.value)} />
                    <PrefixedInput prefix="K.Pos" value={values.postalCode} onChange={(event) => onChange('postalCode', event.target.value)} />
                </div>

                <PrefixedInput prefix="Provinsi" value={values.province} onChange={(event) => onChange('province', event.target.value)} />
                <PrefixedInput prefix="Negara" value={values.country} onChange={(event) => onChange('country', event.target.value)} />
            </div>
        </WarehouseFieldRow>
    );
}

function WarehouseUsersTab({ config, values, onChange, isDetail }) {
    return (
        <div className="space-y-5">
            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-[18px] font-medium text-[#1f2436]">{config.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="warehouse-all-users"
                label={config.userAccess.allUsersLabel}
                checked={values.allUsers}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-[17px]"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName="w-auto"
            />

            {!values.allUsers ? (
                <div className="space-y-4">
                    <div className="pt-1">
                        <h3 className="text-[18px] font-medium text-[#1f2436]">{config.userAccess.limitedTitle}</h3>
                    </div>

                    <WarehouseFieldRow label={config.labels.groupBranch}>
                        <ChipLookupField
                            values={values.groupBranch}
                            placeholder={config.userAccess.groupBranchPlaceholder}
                            searchLabel="Cari grup/cabang"
                            onRemove={(value) => onChange('groupBranch', values.groupBranch.filter((item) => item !== value))}
                            className="max-w-[1320px]"
                            contentClassName="items-start"
                        />
                    </WarehouseFieldRow>

                    <WarehouseFieldRow label={config.labels.user}>
                        <ChipLookupField
                            values={values.users}
                            placeholder={config.userAccess.userPlaceholder}
                            searchLabel="Cari pengguna"
                            onRemove={(value) => onChange('users', values.users.filter((item) => item !== value))}
                            className="max-w-[1320px]"
                        />
                    </WarehouseFieldRow>
                </div>
            ) : isDetail ? null : null}
        </div>
    );
}

function renderDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

function WarehouseFormView({ config, activeLevel2Tab }) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return config.table.rows.find((row) => row.id === recordId) ?? null;
    }, [activeLevel2Tab, config.table.rows]);
    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.tabs?.[0]?.id ?? 'warehouse-general');
    const [values, setValues] = useState(() => buildFormValues(config, detailRow));

    useEffect(() => {
        setActiveTabId(config.tabs?.[0]?.id ?? 'warehouse-general');
        setValues(buildFormValues(config, detailRow));
    }, [config, detailRow]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const dockActions = isDetail ? config.detailDockActions : config.createDockActions;

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={config.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[640px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                <div className="order-2 min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4 lg:order-1">
                    {activeTabId === 'warehouse-address' ? (
                        <WarehouseAddressTab config={config} values={values} onChange={handleChange} />
                    ) : activeTabId === 'warehouse-users' ? (
                        <WarehouseUsersTab config={config} values={values} onChange={handleChange} isDetail={isDetail} />
                    ) : (
                        <WarehouseGeneralTab config={config} values={values} onChange={handleChange} isDetail={isDetail} />
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

function WarehouseTableView({ config, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');
    const [inactiveFilter, setInactiveFilter] = useState(config.table.filters?.[0]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            if (inactiveFilter !== 'all' && row.inactiveValue !== inactiveFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.name, row.address].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.rows, inactiveFilter, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={
                    <>
                        {(config.table.filters ?? []).map((filter) => (
                            <SelectField
                                key={filter.id}
                                value={inactiveFilter}
                                onChange={(event) => setInactiveFilter(event.target.value)}
                                containerClassName="w-auto shrink-0"
                                className="h-[40px] min-w-[128px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#394157]"
                            >
                                {filter.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectField>
                        ))}
                        <button
                            type="button"
                            aria-label={config.table.filterButtonLabel}
                            className="inline-flex h-[40px] w-[50px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcecff] text-[#2353a0]"
                        >
                            <FunnelIcon className="h-4.5 w-4.5" />
                        </button>
                    </>
                }
                topRowClassName="mb-4"
                size="compact"
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                rightControls={
                    <button
                        type="button"
                        aria-label={config.table.printLabel}
                        className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                    >
                        <PrintIcon className="h-4.5 w-4.5" />
                    </button>
                }
                menuButton={{
                    label: config.table.settingsLabel,
                    icon: <CogIcon className="h-4.5 w-4.5" />,
                    items: config.table.menuItems,
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <div className="min-w-[940px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {config.table.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${resolveRowAlignClassName(column.align)}`.trim()}
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
                                    className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    onClick={() =>
                                        onOpenDetail({
                                            recordId: row.id,
                                            label: row.tabLabel ?? row.name,
                                            tabLabel: row.tabLabel ?? row.name,
                                        })
                                    }
                                >
                                    {config.table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-3 text-[15px] text-[#131a28] ${resolveRowAlignClassName(column.align)}`.trim()}
                                        >
                                            {formatTableTextValue(row[column.id])}
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

export default function WarehouseView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = page.warehouse;

    return mode === 'table' ? (
        <WarehouseTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <WarehouseFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
