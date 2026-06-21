import React from 'react';
import Tooltip from '@/components/ui/Tooltip';

export default function ToolbarIconButton({ label, onClick, className, children, disabled = false }) {
    return (
        <Tooltip content={label} portal>
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={className}
                aria-label={label}
            >
                {children}
            </button>
        </Tooltip>
    );
}
