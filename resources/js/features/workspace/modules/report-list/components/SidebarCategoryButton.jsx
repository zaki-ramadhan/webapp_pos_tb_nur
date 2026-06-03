import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { SaveIcon } from '@/features/workspace/shared/Icons';
import {
    isReportCategoryInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';

export default function SidebarCategoryButton({ category, active, onSelect }) {
    const isInactive = isReportCategoryInactive(category.id);

    return (
        <button
            type="button"
            onClick={() => {
                if (!isInactive) {
                    onSelect(category.id);
                }
            }}
            className={`group flex w-full items-center gap-3 rounded-[6px] px-3.5 py-2.5 text-left transition ${
                isInactive
                    ? 'cursor-not-allowed opacity-50 text-[#8a93a7]'
                    : active
                    ? 'bg-[#ef3968] text-white font-semibold shadow-[0_2px_8px_rgba(239,57,104,0.12)]'
                    : 'bg-transparent text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]'
            }`.trim()}
            aria-disabled={isInactive}
            title={isInactive ? WORKSPACE_INACTIVE_HINT : category.label}
        >
            <span
                className={`inline-flex shrink-0 items-center justify-center ${
                    active ? 'text-white' : 'text-[#4b5563] group-hover:text-[#111827]'
                }`}
            >
                {category.icon === 'save' ? (
                    <SaveIcon className="h-[18px] w-[18px]" />
                ) : (
                    <NavigationIcon type={category.icon} className="h-[18px] w-[18px]" strokeWidth={1.8} />
                )}
            </span>

            <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] leading-6">{category.label}</span>
            </span>

            {isInactive ? (
                <span className="shrink-0 rounded-[4px] bg-[#fef2f2] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#ef4444] border border-[#fee2e2]">
                    {WORKSPACE_INACTIVE_BADGE_LABEL}
                </span>
            ) : null}
        </button>
    );
}
