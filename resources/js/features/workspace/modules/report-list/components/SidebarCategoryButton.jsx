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
                    ? 'cursor-not-allowed opacity-50 text-text-light'
                    : active
                    ? 'bg-pink-accent text-white font-semibold shadow-tab-sidebar-pink'
                    : 'bg-transparent text-text-sidebar-muted hover:bg-ui-bg-panel hover:text-text-darkest'
            }`.trim()}
            aria-disabled={isInactive}
            title={isInactive ? WORKSPACE_INACTIVE_HINT : category.label}
        >
            <span
                className={`inline-flex shrink-0 items-center justify-center ${
                    active ? 'text-white' : 'text-text-sidebar-muted group-hover:text-text-darkest'
                }`}
            >
                {category.icon === 'save' ? (
                    <SaveIcon className="h-[18px] w-[18px]" />
                ) : (
                    <NavigationIcon type={category.icon} className="h-[18px] w-[18px]" strokeWidth={1.8} />
                )}
            </span>

            <span className="min-w-0 flex-1">
                <span className="block truncate text-base leading-6">{category.label}</span>
            </span>

            {isInactive ? (
                <span className="shrink-0 rounded-[4px] bg-disabled-bg px-1.5 py-0.5 text-[10px] font-semibold text-tab-inactive-text border border-tab-primary-inactive-hover-bg">
                    {WORKSPACE_INACTIVE_BADGE_LABEL}
                </span>
            ) : null}
        </button>
    );
}
