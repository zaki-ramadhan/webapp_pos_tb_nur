import React from 'react';
import { formatDisplayValue } from '@/features/workspace/shared/amountFormatting';

export function TransactionDualTotalCard({ items = [], className = '' }) {
    if (!items.length) {
        return null;
    }

    const maxWClass = items.length === 3 ? 'max-w-[600px]' : items.length === 1 ? 'max-w-[200px]' : 'max-w-[400px]';

    const gridColsClass = items.length === 3 ? 'grid-cols-3' : items.length === 2 ? 'grid-cols-2' : 'grid-cols-1';

    return (
        <div
            className={`grid ${gridColsClass} w-full ${maxWClass} overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium ${className}`.trim()}
        >
            {items.map((item, index) => {
                const formattedValue = formatDisplayValue(item.value);
                return (
                    <div
                        key={item.label}
                        className={`p-3.5 min-w-0 ${index < items.length - 1 ? 'border-b border-ui-border-medium sm:border-b-0 sm:border-r border-ui-border-medium' : ''}`.trim()}
                    >
                        <div className="text-xs sm:text-sm text-brand-dark truncate" title={item.label}>{item.label}</div>
                        <div className="mt-2 text-right text-base sm:text-lg font-semibold text-text-darkest truncate" title={formattedValue}>{formattedValue}</div>
                    </div>
                );
            })}
        </div>
    );
}
