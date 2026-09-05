import React from 'react';
import { formatCardNominal } from '@/features/workspace/shared/amountFormatting';

export function TransactionTotalCard({ label, value, className = '' }) {
    const formattedValue = formatCardNominal(value);
    return (
        <div
            className={`w-full sm:w-[180px] xl:w-[200px] 2xl:w-[220px] max-w-full shrink-0 overflow-hidden rounded-[4px] border border-ui-border bg-white shadow-card-medium ${className}`.trim()}
        >
            <div className="px-3.5 py-2 text-xs sm:text-sm text-brand-dark truncate" title={label}>{label}</div>
            <div className="px-3.5 pb-2.5 text-right text-sm sm:text-base font-semibold text-text-darkest whitespace-nowrap tabular-nums">{formattedValue}</div>
        </div>
    );
}
