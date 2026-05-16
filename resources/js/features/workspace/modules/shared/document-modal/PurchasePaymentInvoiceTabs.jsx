import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

import { DocumentModalCurrencyField } from './DocumentModalFields';
import DiscountInfoTab from './DiscountInfoTab';

export function PurchasePaymentInvoiceTab({ values, setValues }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
                <TransactionFieldLabel label="No Form #" />
                <TextInput
                    value={values.formNumber}
                    readOnly
                    className="h-[36px] rounded-[4px] border-[#9ed66f] bg-[#f1fee9]"
                    inputClassName="text-[15px] font-semibold text-[#67b52c]"
                />

                <TransactionFieldLabel label="No. Faktur" />
                <TextInput
                    value={values.billNumber}
                    readOnly
                    className="h-[36px] rounded-[4px] border-[#9ed66f] bg-[#f1fee9]"
                    inputClassName="text-[15px] font-semibold text-[#67b52c]"
                />

                <TransactionFieldLabel label="Terhutang" />
                <TextInput
                    value={values.outstanding}
                    readOnly
                    className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-right text-[15px] text-[#64748b]"
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
                    inputClassName="font-semibold"
                />
            </div>

            <label className="inline-flex items-center gap-2 text-[16px] text-[#1f2436]">
                <input
                    type="checkbox"
                    checked={values.pphChecked}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            pphChecked: event.target.checked,
                        }))
                    }
                    className="h-[22px] w-[22px] rounded-[4px] border border-[#cfd6e2]"
                />
                <span>Dipotong PPh</span>
            </label>

            <div className="space-y-3 pl-[44px]">
                <div className="flex items-center justify-between gap-4 text-[15px] text-[#1f2436]">
                    <span>{values.pphLabel}</span>
                    <span>{values.pphAmount}</span>
                </div>

                <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-x-4">
                    <TransactionFieldLabel label="No. Bukti Potong" />
                    <TextInput
                        value={values.withholdingProof}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                withholdingProof: event.target.value,
                            }))
                        }
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#111827]"
                    />

                    <TransactionFieldLabel label="Pembayaran" />
                    <TextInput
                        value={values.payment}
                        readOnly
                        className="h-[36px] rounded-[4px] border-[#cfd6e2] bg-[#f7f8fb]"
                        inputClassName="text-right text-[15px] text-[#64748b]"
                    />
                </div>

                <div className="border-l-4 border-[#c7ccd8] pl-3 text-[13px] italic leading-6 text-[#ff4836]">
                    {values.notice}
                </div>
            </div>
        </div>
    );
}

export { default as PurchasePaymentDiscountInfoTab } from './DiscountInfoTab';
