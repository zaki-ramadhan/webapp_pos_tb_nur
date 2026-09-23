import { useState } from 'react';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function PurchaseDepositInfoSection({ config, values, setValues, isDetail }) {
    const [isTouched, setIsTouched] = useState(false);
    const hasSupplier = Boolean(values.__supplierId || (Array.isArray(values.supplier) && values.supplier[0]?.trim()));
    const invoiceLabel = config.labels?.invoiceNumber || 'No. Faktur';
    const invoiceError = hasSupplier && !isDetail && isTouched && !String(values.invoiceNumber ?? '').trim()
        ? `${invoiceLabel} wajib diisi.`
        : undefined;

    return (
        <section>
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle || 'Info lainnya'} icon="info" />

                <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                    {hasSupplier && (
                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-start gap-x-4">
                            <TransactionFieldLabel
                                label={invoiceLabel}
                                required
                                htmlFor="invoiceNumber"
                                className="pt-2"
                            />
                            <div className="max-w-[320px] w-full">
                                <TextInput
                                    id="invoiceNumber"
                                    name="invoiceNumber"
                                    value={values.invoiceNumber || ''}
                                    placeholder="Masukkan No. Faktur..."
                                    onChange={isDetail ? undefined : (event) =>
                                        setValues((current) => ({
                                            ...current,
                                            invoiceNumber: event.target.value,
                                        }))
                                    }
                                    onBlur={isDetail ? undefined : (event) => {
                                        setIsTouched(true);
                                        setValues((current) => ({
                                            ...current,
                                            invoiceNumber: event.target.value.trim(),
                                        }));
                                    }}
                                    error={invoiceError}
                                    readOnly={isDetail}
                                    maxLength={120}
                                    className="h-[40px] rounded-[4px] bg-slate-50 border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark bg-transparent"
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.bankAccount || 'Rekening Bank'} />
                        <div className="max-w-[320px] w-full">
                            <AccountLookupTextInput
                                id="bankAccount"
                                resource="accounts"
                                value={values.bankAccounts?.[0] ?? ''}
                                placeholder="Cari/Pilih Rekening Bank..."
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
