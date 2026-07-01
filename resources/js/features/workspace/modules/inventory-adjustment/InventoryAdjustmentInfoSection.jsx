import TextareaField from '@/components/ui/TextareaField';
import {
    AccountLookupTextInput,
} from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function InventoryAdjustmentInfoSection({ pageId, config, values, setValues, handlers }) {
    const isPriceAdjustment = pageId === 'price-adjustment';

    return (
        <div className="min-h-[520px]">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4 pl-3 sm:pl-5">
                    {!isPriceAdjustment && (
                        <>
                            <TransactionFieldLabel label={config.labels.adjustmentAccount} />
                            <div className="w-full max-w-[282px]">
                                <AccountLookupTextInput
                                    id="inventoryAdjustmentAccount"
                                    value={values.adjustmentAccount?.[0] ?? ''}
                                    placeholder="Cari/Pilih..."
                                    searchLabel="Cari akun penyesuaian"
                                    dialogTitle="Pilih Akun Penyesuaian"
                                    onSelectAccount={(record, label) =>
                                        setValues((current) => ({
                                            ...current,
                                            adjustmentAccount: label ? [label] : [],
                                            __adjustmentAccountId: record?.id ?? null,
                                        }))
                                    }
                                    className="h-[40px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                />
                            </div>
                        </>
                    )}

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
                        textareaClassName="min-h-[72px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </div>
        </div>
    );
}
