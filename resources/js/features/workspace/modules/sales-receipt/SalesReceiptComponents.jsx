export function ReadonlyTextarea({ value, rows = 3, className = '' }) {
    return (
        <textarea
            value={value}
            rows={rows}
            readOnly
            className={`w-full resize-y rounded-[4px] border border-ui-border px-4 py-3 text-xs sm:text-sm text-brand-dark outline-none ${className}`.trim()}
        />
    );
}

export { default as ReceiptAmountInput } from './components/ReceiptAmountInput';
export { default as ReceiptAmountActionButton } from './components/ReceiptAmountActionButton';
export { default as ReceiptSummaryFooter } from './components/ReceiptSummaryFooter';
