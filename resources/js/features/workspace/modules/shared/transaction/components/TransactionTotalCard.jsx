import React from 'react';

export function TransactionTotalCard({ label, value, className = '' }) {
    return (
        <div
            className={`w-full max-w-[264px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${className}`.trim()}
        >
            <div className="px-4 py-3 text-xs sm:text-sm text-[#1f2436] sm:text-base lg:text-base">{label}</div>
            <div className="px-4 pb-4 text-right text-base font-semibold text-[#111827] sm:text-base lg:text-lg">{value}</div>
        </div>
    );
}
