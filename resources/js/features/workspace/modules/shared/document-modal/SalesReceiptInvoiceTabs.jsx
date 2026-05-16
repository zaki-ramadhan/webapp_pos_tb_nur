import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

import { DocumentModalCurrencyField } from './DocumentModalFields';
import DiscountInfoTab from './DiscountInfoTab';

export function SalesReceiptInvoiceTab({ values, setValues }) {
    return (
        <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
            <TransactionFieldLabel label="No. Faktur" />
            <TextInput
                value={values.invoiceNumber}
                readOnly
                className="h-[36px] rounded-[4px] border-[#9ed66f] bg-[#f1fee9]"
                inputClassName="text-[15px] font-semibold text-[#67b52c]"
            />

            <TransactionFieldLabel label="Tgl Faktur" />
            <div className="flex h-[36px] items-center text-[15px] text-[#1f2436]">{values.invoiceDate}</div>

            <TransactionFieldLabel label="Terhutang" />
            <TextInput
                value={values.outstanding}
                readOnly
                className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                inputClassName="text-right text-[15px] text-[#64748b]"
            />

            <TransactionFieldLabel label="Bayar" />
            <DocumentModalCurrencyField
                value={values.payment}
                onChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        payment: event.target.value,
                    }))
                }
                inputClassName="font-semibold"
            />
        </div>
    );
}

export { default as SalesReceiptDiscountInfoTab } from './DiscountInfoTab';
