import { usePage } from '@inertiajs/react';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import implementedWorkspacePageIds from '@/features/workspace/shared/implementedWorkspacePageIds';
import {
    isWorkspacePageInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';

export const toneClasses = {
    amber: {
        button: 'border-nav-tile-amber-border bg-nav-tile-amber-bg hover:bg-nav-tile-amber-hover',
        icon: 'text-nav-tile-amber-text',
        iconBg: 'bg-nav-tile-amber-bg',
        iconText: 'text-nav-tile-amber-text',
    },
    blue: {
        button: 'border-nav-tile-blue-border bg-nav-tile-blue-bg hover:bg-nav-tile-blue-hover',
        icon: 'text-nav-tile-blue-text',
        iconBg: 'bg-nav-tile-blue-bg',
        iconText: 'text-nav-tile-blue-text',
    },
    green: {
        button: 'border-nav-tile-green-border bg-nav-tile-green-bg hover:bg-nav-tile-green-hover',
        icon: 'text-nav-tile-green-text',
        iconBg: 'bg-nav-tile-green-bg',
        iconText: 'text-nav-tile-green-text',
    },
    purple: {
        button: 'border-nav-tile-purple-border bg-nav-tile-purple-bg hover:bg-nav-tile-purple-hover',
        icon: 'text-nav-tile-purple-text',
        iconBg: 'bg-nav-tile-purple-bg',
        iconText: 'text-nav-tile-purple-text',
    },
};

export default function NavigationTile({ item, onSelect, dense = false }) {
    const { props } = usePage();
    const preferences = props.dashboard?.preferences ?? {};
    const tone = toneClasses[item.tone] ?? toneClasses.blue;
    const isInactive = isWorkspacePageInactive(item.id, preferences);
    const isImplemented = item.implemented !== false || implementedWorkspacePageIds.has(item.id);
    const isSelectable = isImplemented && !isInactive;
    const stateClassName = isInactive
        ? 'border-tab-primary-inactive-hover-bg bg-ui-bg-panel text-tab-view-active-text opacity-80 saturate-0'
        : isImplemented
          ? tone.button
          : 'border-tab-overflow-border bg-table-row-border text-text-inactive opacity-80 saturate-0';
    const iconClassName = isInactive ? 'text-disabled-text' : isImplemented ? tone.icon : 'text-text-inactive';
    const labelClassName = isInactive ? 'text-text-sidebar-muted' : isImplemented ? 'text-tab-active-text' : 'text-text-light';
    const tileClassName = dense
        ? 'min-h-[88px] gap-2.5 rounded-[10px] px-2 py-3.5 sm:min-h-[92px] md:min-h-[96px]'
        : 'min-h-[86px] gap-2.5 rounded-[10px] px-2 py-3.5 sm:min-h-[92px] sm:px-2 md:min-h-[98px]';
    const iconSizeClassName = dense ? 'h-8.5 w-8.5 sm:h-9 sm:w-9 md:h-10 md:w-10' : 'h-8 w-8 sm:h-8.5 sm:w-8.5 md:h-9 md:w-9';
    const labelSizeClassName = dense ? 'text-xs sm:text-xs md:text-[12.5px]' : 'text-xs sm:text-[11.5px] md:text-[12.5px]';
    const hintLabel = isInactive ? WORKSPACE_INACTIVE_HINT : isImplemented ? '' : 'Belum diimplementasikan penuh';

    return (
        <button
            type="button"
            onClick={() => {
                if (isSelectable) {
                    onSelect?.(item);
                }
            }}
            className={`flex w-full flex-col items-center justify-center border text-center font-normal shadow-tile-navigation transition ${tileClassName} ${stateClassName} ${
                isSelectable ? '' : 'cursor-not-allowed'
            }`.trim()}
            aria-disabled={!isSelectable}
        >
            <NavigationIcon type={item.icon} className={`${iconSizeClassName} ${iconClassName}`.trim()} strokeWidth={1.65} />
            <span className={`${labelSizeClassName} font-normal leading-[1.2] ${labelClassName}`.trim()}>
                {item.label}
            </span>
            {hintLabel ? (
                <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                        isInactive ? 'bg-disabled-bg text-tab-inactive-text' : 'bg-bg-workspace-tab-inactive text-text-workspace-tab-inactive'
                    }`.trim()}
                >
                    {isInactive ? WORKSPACE_INACTIVE_BADGE_LABEL : 'Draft'}
                </span>
            ) : null}
        </button>
    );
}
