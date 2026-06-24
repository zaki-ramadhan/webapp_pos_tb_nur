import React from 'react';

export function TransactionDualTotalCard({ items = [], className = '' }) {
    if (!items.length) {
        return null;
    }

    return (
        <div
            className={`grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium ${className}`.trim()}
            style={{
                gridTemplateColumns: items.length > 1 ? `repeat(${items.length}, minmax(0,1fr))` : undefined,
            }}
        >
            {items.map((item, index) => (
                <div
                    key={item.label}
                    className={`p-4 ${index < items.length - 1 ? 'border-b border-ui-border-medium sm:border-b-0 sm:border-r border-ui-border-medium' : ''}`.trim()}
                >
                    <div className="text-xs sm:text-sm text-brand-dark">{item.label}</div>
                    <div className="mt-3 text-right text-lg font-semibold text-text-darkest">{item.value}</div>
                </div>
            ))}
        </div>
    );
}
