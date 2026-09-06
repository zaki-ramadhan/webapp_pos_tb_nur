import TextareaField from '@/components/ui/TextareaField';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function PurchaseDepositInfoSection({ config, values, setValues, isDetail }) {
    return (
        <section>
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle || 'Info lainnya'} icon="info" />

                <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.bankAccount || 'Rekening Bank'} />
                        <div className="max-w-[320px] w-full">
                            <AccountLookupTextInput
                                id="bankAccount"
                                resource="accounts"
                                value={values.bankAccounts?.[0] ?? ''}
                                placeholder="Rekening Bank"
                                searchLabel="Cari rekening bank"
                                queryParams={{ account_type: 'Cash/Bank' }}
                                disabled={isDetail}
                                onSelectAccount={(record, label) => {
                                    setValues((current) => ({
                                        ...current,
                                        __bankAccountId: record ? record.id : null,
                                        bankAccounts: label ? [label] : [],
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-start gap-x-4">
                        <TransactionFieldLabel label={config.labels.address || 'Alamat'} className="pt-2" />
                        <div className="max-w-[320px] w-full">
                            <TextareaField
                                value={values.address || ''}
                                onChange={isDetail ? undefined : (event) =>
                                    setValues((current) => ({
                                        ...current,
                                        address: event.target.value,
                                    }))
                                }
                                readOnly={isDetail}
                                rows={4}
                                className="border-ui-border bg-slate-50"
                                textareaClassName="min-h-[84px] text-xs sm:text-sm text-brand-dark bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-start gap-x-4">
                        <TransactionFieldLabel label={config.labels.notes || 'Keterangan'} className="pt-2" />
                        <div className="max-w-[320px] w-full">
                            <TextareaField
                                value={values.notes || ''}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        notes: event.target.value,
                                    }))
                                }
                                rows={4}
                                className="border-ui-border bg-slate-50"
                                textareaClassName="min-h-[84px] text-xs sm:text-sm text-brand-dark bg-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
