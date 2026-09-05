import PortalDropdown from '@/components/ui/PortalDropdown';
import { InfoIcon } from '@/features/workspace/shared/Icons';

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
