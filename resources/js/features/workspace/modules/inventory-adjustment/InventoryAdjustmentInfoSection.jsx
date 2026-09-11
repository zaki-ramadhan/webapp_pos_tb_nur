import TextareaField from '@/components/ui/TextareaField';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function InventoryAdjustmentInfoSection({ pageId, config = {}, values, setValues, handlers, isDetail }) {
    const labels = config.labels ?? {};

    return (
        <div className="min-h-[520px]">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle || 'Info Lainnya'} icon="info" />

                <div className="mt-4 flex flex-col gap-y-4 pl-3 sm:pl-5">
                    <div className="grid gap-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={labels.adjustmentAccount || 'Akun Penyesuaian'} />
                        <div className="max-w-[340px] w-full">
                            <AccountLookupTextInput
                                id="adjustmentAccount"
                                resource="accounts"
                                value={values.adjustmentAccount?.[0] ?? ''}
                                placeholder="Cari/Pilih Akun..."
                                searchLabel="Cari akun penyesuaian"
                                queryParams={{
                                    account_type: ['Expense', 'Other Expense', 'Equity', 'Cost of Sales'],
                                }}
                                filterRows={(rows) => {
                                    const allowedTypes = [
                                        'Expense',
                                        'Other Expense',
                                        'Equity',
                                        'Cost of Sales',
                                        'Modal',
                                        'Beban',
                                        'Beban Lainnya',
                                        'Beban Pokok Penjualan',
                                    ];
                                    return rows.filter((r) => allowedTypes.includes(r.account_type));
                                }}
                                disabled={isDetail}
                                onSelectAccount={(record, label) => {
                                    setValues((current) => ({
                                        ...current,
                                        __adjustmentAccountId: record ? record.id : null,
                                        adjustmentAccount: label ? [label] : [],
                                    }));
                                }}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                        <TransactionFieldLabel label={labels.notes || 'Keterangan'} className="pt-2" />
                        <div className="max-w-[340px] sm:max-w-none w-full">
                            <TextareaField
                                value={values.notes}
                                onChange={isDetail ? undefined : (event) =>
                                    setValues((current) => ({
                                        ...current,
                                        notes: event.target.value,
                                    }))
                                }
                                readOnly={isDetail}
                                rows={4}
                                className="rounded-[4px] border-ui-border"
                                textareaClassName="min-h-[72px] text-xs sm:text-sm text-brand-dark"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
