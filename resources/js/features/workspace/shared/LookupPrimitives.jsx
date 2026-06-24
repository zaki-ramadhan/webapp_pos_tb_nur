import PortalDropdown from '@/components/ui/PortalDropdown';
import { InfoIcon } from '@/features/workspace/shared/Icons';

export function LookupDropdownSurface({ className = '', children, maxHeightLimit = 260, onClose, anchorRef }) {
    return (
        <PortalDropdown
            open={true}
            onClose={onClose}
            maxHeightLimit={maxHeightLimit}
            className={`!rounded-[3px] ${className}`.trim()}
            anchorRef={anchorRef}
        >
            {children}
        </PortalDropdown>
    );
}


export function LookupEmptyState({
    title = 'Data tidak ditemukan',
    description = 'Coba kata kunci lain yang lebih spesifik.',
    className = '',
}) {
    return (
        <div className={`px-4 py-6 text-center ${className}`.trim()}>
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-workspace-hover-bg text-text-badge-blue-dark">
                <InfoIcon className="h-5 w-5 text-current" />
            </div>
            <div className="mt-3 text-sm font-normal text-blue-475569">{title}</div>
            <div className="mt-1 text-xs text-text-light">{description}</div>
        </div>
    );
}
