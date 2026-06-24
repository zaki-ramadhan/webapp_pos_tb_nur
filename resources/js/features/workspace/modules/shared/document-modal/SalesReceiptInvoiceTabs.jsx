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
                className="h-[36px] rounded-[4px] border-green-96d86d bg-green-eef9e4"
                inputClassName="text-xs sm:text-sm font-semibold text-green-67b52c"
            />

            <TransactionFieldLabel label="Tgl Faktur" />
            <div className="flex h-[36px] items-center text-xs sm:text-sm text-brand-dark">{values.invoiceDate}</div>

            <TransactionFieldLabel label="Terhutang" />
            <TextInput
                value={values.outstanding}
                readOnly
                className="h-[36px] rounded-[4px] border-ui-border"
                inputClassName="text-right text-xs sm:text-sm text-text-muted"
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
