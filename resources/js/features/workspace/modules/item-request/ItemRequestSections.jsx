import { useMemo } from 'react';
import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionLineItemsSection,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    LinkIcon,
    SearchIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

function FormFieldRow({ label, required = false, children, labelClassName = '' }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className={labelClassName} />
            <div>{children}</div>
        </div>
    );
}

function ItemRequestHeaderActions({ config }) {
    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <button
                type="button"
                className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-base text-[#21539b]"
            >
                {config.takeButtonLabel}
            </button>
        </div>
    );
}

export function ItemRequestFormHeader({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="px-4 pt-4 pb-0">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:items-start">
                <div className="space-y-3">
                    <FormFieldRow label={config.labels.requestDate} required>
                        <TransactionDateInput
                            value={values.requestDate}
                            onChange={(nextValue) => setValues((current) => ({ ...current, requestDate: nextValue }))}
                            className="max-w-[280px]"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.requestType}>
                        <SelectField
                            value={values.requestType}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    requestType: event.target.value,
                                }))
                            }
                            className="h-[40px] max-w-[280px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {config.requestTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </FormFieldRow>
                </div>

                <div className="space-y-3">
                    {isDetail ? (
                        <div className="grid gap-3 sm:grid-cols-[230px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start sm:justify-end">
                                <TransactionFieldLabel label={config.labels.documentNumber} required className="whitespace-nowrap sm:text-right" />
                            </div>
                            <div className="flex sm:justify-end">
                                <TextInput
                                    value={values.documentNumber}
                                    readOnly
                                    trailing={<span className="text-2xl font-semibold text-[#1f2436]">×</span>}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2] max-w-[282px] w-full"
                                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                    trailingClassName="px-3"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[230px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start gap-4 sm:justify-end">
                                <TransactionFieldLabel label={config.labels.documentNumber} required className="whitespace-nowrap" />
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

                            <div className="flex sm:justify-end">
                                {values.autoNumber ? (
                                    <SelectField
                                        value={values.numberingType}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                numberingType: event.target.value,
                                            }))
                                        }
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2] max-w-[282px] w-full"
                                        selectClassName="text-xs sm:text-sm text-[#1f2436]"
                                    >
                                        {config.numberingOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </SelectField>
                                ) : (
                                    <TextInput
                                        value={values.documentNumber}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                documentNumber: event.target.value,
                                            }))
                                        }
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2] max-w-[282px] w-full"
                                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex sm:justify-end">
                        <ItemRequestHeaderActions config={config} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ItemRequestDetailsSection({ config, values, setValues, isDetail, handlers = {} }) {
    const filteredItems = useMemo(() => {
        const keyword = (values.itemSearch ?? '').trim().toLowerCase();

        if (!keyword) {
            return values.items ?? [];
        }

        return (values.items ?? []).filter((item) =>
            [item.code, item.name, item.quantity, item.unit, item.notes]
                .join(' ')
                .toLowerCase()
                .includes(keyword),
        );
    }, [values.itemSearch, values.items]);

    // Satukan search input dan tombol aksi di sebelah kiri
    const customSearchInput = (
        <div className="flex gap-2 w-full items-center">
            <div className="min-w-0 flex-1">
                <input
                    type="text"
                    value={values.itemSearch || ''}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            itemSearch: event.target.value,
                        }))
                    }
                    placeholder={config.detailSearchPlaceholder}
                    className="h-[40px] w-full rounded-[4px] border border-[#cfd6e2] px-3.5 text-xs sm:text-sm text-[#1f2436] outline-none focus:border-[#7aa2d5]"
                />
            </div>
            {!isDetail ? (
                <button
                    type="button"
                    onClick={handlers.onImportClick}
                    className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-xs sm:text-sm text-[#21539b] hover:bg-[#f3f7fc] transition shrink-0 cursor-pointer"
                >
                    Impor Excel/CSV
                </button>
            ) : (
                <TransactionToolbarSplitButton
                    label="Opsi rincian barang"
                    icon={<TableActionIcon className="h-4.5 w-4.5" />}
                    items={config.itemTable.copyItems ?? []}
                />
            )}
        </div>
    );

    return (
        <TransactionLineItemsSection
            searchValue={values.itemSearch}
            onSearchChange={(e) =>
                setValues((current) => ({ ...current, itemSearch: e.target.value }))
            }
            searchPlaceholder={config.detailSearchPlaceholder}
            title={values.itemCountLabel ?? config.itemSectionTitle}
            columns={config.itemTable.columns}
            rows={filteredItems}
            emptyLabel={config.itemTable.emptyLabel}
            minWidthClassName={config.itemTable.minWidthClassName}
            onRowClick={handlers.onEditItem}
            getRowClassName={() => 'cursor-pointer hover:bg-[#eef3fb]'}
            searchInput={customSearchInput}
        />
    );
}

export function ItemRequestAdditionalInfoSection({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="min-h-[520px]">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 space-y-3">
                    <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
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
                            textareaClassName="min-h-[70px] text-xs sm:text-sm text-[#1f2436]"
                        />
                    </div>

                    {isDetail ? (
                        <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
                            <TransactionFieldLabel label={config.labels.closeRequest} />
                            <CheckboxField
                                id="closeRequest"
                                label="Ya (Tidak dapat diproses lagi)"
                                checked={values.closeRequest}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        closeRequest: event.target.checked,
                                    }))
                                }
                                inputClassName="h-[20px] w-[20px] rounded"
                                containerClassName="w-auto inline-flex items-center"
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
