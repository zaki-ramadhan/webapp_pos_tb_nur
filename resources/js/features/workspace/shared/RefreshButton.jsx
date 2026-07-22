import React, { useState } from 'react';
import Tooltip from '@/components/ui/Tooltip';
import { RefreshIcon } from '@/features/workspace/shared/Icons';

/**
 * Universal Single-Source-of-Truth Refresh Button Component
 */
export default function RefreshButton({
    onClick,
    loading = false,
    label = 'Muat ulang',
    className = '',
    size = 'default',
    disabled = false,
}) {
    const [isLocalRefreshing, setIsLocalRefreshing] = useState(false);

    const isSpinning = Boolean(loading || isLocalRefreshing);

    async function handleClick(event) {
        setIsLocalRefreshing(true);
        try {
            await onClick?.(event);
        } finally {
            setTimeout(() => {
                setIsLocalRefreshing(false);
            }, 600);
        }
    }

    const buttonSizeClassName =
        size === 'compact' ? 'h-[36px] w-[36px]' : 'h-[40px] w-[40px]';

    return (
        <Tooltip content={label} portal>
            <button
                type="button"
                aria-label={label}
                onClick={handleClick}
                disabled={disabled || isSpinning}
                className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue transition hover:bg-brand-blue-light ${buttonSizeClassName} ${
                    isSpinning ? 'pointer-events-none opacity-75' : ''
                } ${className}`.trim()}
            >
                <RefreshIcon className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`.trim()} />
            </button>
        </Tooltip>
    );
}
