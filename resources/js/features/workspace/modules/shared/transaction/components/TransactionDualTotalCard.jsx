import React from 'react';
import { formatCardNominal } from '@/features/workspace/shared/amountFormatting';

export function TransactionDualTotalCard({ items = [], className = '' }) {
    if (!items.length) {
        return null;
    }

    const count = items.length;
    const containerWidthClass =
        count === 1
            ? 'w-full sm:w-[180px] xl:w-[200px] 2xl:w-[220px]'
            : count === 2
            ? 'w-full sm:w-[360px] xl:w-[400px] 2xl:w-[440px]'
            : count === 3
            ? 'w-full sm:w-[540px] xl:w-[600px] 2xl:w-[660px]'
            : count === 4
            ? 'w-full sm:w-[700px] xl:w-[780px] 2xl:w-[860px]'
            : count === 5
            ? 'w-full sm:w-[850px] xl:w-[950px] 2xl:w-[1050px]'
            : 'w-full sm:w-[1020px] xl:w-[1140px] 2xl:w-[1260px]';

    return (
        <div
            className={`flex flex-col sm:flex-row shrink-0 ${containerWidthClass} max-w-full overflow-hidden rounded-[4px] border border-ui-border bg-white shadow-card-medium divide-y sm:divide-y-0 sm:divide-x divide-ui-border ${className}`.trim()}
        >
            {items.map((item, index) => {
                const formattedValue = formatCardNominal(item.value);
                return (
                    <div
                        key={item.label || index}
                        className="flex-1 min-w-0 px-3.5 py-2 flex flex-col justify-between"
                    >
                        <div className="text-xs sm:text-sm text-brand-dark truncate" title={item.label}>
                            {item.label}
                        </div>
                        <div className="mt-1 text-right text-sm sm:text-base font-semibold text-text-darkest whitespace-nowrap tabular-nums">
                            {formattedValue}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
