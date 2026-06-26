import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionFieldLabel,
    TransactionLineItemsSection,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
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

export function ReceiptInfoSection({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="min-h-[540px]">
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

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.voided} />
                            <CheckboxField
                                id="voided"
                                label="Ya"
                                checked={values.voided}
                                disabled
                                align="center"
                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                containerClassName="w-auto inline-flex"
                            />
                        </>
                    ) : null}

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

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.reconcileStatus} />
                            <div className="pt-1 text-xs sm:text-sm text-brand-dark">
                                <span className="italic">{values.reconcileStatus}</span>
                                <span className="ml-8">{values.reconcileDate}</span>
                            </div>

                            <TransactionFieldLabel label={config.labels.printStatus} />
                            <TextInput
                                value={values.printStatus}
                                readOnly
                                className="h-[34px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-text-workspace-muted"
                            />
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
