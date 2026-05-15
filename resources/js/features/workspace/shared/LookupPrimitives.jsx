import Panel from '@/components/ui/Panel';
import { InfoIcon } from '@/features/workspace/shared/Icons';

export function LookupDropdownSurface({ className = '', children }) {
    return (
        <Panel className={`absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-[8px] border border-[#d6deea] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] ${className}`.trim()}>
            {children}
        </Panel>
    );
}

export function LookupEmptyState({
    title = 'Data tidak ditemukan',
    description = 'Coba kata kunci lain yang lebih spesifik.',
    className = '',
}) {
    return (
        <div className={`px-4 py-6 text-center ${className}`.trim()}>
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eef3fb] text-[#355784]">
                <InfoIcon className="h-5 w-5 text-current" />
            </div>
            <div className="mt-3 text-[14px] font-medium text-[#4b5567]">{title}</div>
            <div className="mt-1 text-[12px] text-[#8a94a8]">{description}</div>
        </div>
    );
}
