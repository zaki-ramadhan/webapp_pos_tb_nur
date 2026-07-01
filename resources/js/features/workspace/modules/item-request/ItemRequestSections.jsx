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
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CloseIcon,
    SearchIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

export function ItemRequestFormHeader({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.requestDate} required htmlFor="requestDate" />
                    <div className="max-w-[320px] w-full">
                        <TransactionDateInput
                            id="requestDate"
                            value={values.requestDate}
                            onChange={(nextValue) => setValues((current) => ({ ...current, requestDate: nextValue }))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.requestType} required htmlFor="requestType" />
                    <div className="max-w-[320px] w-full">
                        <SelectField
                            id="requestType"
                            value={values.requestType}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    requestType: event.target.value,
                                }))
                            }
                            className="h-[40px] rounded-[4px] border-ui-border"
                            selectClassName="text-xs sm:text-sm text-brand-dark"
                        >
                            {config.requestTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px] md:pl-12 lg:pl-16 xl:pl-20 2xl:pl-28">
                <div className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required htmlFor="documentNumber" />
                    </div>

                    <div className="max-w-[320px] w-full justify-self-end">
                        {isDetail ? (
                            <TextInput
                                id="documentNumber"
                                value={values.documentNumber}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        documentNumber: event.target.value,
                                    }))
                                }
                                onBlur={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        documentNumber: event.target.value.trim(),
                                    }))
                                }
                                maxLength={120}
                                trailing={<CloseIcon className="h-4 w-4 text-brand-dark" />}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                trailingClassName="px-3"
                            />
                        ) : (
                            <SelectField
                                id="documentNumber"
                                value={values.numberingType}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        numberingType: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-ui-border"
                                selectClassName="text-xs sm:text-sm text-brand-dark"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        )}
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

    const customSearchInput = (
        <div className="flex gap-2 w-full items-center">
            {!isDetail && (
                <div className="min-w-0 flex-1 sm:max-w-[320px] md:max-w-[380px]">
                    <AccountLookupTextInput
                        id="itemRequestItemSearch"
                        resource="products"
                        value={values.itemSearch}
                        placeholder={config.detailSearchPlaceholder}
                        searchLabel="Cari barang atau jasa"
                        onSelectAccount={(record, label) => {
                            if (record) {
                                handlers.onSelectItemSuggestion?.(record, label);
                            }
                        }}
                    />
                </div>
            )}
            {isDetail && (
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
            getRowClassName={() => 'cursor-pointer hover:bg-workspace-hover-bg'}
            searchInput={customSearchInput}
        />
    );
}

export function ItemRequestAdditionalInfoSection({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="min-h-[520px]">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 space-y-3 pl-3 sm:pl-5">
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
                            className="rounded-[4px] border-ui-border"
                            textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
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
                                align="center"
                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                containerClassName="w-auto inline-flex"
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
