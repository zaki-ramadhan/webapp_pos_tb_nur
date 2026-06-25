import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

import { DocumentModalCurrencyField } from './DocumentModalFields';
import DiscountInfoTab from './DiscountInfoTab';
import CheckboxField from '@/components/ui/CheckboxField';

export function PurchasePaymentInvoiceTab({ values, setValues }) {
    return (
        <div className="space-y-3">
            <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
                <TransactionFieldLabel label="No Form #" />
                <TextInput
                    value={values.formNumber}
                    readOnly
                    className="h-[36px] rounded-[4px] border-tab-view-inactive-border-t bg-success-bg"
                    inputClassName="text-xs sm:text-sm text-tab-view-inactive-border-l"
                />

                <TransactionFieldLabel label="No. Faktur" />
                <TextInput
                    value={values.billNumber}
                    readOnly
                    className="h-[36px] rounded-[4px] border-tab-view-inactive-border-t bg-success-bg"
                    inputClassName="text-xs sm:text-sm text-tab-view-inactive-border-l"
                />

                <TransactionFieldLabel label="Terhutang" />
                <TextInput
                    value={values.outstanding}
                    readOnly
                    className="h-[36px] rounded-[4px] border-ui-border"
                    inputClassName="text-right text-xs sm:text-sm text-text-muted"
                />

                <TransactionFieldLabel label="Bayar" />
                <DocumentModalCurrencyField
                    value={values.pay}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            pay: event.target.value,
                        }))
                    }
                    inputClassName=""
                />
            </div>

            <CheckboxField
                id="pphChecked"
                label="Dipotong PPh"
                checked={values.pphChecked}
                onChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        pphChecked: event.target.checked,
                    }))
                }
                align="center"
                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                containerClassName="w-auto inline-flex"
            />

            <div className="space-y-3 pl-[44px]">
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm text-brand-dark">
                    <span>{values.pphLabel}</span>
                    <span>{values.pphAmount}</span>
                </div>

                <div className="grid gap-y-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-x-4">
                    <TransactionFieldLabel label="No. Bukti Potong" />
                    <TextInput
                        value={values.withholdingProof}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                withholdingProof: event.target.value,
                            }))
                        }
                        className="h-[36px] rounded-[4px] border-ui-border"
                        inputClassName="text-xs sm:text-sm text-text-darkest"
                    />

                    <TransactionFieldLabel label="Pembayaran" />
                    <TextInput
                        value={values.payment}
                        readOnly
                        className="h-[36px] rounded-[4px] border-ui-border bg-ui-bg-hover"
                        inputClassName="text-right text-xs sm:text-sm text-text-muted"
                    />
                </div>

                <div className="border-l-4 border-section-tab-neutral-border pl-3 text-sm italic leading-6 text-illustration-danger-bg">
                    {values.notice}
                </div>
            </div>
        </div>
    );
}

export { default as PurchasePaymentDiscountInfoTab } from './DiscountInfoTab';
