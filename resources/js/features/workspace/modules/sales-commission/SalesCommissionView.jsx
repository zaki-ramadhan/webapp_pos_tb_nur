import { useEffect, useMemo, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import { LinkIcon, PlusIcon, SaveIcon, SearchIcon, SortIcon, TrashIcon } from '@/features/workspace/shared/Icons';

function buildCommissionFormValues(config, detailRow = null) {
    const source = detailRow ?? config.draft ?? {};

    return {
        periodType: source.periodType ?? 'forever',
        name: source.name ?? '',
        sellerScope: source.sellerScope ?? 'all',
        orderSelections: [...(source.orderSelections ?? ['first'])],
        productScope: source.productScope ?? '',
        supplierScope: source.supplierScope ?? '',
        conditionType: source.conditionType ?? 'none',
        salesValueFrom: source.salesValueFrom ?? '',
        salesValueTo: source.salesValueTo ?? '',
        quantityFrom: source.quantityFrom ?? '',
        quantityTo: source.quantityTo ?? '',
        quantityUnit: source.quantityUnit ?? '',
        rewardType: source.rewardType ?? '',
        rewardValue: source.rewardValue ?? '',
        rewardBase: source.rewardBase ?? '',
        notes: source.notes ?? '',
        inactive: Boolean(source.inactive),
    };
}

function FormFieldRow({ label, required = false, align = 'center', children }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[440px_minmax(0,1fr)] ${align === 'start' ? 'lg:items-start' : 'lg:items-center'}`.trim()}>
            <label className={`${align === 'start' ? 'pt-2' : ''} text-[17px] leading-[1.35] text-[#1f2436]`.trim()}>
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function RadioOption({ checked, label, onChange }) {
    return (
        <label className="inline-flex items-center gap-3 text-[17px] text-[#1f2436]">
            <input
                type="radio"
                checked={checked}
                onChange={onChange}
                className="h-[22px] w-[22px] border-[#cfd6e2] text-[#2353a0] focus:ring-[#2353a0]/20"
            />
            <span>{label}</span>
        </label>
    );
}

function SalesCommissionCommissionTab({ config, values, setValues }) {
    const setValue = (field, nextValue) =>
        setValues((current) => ({
            ...current,
            [field]: nextValue,
        }));

    const toggleOrderSelection = (optionId, checked) =>
        setValues((current) => ({
            ...current,
            orderSelections: checked
                ? [...new Set([...current.orderSelections, optionId])]
                : current.orderSelections.filter((value) => value !== optionId),
        }));

    return (
        <div className="space-y-4">
            <FormFieldRow label={config.labels.period}>
                <div className="space-y-3">
                    {config.periodOptions.map((option) => (
                        <RadioOption
                            key={option.id}
                            checked={values.periodType === option.id}
                            label={option.label}
                            onChange={() => setValue('periodType', option.id)}
                        />
                    ))}
                </div>
            </FormFieldRow>

            <FormFieldRow label={config.labels.name} required>
                <TextInput
                    value={values.name}
                    onChange={(event) => setValue('name', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </FormFieldRow>

            <FormFieldRow label={config.labels.salespeople} required>
                <div className="space-y-3">
                    {config.salespeopleOptions.map((option) => (
                        <RadioOption
                            key={option.id}
                            checked={values.sellerScope === option.id}
                            label={option.label}
                            onChange={() => setValue('sellerScope', option.id)}
                        />
                    ))}
                </div>
            </FormFieldRow>

            <FormFieldRow label={config.labels.order} required align="start">
                <div className="grid gap-3 xl:grid-cols-5">
                    {config.orderOptions.map((option) => (
                        <CheckboxField
                            key={option.id}
                            id={`commission-order-${option.id}`}
                            label={option.label}
                            checked={values.orderSelections.includes(option.id)}
                            onChange={(event) => toggleOrderSelection(option.id, event.target.checked)}
                            align="center"
                            labelClassName="text-[17px]"
                            inputClassName="mt-0 h-[18px] w-[18px]"
                            containerClassName="w-auto"
                        />
                    ))}
                </div>
            </FormFieldRow>

            <FormFieldRow label={config.labels.productScope} required>
                <SelectField
                    value={values.productScope}
                    onChange={(event) => setValue('productScope', event.target.value)}
                    className="h-[40px] max-w-[426px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-[15px] text-[#1f2436]"
                >
                    {config.productScopeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </FormFieldRow>

            <FormFieldRow label={config.labels.supplierScope} required>
                <SelectField
                    value={values.supplierScope}
                    onChange={(event) => setValue('supplierScope', event.target.value)}
                    className="h-[40px] max-w-[426px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-[15px] text-[#1f2436]"
                >
                    {config.supplierScopeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </FormFieldRow>

            <FormFieldRow label={config.labels.condition} required align="start">
                <div className="space-y-3">
                    <RadioOption
                        checked={values.conditionType === 'none'}
                        label={config.conditionOptions.none}
                        onChange={() => setValue('conditionType', 'none')}
                    />

                    <div className="grid gap-3 xl:grid-cols-[440px_1fr_70px_1fr] xl:items-center">
                        <RadioOption
                            checked={values.conditionType === 'sales-range'}
                            label={config.conditionOptions.salesRange}
                            onChange={() => setValue('conditionType', 'sales-range')}
                        />
                        <TextInput
                            value={values.salesValueFrom}
                            onChange={(event) => setValue('salesValueFrom', event.target.value)}
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                        <div className="text-center text-[17px] text-[#1f2436]">s/d</div>
                        <TextInput
                            value={values.salesValueTo}
                            onChange={(event) => setValue('salesValueTo', event.target.value)}
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[440px_1fr_70px_1fr] xl:items-center">
                        <RadioOption
                            checked={values.conditionType === 'quantity-range'}
                            label={config.conditionOptions.quantityRange}
                            onChange={() => setValue('conditionType', 'quantity-range')}
                        />
                        <TextInput
                            value={values.quantityFrom}
                            onChange={(event) => setValue('quantityFrom', event.target.value)}
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                        <div className="text-center text-[17px] text-[#1f2436]">s/d</div>
                        <TextInput
                            value={values.quantityTo}
                            onChange={(event) => setValue('quantityTo', event.target.value)}
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[440px_1fr_420px] xl:items-center">
                        <RadioOption
                            checked={values.conditionType === 'quantity-unit'}
                            label={config.conditionOptions.quantityUnit}
                            onChange={() => setValue('conditionType', 'quantity-unit')}
                        />
                        <TextInput
                            value={values.quantityUnit}
                            onChange={(event) => setValue('quantityUnit', event.target.value)}
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                        <div className="text-[17px] text-[#1f2436]">{config.conditionUnitLabel}</div>
                    </div>
                </div>
            </FormFieldRow>

            <FormFieldRow label={config.labels.reward} required>
                <div className="grid gap-3 xl:grid-cols-[264px_270px_120px_420px] xl:items-center">
                    <SelectField
                        value={values.rewardType}
                        onChange={(event) => setValue('rewardType', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {config.rewardTypeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>

                    <TextInput
                        value={values.rewardValue}
                        onChange={(event) => setValue('rewardValue', event.target.value)}
                        className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-right text-[15px] text-[#1f2436]"
                    />

                    <div className="text-center text-[17px] text-[#1f2436]">{config.rewardMiddleLabel}</div>

                    <SelectField
                        value={values.rewardBase}
                        onChange={(event) => setValue('rewardBase', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {config.rewardBaseOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </div>
            </FormFieldRow>
        </div>
    );
}

function SalesCommissionOtherTab({ config, values, setValues }) {
    return (
        <div className="space-y-4">
            <FormFieldRow label={config.labels.notes} align="start">
                <TextareaField
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={4}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[80px] text-[15px] text-[#1f2436]"
                />
            </FormFieldRow>

            <FormFieldRow label={config.labels.inactive}>
                <CheckboxField
                    id="sales-commission-inactive"
                    label={config.inactiveLabel}
                    checked={values.inactive}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            inactive: event.target.checked,
                        }))
                    }
                    align="center"
                    labelClassName="text-[17px]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </FormFieldRow>
        </div>
    );
}

function SalesCommissionFormView({ config, activeLevel2Tab }) {
    const detailRow = useMemo(
        () =>
            activeLevel2Tab?.tabType === 'detail'
                ? (config.table.rows ?? []).find((row) => row.id === activeLevel2Tab.recordId) ?? null
                : null,
        [activeLevel2Tab, config.table.rows],
    );
    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.formTabs?.[0]?.id ?? 'commission');
    const [values, setValues] = useState(() => buildCommissionFormValues(config, detailRow));

    useEffect(() => {
        setActiveTabId(config.formTabs?.[0]?.id ?? 'commission');
        setValues(buildCommissionFormValues(config, detailRow));
    }, [config, detailRow]);

    const dockActions = isDetail ? config.detailDockActions : config.createDockActions;

    return (
        <div className="relative flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <PreferencesTabs
                    tabs={config.formTabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                    className="pt-0"
                />
            </div>

            <div className="flex min-h-[642px] flex-col gap-4 rounded-[4px] border border-[#cfd6e2] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-start xl:px-4 xl:py-4">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    {activeTabId === 'others' ? (
                        <SalesCommissionOtherTab config={config} values={values} setValues={setValues} />
                    ) : (
                        <SalesCommissionCommissionTab config={config} values={values} setValues={setValues} />
                    )}
                </div>

                <div className="flex shrink-0 flex-row justify-end gap-3 lg:flex-col">
                    {dockActions.map((action) => (
                        <DockActionButton
                            key={action.id}
                            label={action.label}
                            tone={action.tone}
                            icon={action.icon === 'trash' ? <TrashIcon className="h-9 w-9" /> : <SaveIcon className="h-9 w-9" />}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function SalesCommissionTableView({ config, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            return config.table.columns.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.columns, config.table.rows, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <LinkIcon className="h-4.5 w-4.5" />,
                }}
                menuButton={{
                    label: config.table.settingsLabel,
                    icon: <NavigationIcon type="settings" className="h-4 w-4" />,
                    widthClassName: 'w-[180px]',
                    items: [{ id: 'settings', label: config.table.settingsLabel }],
                }}
                rightControlsClassName="ml-auto"
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={filteredRows}
                    emptyLabel="Belum ada data"
                    minWidthClassName="min-w-[1180px]"
                    onRowClick={(row) =>
                        onOpenDetail?.({
                            recordId: row.id,
                            label: row.name,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-start'}`.trim()}>
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                    renderCell={({ row, column }) => <span className="block truncate">{row[column.id] ?? ''}</span>}
                />
            </div>
        </div>
    );
}

export default function SalesCommissionView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = page.salesCommission;

    return mode === 'table' ? (
        <SalesCommissionTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SalesCommissionFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
