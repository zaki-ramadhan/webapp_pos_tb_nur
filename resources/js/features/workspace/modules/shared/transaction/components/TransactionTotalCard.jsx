import React from 'react';
import { formatCardNominal } from '@/features/workspace/shared/amountFormatting';

export function TransactionTotalCard({ label, value, className = '' }) {
    const formattedValue = formatCardNominal(value);
    return (
        <div
            className={`w-full sm:w-[180px] xl:w-[200px] 2xl:w-[220px] min-h-[68px] sm:min-h-[76px] flex flex-col justify-between max-w-full shrink-0 overflow-hidden rounded-[4px] border border-ui-border bg-white shadow-card-medium px-3.5 sm:px-4 py-2.5 sm:py-3 ${className}`.trim()}
        >
            <div className="text-xs sm:text-sm text-brand-dark truncate" title={label}>{label}</div>
            <div className="mt-1 text-right text-sm sm:text-base font-semibold text-text-darkest whitespace-nowrap tabular-nums">{formattedValue}</div>
        </div>
    );
}
