import React from 'react';

export function TransactionTotalCard({ label, value, className = '' }) {
    return (
        <div
            className={`w-full max-w-[264px] overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium ${className}`.trim()}
        >
            <div className="px-4 py-3 text-xs sm:text-sm text-brand-dark sm:text-base lg:text-base">{label}</div>
            <div className="px-4 pb-4 text-right text-base font-semibold text-text-darkest sm:text-base lg:text-lg">{value}</div>
        </div>
    );
}
