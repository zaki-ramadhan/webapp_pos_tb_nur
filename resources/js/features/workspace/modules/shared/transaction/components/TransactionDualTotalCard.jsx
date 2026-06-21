import React from 'react';

export function TransactionDualTotalCard({ items = [], className = '' }) {
    if (!items.length) {
        return null;
    }

    return (
        <div
            className={`grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${className}`.trim()}
            style={{
                gridTemplateColumns: items.length > 1 ? `repeat(${items.length}, minmax(0,1fr))` : undefined,
            }}
        >
            {items.map((item, index) => (
                <div
                    key={item.label}
                    className={`p-4 ${index < items.length - 1 ? 'border-b border-[#d8dde7] sm:border-b-0 sm:border-r border-[#d8dde7]' : ''}`.trim()}
                >
                    <div className="text-xs sm:text-sm text-[#1f2436]">{item.label}</div>
                    <div className="mt-3 text-right text-lg font-semibold text-[#111827]">{item.value}</div>
                </div>
            ))}
        </div>
    );
}
