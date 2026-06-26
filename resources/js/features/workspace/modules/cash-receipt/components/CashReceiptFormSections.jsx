import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
import { AccountLookupField, AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionFieldLabel,
    TransactionLineItemsSection,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
    TransactionDateInput,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function ReceiptLineItemsSection({ config, values, setValues, handlers = {} }) {
    const detailTitle = values.lineItems.length
        ? `${values.lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    return (
        <TransactionLineItemsSection
            searchValue={values.lineLookup}
            onSearchChange={() => {}}
            searchReadOnly
            searchPlaceholder={config.lineSearchPlaceholder}
            searchInput={
                <AccountLookupTextInput
                    value={values.lineLookup}
                    placeholder={config.lineSearchPlaceholder}
                    searchLabel="Cari akun penerimaan"
                    dialogTitle="Pilih Akun Penerimaan"
                    queryParams={{ exclude_type: 'Cash/Bank' }}
                    showType={true}
                    onSelectAccount={(record) => handlers.onSelectLineAccount?.(record)}
                />
            }
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            onRowClick={handlers.onEditLineItem}
            getRowClassName={
                handlers.onEditLineItem
                    ? () => 'cursor-pointer transition hover:bg-workspace-hover-bg'
                    : undefined
            }
        />
    );
}

export function ReceiptInfoSection({ config, values, setValues }) {
    return (
        <div className="w-full">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle} icon="document" />

                <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.checkNumber} />
                    <div className="max-w-[276px]">
                        <TextInput
                            value={values.checkNumber}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    checkNumber: event.target.value,
                                }))
                            }
                            className="h-[34px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </div>

                    <TransactionFieldLabel label={config.labels.payer} />
                    <TransactionReadonlyTextarea
                        value={values.payer}
                        readOnly={false}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                payer: event.target.value,
                            }))
                        }
                        className="min-h-[56px]"
                    />

                    <TransactionFieldLabel label={config.labels.notes} />
                    <TransactionReadonlyTextarea
                        value={values.notes}
                        readOnly={false}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        rows={4}
                        className="min-h-[70px]"
                    />
                </div>
            </div>
        </div>
    );
}

export function CashReceiptHeader({ config, values, setValues, handlers = {} }) {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.cashBank} required htmlFor="cashBank" />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupField
                            id="cashBank"
                            value={values.bankAccounts?.[0] ?? ''}
                            placeholder={config.cashBankPlaceholder}
                            searchLabel="Cari kas atau bank"
                            queryParams={{ account_type: 'Cash/Bank' }}
                            onRemove={() =>
                                setValues((current) => ({
                                    ...current,
                                    __primaryAccountId: null,
                                    bankAccounts: [],
                                }))
                            }
                            onSelectAccount={(record, label) =>
                                setValues((current) => ({
                                    ...current,
                                    __primaryAccountId: record?.id ?? null,
                                    bankAccounts: record ? [label] : [],
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required htmlFor="entryDate" />
                    <TransactionDateInput
                        id="entryDate"
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required htmlFor="documentNumber" />
                    </div>

                    <div className="max-w-[240px] w-full justify-self-end">
                        {values.autoNumber ? (
                            <SelectField
                                id="documentNumber"
                                value={values.numberingType}
                                onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                selectClassName="text-xs sm:text-sm text-brand-dark"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        ) : (
                            <TextInput
                                id="documentNumber"
                                value={values.documentNumber}
                                onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))}
                                onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                maxLength={120}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
