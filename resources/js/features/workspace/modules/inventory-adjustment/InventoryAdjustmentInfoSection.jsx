import TextareaField from '@/components/ui/TextareaField';
import {
    AccountLookupField,
} from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function InventoryAdjustmentInfoSection({ config, values, setValues, handlers }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,560px)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.adjustmentAccount} />
                <AccountLookupField
                    values={values.adjustmentAccount}
                    placeholder="Cari/Pilih..."
                    searchLabel="Cari akun penyesuaian"
                    dialogTitle="Pilih Akun Penyesuaian"
                    onRemove={(accountValue) =>
                        setValues((current) => ({
                            ...current,
                            adjustmentAccount: current.adjustmentAccount.filter((item) => item !== accountValue),
                            __adjustmentAccountId: current.adjustmentAccount.filter((item) => item !== accountValue).length
                                ? current.__adjustmentAccountId
                                : null,
                        }))
                    }
                    onSelectAccount={(record, label) =>
                        setValues((current) => ({
                            ...current,
                            adjustmentAccount: label ? [label] : [],
                            __adjustmentAccountId: record?.id ?? null,
                        }))
                    }
                    heightClassName="h-[34px]"
                />

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
                    textareaClassName="min-h-[72px] text-xs sm:text-sm text-[#1f2436]"
                />


            </div>
        </div>
    );
}
