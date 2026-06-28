import React from 'react';

export function TransactionDualTotalCard({ items = [], className = '' }) {
    if (!items.length) {
        return null;
    }

    return (
        <div
            className={`grid w-full max-w-[400px] overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium ${className}`.trim()}
            style={{
                gridTemplateColumns: items.length > 1 ? `repeat(${items.length}, minmax(0,1fr))` : undefined,
            }}
        >
            {items.map((item, index) => (
                <div
                    key={item.label}
                    className={`p-3.5 min-w-0 ${index < items.length - 1 ? 'border-b border-ui-border-medium sm:border-b-0 sm:border-r border-ui-border-medium' : ''}`.trim()}
                >
                    <div className="text-xs sm:text-sm text-brand-dark truncate" title={item.label}>{item.label}</div>
                    <div className="mt-2 text-right text-base sm:text-lg font-semibold text-text-darkest truncate" title={item.value}>{item.value}</div>
                </div>
            ))}
        </div>
    );
}
