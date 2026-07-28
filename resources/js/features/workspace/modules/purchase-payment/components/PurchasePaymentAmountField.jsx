import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { formatCurrencyLabel } from '../purchasePaymentCalculations';

export function PurchasePaymentAmountField({ values, setValues }) {
    return (
        <FormattedAmountInput
            value={values.paymentAmountDisplay}
            onChange={(event) => {
                const nextVal = event.target.value;
                const numericValue = parseNumericInput(nextVal);
                const footerValue = numericValue > 0 ? formatCurrencyLabel(numericValue) : '0';

                setValues((current) => ({
                    ...current,
                    paymentAmount: nextVal,
                    paymentAmountDisplay: nextVal,
                    paymentAmountPrefix: numericValue > 0 ? 'Rp' : '',
                    footerPaymentValue: footerValue,
                }));
            }}
            id="purchasePaymentAmount"
            name="nilai pembayaran"
            className="h-[40px] rounded-[4px] border-ui-border"
            inputClassName="text-right text-xs sm:text-sm text-brand-dark"
        />
    );
}
