import PortalDropdown from '@/components/ui/PortalDropdown';
import { CloseIcon, InfoIcon } from '@/features/workspace/shared/Icons';

export function LookupChip({
    label,
    onClear,
    disabled = false,
    clearAriaLabel = 'Hapus',
    className = '',
    labelClassName = '',
    maxWidthClassName = 'max-w-full',
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md border border-border-chip-blue bg-bg-chip-blue px-2 py-1 text-xs sm:text-sm text-text-chip-blue-dark cursor-default ${maxWidthClassName} ${className}`.trim()}
        >
            <span className={`truncate ${labelClassName}`.trim()}>{label}</span>
            {!disabled && onClear ? (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClear(e);
                    }}
                    disabled={disabled}
                    aria-label={clearAriaLabel}
                    className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-text-chip-blue-dark hover:text-red-600 active:text-red-800 transition-colors disabled:text-slate-300 cursor-pointer"
                >
                    <CloseIcon className="h-3.5 w-3.5" />
                </button>
            ) : null}
        </span>
    );
}

export function LookupLoadingState({
    label = 'Memuat data...',
    className = '',
}) {
    return (
        <div className={`p-4 text-center text-xs sm:text-sm font-normal text-text-workspace-dark ${className}`.trim()}>
            {label}
        </div>
    );
}

export function LookupDropdownSurface({ className = '', children, maxHeightLimit = 260, onClose, anchorRef, side = 'bottom' }) {
    return (
        <PortalDropdown
            open={true}
            onClose={onClose}
            maxHeightLimit={maxHeightLimit}
            side={side}
            className={className}
            anchorRef={anchorRef}
        >
            {children}
        </PortalDropdown>
    );
}

export function LookupEmptyState({
    title = 'Data tidak ditemukan',
    description = null,
    className = '',
}) {
    return (
        <div className={`px-4 py-5 text-center ${className}`.trim()}>
            <div className="text-xs sm:text-sm font-normal text-text-workspace-dark">{title}</div>
            {description ? <div className="mt-1 text-xs text-text-workspace-dark">{description}</div> : null}
        </div>
    );
}

export function HighlightText({ text = '', search = '', className = 'bg-yellow-200 text-black p-0' }) {
    const strText = String(text ?? '');
    const queryStr = String(search ?? '').trim();

    if (!queryStr || !strText) {
        return <span>{strText}</span>;
    }

    const regex = new RegExp(`(${queryStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = strText.split(regex);

    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className={className}>
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </span>
    );
}
