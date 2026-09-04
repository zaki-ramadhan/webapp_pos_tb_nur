import React from 'react';
import { formatDisplayValue } from '@/features/workspace/shared/amountFormatting';

export function TransactionDualTotalCard({ items = [], className = '' }) {
    if (!items.length) {
        return null;
    }

    const count = items.length;
    const containerWidthClass =
        count === 1
            ? 'w-full sm:w-[280px] xl:w-[320px]'
            : count === 2
            ? 'w-full sm:w-[540px] md:w-[580px] xl:w-[620px]'
            : count === 3
            ? 'w-full sm:w-[780px] xl:w-[840px] 2xl:w-[900px]'
            : 'w-full sm:w-auto max-w-full';

    return (
        <div
            className={`flex flex-col sm:flex-row shrink-0 ${containerWidthClass} max-w-full overflow-hidden rounded-[4px] border border-ui-border bg-white shadow-card-medium divide-y sm:divide-y-0 sm:divide-x divide-ui-border ${className}`.trim()}
        >
            {items.map((item, index) => {
                const formattedValue = formatDisplayValue(item.value);
                return (
                    <div
                        key={item.label || index}
                        className="flex-1 min-w-0 px-4 py-2.5 flex flex-col justify-between"
                    >
                        <div className="text-xs sm:text-sm text-brand-dark truncate">
                            {item.label}
                        </div>
                        <div className="mt-1 text-right text-base sm:text-lg font-semibold text-text-darkest whitespace-nowrap tabular-nums">
                            {formattedValue}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
