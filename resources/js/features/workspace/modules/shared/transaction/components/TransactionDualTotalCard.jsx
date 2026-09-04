import React from 'react';
import { formatDisplayValue } from '@/features/workspace/shared/amountFormatting';

export function TransactionDualTotalCard({ items = [], className = '' }) {
    if (!items.length) {
        return null;
    }

    const maxWClass = items.length === 3
        ? 'w-full sm:w-[720px] xl:w-[810px] 2xl:w-[900px] max-w-full'
        : items.length === 1
        ? 'w-full sm:w-[280px] xl:w-[320px] 2xl:w-[340px] max-w-full'
        : 'w-full sm:w-[520px] md:w-[560px] xl:w-[600px] 2xl:w-[640px] max-w-full';

    const gridColsClass = items.length === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : items.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1';

    return (
        <div
            className={`grid ${gridColsClass} shrink-0 ${maxWClass} overflow-hidden rounded-[4px] border border-ui-border bg-white shadow-card-medium ${className}`.trim()}
        >
            {items.map((item, index) => {
                const formattedValue = formatDisplayValue(item.value);
                return (
                    <div
                        key={item.label || index}
                        className={`px-4 py-2.5 min-w-0 flex flex-col justify-between ${
                            index < items.length - 1
                                ? 'border-b border-ui-border sm:border-b-0 sm:border-r'
                                : ''
                        }`.trim()}
                    >
                        <div className="text-xs sm:text-sm text-brand-dark truncate" title={item.label}>
                            {item.label}
                        </div>
                        <div
                            className="mt-1 text-right text-base sm:text-lg font-semibold text-text-darkest whitespace-nowrap tabular-nums"
                            title={formattedValue}
                        >
                            {formattedValue}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
