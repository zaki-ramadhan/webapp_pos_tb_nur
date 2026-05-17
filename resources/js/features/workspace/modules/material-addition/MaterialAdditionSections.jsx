import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    ChevronDownIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';

export function MaterialAdditionHeader({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:items-start">
                <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.date} required />
                        <TransactionDateInput
                            value={values.date}
                            onChange={(nextValue) => setValues((current) => ({ ...current, date: nextValue }))}
                            className="max-w-[330px]"
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.type} />
                        <SelectField
                            value={values.type}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    type: event.target.value,
                                }))
                            }
                            className="h-[40px] max-w-[330px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.typeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.workOrderNumber} required />
                        <TextInput
                            value={values.workOrderNumber}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    workOrderNumber: event.target.value,
                                }))
                            }
                            onClick={handlers.onSelectWorkOrder}
                            placeholder={config.workOrderPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] max-w-[506px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {isDetail ? (
                        <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                            <TextInput
                                value={values.documentNumber}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </div>
                    ) : values.autoNumber ? (
                        <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start gap-4 sm:justify-end">
                                <TransactionFieldLabel label={config.labels.documentNumber} required />
                                <TransactionSwitch
                                    checked={values.autoNumber}
                                    onChange={(nextValue) =>
                                        setValues((current) => ({
                                            ...current,
                                            autoNumber: nextValue,
                                        }))
                                    }
                                />
                            </div>

                            <SelectField
                                value={values.numberingType}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        numberingType: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#1f2436]"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                            <TextInput
                                value={values.documentNumber}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        documentNumber: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            className="inline-flex h-[38px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                        >
                            {config.favoriteButtonLabel}
                        </button>
                        <button
                            type="button"
                            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                        >
                            <span>{config.processButtonLabel}</span>
                            <ChevronDownIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MaterialAdditionSectionHeader({ searchValue, onSearchChange, placeholder, title, onAction }) {
    const isAccountLookup = placeholder === 'Cari/Pilih Akun Perkiraan...';

    return (
        <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-[720px]">
                <div className="min-w-0 flex-1">
                    {isAccountLookup ? (
                        <AccountLookupTextInput
                            value={searchValue}
                            placeholder={placeholder}
                            searchLabel={`Cari ${title}`}
                            dialogTitle={`Pilih ${title}`}
                            onSelectAccount={(_, label) => onSearchChange({ target: { value: label } })}
                        />
                    ) : (
                        <TextInput
                            value={searchValue}
                            onChange={onSearchChange}
                            placeholder={placeholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
                <TransactionToolbarIconButton label={`Cari ${title}`} onClick={onAction}>
                    <SearchIcon className="h-4.5 w-4.5" />
                </TransactionToolbarIconButton>
                <div className="text-right text-[22px] font-normal text-[#1f2436]">
                    {title} <span className="text-[#ED3969]">*</span>
                </div>
            </div>
        </div>
    );
}

function MaterialAdditionSectionTable({ columns, rows, emptyLabel, onRowClick, clickable = false }) {
    return (
        <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
            <TransactionDataTable
                columns={columns}
                rows={rows}
                emptyLabel={emptyLabel}
                minWidthClassName="min-w-[980px]"
                onRowClick={clickable ? onRowClick : null}
                getRowClassName={() => (clickable ? 'cursor-pointer hover:bg-[#eef3fb]' : '')}
                renderCell={({ row, column }) => <span className="block truncate">{formatTableTextValue(row[column.id])}</span>}
            />
        </div>
    );
}

export function MaterialAdditionItemsSection({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <MaterialAdditionSectionHeader
                searchValue={values.itemSearch}
                onSearchChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        itemSearch: event.target.value,
                    }))
                }
                placeholder={config.itemSearchPlaceholder}
                title={values.itemCountLabel ?? config.itemSectionTitle}
                onAction={handlers.onSelectItem}
            />

            <MaterialAdditionSectionTable
                columns={config.itemTable.columns}
                rows={values.items}
                emptyLabel={config.itemTable.emptyLabel}
                onRowClick={handlers.onEditItem}
                clickable
            />
        </div>
    );
}

export function MaterialAdditionChargesSection({ config, values, setValues, handlers = {} }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <MaterialAdditionSectionHeader
                searchValue={values.chargeSearch}
                onSearchChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        chargeSearch: event.target.value,
                    }))
                }
                placeholder={config.chargeSearchPlaceholder}
                title={config.chargeSectionTitle}
                onAction={handlers.onSelectCharge}
            />

            <MaterialAdditionSectionTable
                columns={config.chargeTable.columns}
                rows={values.additionalCosts}
                emptyLabel={config.chargeTable.emptyLabel}
                onRowClick={handlers.onEditCharge}
                clickable
            />
        </div>
    );
}

export function MaterialAdditionAdditionalInfoSection({ config, values, setValues, handlers = {} }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.branch} required />
                    <ChipLookupField
                        values={values.branches}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari cabang"
                        onRemove={(branchValue) => handlers.onRemoveBranch?.(branchValue)}
                        onSearch={handlers.onSelectBranch}
                        heightClassName="h-[36px]"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.notes} />
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
                        textareaClassName="min-h-[70px] text-[15px] text-[#1f2436]"
                    />
                </div>
            </div>
        </div>
    );
}
