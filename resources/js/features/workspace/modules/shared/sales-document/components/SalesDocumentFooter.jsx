import { useState, useEffect } from 'react';
import { buildCurrencyValue } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { parseNumericInput } from '@/features/workspace/backend/operationDocumentBackend';
import { formatCurrencyValue, applyComputedTotals } from '@/features/workspace/modules/sales-document/salesDocumentFormShared';

export default function SalesDocumentFooter({ values, setValues, isDetail, pageId }) {
    const [discountInputVal, setDiscountInputVal] = useState(values.discountValue ?? '0');

    useEffect(() => {
        setDiscountInputVal(values.discountValue ?? '0');
    }, [values.discountValue]);

    const currentMode = values.discountMode ?? (values.discountPrefix === 'Rp' ? 'Rp' : '%');

    const toggleDiscountMode = () => {
        const nextMode = currentMode === '%' ? 'Rp' : '%';
        const subtotal = (values.items ?? []).reduce((sum, item) => sum + parseNumericInput(item.total), 0);
        const currentVal = parseNumericInput(discountInputVal);

        let nextDiscountVal = discountInputVal;
        if (nextMode === 'Rp') {
            const rupiahAmount = currentMode === '%' ? Math.round(subtotal * (currentVal / 100)) : currentVal;
            nextDiscountVal = formatCurrencyValue(rupiahAmount);
        } else {
            const percentAmount = subtotal > 0 ? Number(((currentVal / subtotal) * 100).toFixed(2)) : 0;
            nextDiscountVal = String(percentAmount);
        }

        setDiscountInputVal(nextDiscountVal);
        setValues?.((current) => {
            const nextValues = {
                ...current,
                discountValue: nextDiscountVal,
                discountMode: nextMode,
                discountPrefix: nextMode,
                isDiscountOverridden: true,
            };
            return applyComputedTotals(nextValues, current.items);
        });
    };

    const updateDiscountRealtime = (rawVal) => {
        const sanitized = rawVal.replace(/[^0-9.,]/g, '');
        setDiscountInputVal(sanitized);

        setValues?.((current) => {
            const nextValues = {
                ...current,
                discountValue: sanitized,
                discountMode: currentMode,
                isDiscountOverridden: true,
            };
            return applyComputedTotals(nextValues, current.items);
        });
    };

    const handleDiscountBlur = () => {
        const numeric = Math.max(0, parseNumericInput(discountInputVal));
        const mode = currentMode;
        const formatted = mode === '%'
            ? String(numeric)
            : formatCurrencyValue(numeric);
        setDiscountInputVal(formatted);
        setValues?.((current) => {
            const nextValues = {
                ...current,
                discountValue: formatted,
                discountMode: mode,
                isDiscountOverridden: true,
            };
            return applyComputedTotals(nextValues, current.items);
        });
    };

    const subtotalCosts = (values.additionalCosts ?? []).reduce((sum, cost) => sum + parseNumericInput(cost.amount), 0);
    const advanceAmount = (values.advancePayments ?? []).reduce((sum, adv) => sum + parseNumericInput(adv.amount), 0);

    const hasCosts = (values.additionalCosts ?? []).length > 0;
    const hasAdvances = (values.advancePayments ?? []).length > 0;

    const footerParts = [
        { id: 'subtotal', label: 'Sub Total', value: buildCurrencyValue(values.subtotal), align: 'right' },
        { id: 'discount', label: 'Diskon', value: values.discountValue, isInput: true },
        ...(hasCosts ? [{ id: 'costs', label: 'Total Biaya', value: formatCurrencyValue(subtotalCosts), align: 'right' }] : []),
        ...(hasAdvances ? [{ id: 'advance', label: 'Uang Muka', value: formatCurrencyValue(advanceAmount), align: 'right' }] : []),
        ...(values.taxLabel ? [{ id: 'tax', label: values.taxLabel, value: buildCurrencyValue(values.taxValue), align: 'right' }] : []),
        { id: 'total', label: 'Total', value: buildCurrencyValue(values.total), align: 'right' },
    ];
    const gridClassName =
        footerParts.length === 6
            ? 'md:grid-cols-6'
            : footerParts.length === 5
              ? 'md:grid-cols-5'
              : footerParts.length === 4
                ? 'md:grid-cols-4'
                : footerParts.length === 3
                  ? 'md:grid-cols-3'
                  : footerParts.length === 2
                    ? 'md:grid-cols-2'
                    : 'md:grid-cols-1';

    const widthClassName =
        footerParts.length >= 5
            ? 'md:w-[83%]'
            : footerParts.length === 4
              ? 'md:w-2/3'
              : footerParts.length === 3
                ? 'md:w-1/2'
                : 'md:w-1/3';

    return (
        <div className="flex w-full justify-end">
            <div className={`grid w-full ${widthClassName} overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium ${gridClassName}`.trim()}>
                {footerParts.map((part) => (
                    <div key={part.id} className="border-b border-ui-border-light px-4 py-2.5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 md:px-5 flex flex-col justify-between min-h-[72px]">
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-xs sm:text-sm text-brand-dark">
                                {part.label}
                                {part.id === 'discount' ? (
                                    <button
                                        type="button"
                                        onClick={toggleDiscountMode}
                                        className="ml-1 inline-flex cursor-pointer items-center rounded-[4px] border border-brand-blue-border-light bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-brand-blue-accent hover:bg-blue-100 transition-colors select-none"
                                        title="Klik untuk mengubah antara % (Persen) dan Rp (Rupiah)"
                                    >
                                        {currentMode}
                                    </button>
                                ) : part.id === 'tax' ? (
                                    <span className="ml-1 inline-flex rounded-[4px] border border-brand-blue-border-light px-1.5 py-0.5 text-xs text-brand-blue-accent">
                                        %
                                    </span>
                                ) : null}
                            </span>
                        </div>

                        {part.isInput ? (
                            <div className="w-full">
                                <div className="mt-1 flex h-[32px] w-full overflow-hidden rounded-[4px] border border-ui-border focus-within:ring-2 focus-within:ring-input-focus/30 focus-within:border-brand-blue-border">
                                    <button
                                        type="button"
                                        onClick={toggleDiscountMode}
                                        className="inline-flex cursor-pointer items-center border-r border-ui-border-medium bg-blue-50 px-2 text-xs sm:text-sm font-bold text-brand-blue-accent hover:bg-blue-100 transition-colors select-none"
                                        title="Klik untuk mengubah antara % dan Rp"
                                    >
                                        {currentMode}
                                    </button>
                                    <input
                                        type="text"
                                        maxLength={currentMode === '%' ? 6 : 20}
                                        className="flex-1 w-0 bg-transparent px-2 text-right text-sm sm:text-base font-semibold text-text-darkest outline-none border-none"
                                        value={discountInputVal}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => updateDiscountRealtime(e.target.value)}
                                        onBlur={handleDiscountBlur}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={`mt-1 text-sm sm:text-base font-semibold text-text-darkest ${part.align === 'right' ? 'text-right' : (part.align === 'center' ? 'text-center' : 'text-left')}`.trim()}>
                                {part.value}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
