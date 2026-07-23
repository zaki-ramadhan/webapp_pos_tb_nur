import React from 'react';
import { formatDisplayValue } from '@/features/workspace/shared/amountFormatting';

export function TransactionTotalCard({ label, value, className = '' }) {
    const formattedValue = formatDisplayValue(value);
    return (
        <div
            className={`w-full max-w-[200px] overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium ${className}`.trim()}
        >
            <div className="px-4 py-2.5 text-xs sm:text-sm text-brand-dark truncate" title={label}>{label}</div>
            <div className="px-4 pb-3 text-right text-base font-semibold text-text-darkest truncate" title={formattedValue}>{formattedValue}</div>
        </div>
    );
}
