import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TextareaField from '@/components/ui/TextareaField';

export function PayrollAdditionalInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-0">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start pl-3 sm:pl-5">
                    <TransactionFieldLabel label={config.additionalInfoFields.liabilityAccountLabel} required />
                    <AccountLookupField
                        values={values.liabilityAccounts}
                        placeholder={config.additionalInfoFields.liabilityAccountPlaceholder}
                        dialogTitle="Pilih Akun Hutang Beban"
                        onRemove={(value) =>
                            setValues((current) => ({
                                ...current,
                                liabilityAccounts: current.liabilityAccounts.filter((item) => item !== value),
                                __liabilityAccountId: null,
                            }))
                        }
                        searchLabel="Cari akun hutang beban"
                        onSelectAccount={(record, label) =>
                            setValues((current) => ({
                                ...current,
                                liabilityAccounts: label ? [label] : [],
                                __liabilityAccountId: record?.id ?? null,
                            }))
                        }
                        queryParams={{ account_type: 'Other Current Liability' }}
                        showType={true}
                    />

                    <TransactionFieldLabel label={config.additionalInfoFields.noteLabel} />
                    <TextareaField
                        value={values.notes}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        rows={4}
                        className="border-ui-border"
                        textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </div>
        </div>
    );
}
