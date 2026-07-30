import { useState, useEffect } from 'react';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { formatCurrencyLabel } from '../purchasePaymentCalculations';

export function PurchasePaymentAmountField({ values, setValues }) {
    const [localValue, setLocalValue] = useState(() => values.paymentAmountDisplay ?? '');

    useEffect(() => {
        setLocalValue(values.paymentAmountDisplay ?? '');
    }, [values.paymentAmountDisplay]);

    const handleCommit = () => {
        const numericValue = parseNumericInput(localValue);
        const footerValue = numericValue > 0 ? formatCurrencyLabel(numericValue) : '0';

        setValues((current) => ({
            ...current,
            paymentAmount: localValue,
            paymentAmountDisplay: localValue,
            paymentAmountPrefix: numericValue > 0 ? 'Rp' : '',
            footerPaymentValue: footerValue,
        }));
    };

    return (
        <FormattedAmountInput
            value={localValue}
            onChange={(event) => setLocalValue(event.target.value)}
            onBlur={handleCommit}
            id="purchasePaymentAmount"
            name="nilai pembayaran"
            className="h-[40px] rounded-[4px] border-ui-border"
            inputClassName="text-right text-xs sm:text-sm text-brand-dark"
        />
    );
}
