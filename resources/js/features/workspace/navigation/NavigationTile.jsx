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
        button: 'border-[#ff8b34] bg-[#ffeddc] hover:bg-[#ffe3cd]',
        icon: 'text-[#de6f13]',
        iconBg: 'bg-[#ffeddc]',
        iconText: 'text-[#de6f13]',
    },
    blue: {
        button: 'border-[#3d9ff2] bg-[#dcedff] hover:bg-[#d0e6ff]',
        icon: 'text-[#1472b6]',
        iconBg: 'bg-[#dcedff]',
        iconText: 'text-[#1472b6]',
    },
    green: {
        button: 'border-[#81c442] bg-[#ddf7d2] hover:bg-[#d3f0c4]',
        icon: 'text-[#5d930f]',
        iconBg: 'bg-[#ddf7d2]',
        iconText: 'text-[#5d930f]',
    },
    purple: {
        button: 'border-[#b56dff] bg-[#ecddff] hover:bg-[#e3d1ff]',
        icon: 'text-[#681db1]',
        iconBg: 'bg-[#ecddff]',
        iconText: 'text-[#681db1]',
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
        ? 'border-[#d1d5db] bg-[#f3f4f6] text-[#6b7280] opacity-80 saturate-0'
        : isImplemented
          ? tone.button
          : 'border-[#d6d9e2] bg-[#eef0f4] text-[#9aa3b1] opacity-80 saturate-0';
    const iconClassName = isInactive ? 'text-[#9ca3af]' : isImplemented ? tone.icon : 'text-[#9aa3b1]';
    const labelClassName = isInactive ? 'text-[#4b5563]' : isImplemented ? 'text-[#445065]' : 'text-[#8f97a7]';
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
            className={`flex w-full flex-col items-center justify-center border text-center font-normal shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition ${tileClassName} ${stateClassName} ${
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
                        isInactive ? 'bg-[#e5e7eb] text-[#5e6678]' : 'bg-[#dde2ea] text-[#7d8698]'
                    }`.trim()}
                >
                    {isInactive ? WORKSPACE_INACTIVE_BADGE_LABEL : 'Draft'}
                </span>
            ) : null}
        </button>
    );
}
