import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import implementedWorkspacePageIds from '@/features/workspace/shared/implementedWorkspacePageIds';
import {
    isWorkspacePageInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';

const toneClasses = {
    amber: {
        button: 'border-[#ff8b34] bg-[#ffeddc] hover:bg-[#ffe3cd]',
        icon: 'text-[#de6f13]',
    },
    blue: {
        button: 'border-[#3d9ff2] bg-[#dcedff] hover:bg-[#d0e6ff]',
        icon: 'text-[#1472b6]',
    },
    green: {
        button: 'border-[#81c442] bg-[#ddf7d2] hover:bg-[#d3f0c4]',
        icon: 'text-[#5d930f]',
    },
    purple: {
        button: 'border-[#b56dff] bg-[#ecddff] hover:bg-[#e3d1ff]',
        icon: 'text-[#681db1]',
    },
};

export default function NavigationTile({ item, onSelect, dense = false }) {
    const tone = toneClasses[item.tone] ?? toneClasses.blue;
    const isInactive = isWorkspacePageInactive(item.id);
    const isImplemented = item.implemented !== false || implementedWorkspacePageIds.has(item.id);
    const isSelectable = isImplemented && !isInactive;
    const stateClassName = isInactive
        ? 'border-[#f2d38a] bg-[#fff7e3] text-[#9d7a24]'
        : isImplemented
          ? tone.button
          : 'border-[#d6d9e2] bg-[#eef0f4] text-[#9aa3b1] opacity-80 saturate-0';
    const iconClassName = isInactive ? 'text-[#c08b17]' : isImplemented ? tone.icon : 'text-[#9aa3b1]';
    const labelClassName = isInactive ? 'text-[#7d6220]' : isImplemented ? 'text-[#445065]' : 'text-[#8f97a7]';
    const tileClassName = dense
        ? 'min-h-[88px] gap-2.5 rounded-[10px] px-2 py-3.5 sm:min-h-[92px] md:min-h-[96px]'
        : 'min-h-[86px] gap-2.5 rounded-[10px] px-2 py-3.5 sm:min-h-[92px] sm:px-2 md:min-h-[98px]';
    const iconSizeClassName = dense ? 'h-8.5 w-8.5 sm:h-9 sm:w-9 md:h-10 md:w-10' : 'h-8 w-8 sm:h-8.5 sm:w-8.5 md:h-9 md:w-9';
    const labelSizeClassName = dense ? 'text-[11px] sm:text-[12px] md:text-[12.5px]' : 'text-[11px] sm:text-[11.5px] md:text-[12.5px]';
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
            title={hintLabel || item.label}
        >
            <NavigationIcon type={item.icon} className={`${iconSizeClassName} ${iconClassName}`.trim()} strokeWidth={1.65} />
            <span className={`${labelSizeClassName} font-normal leading-[1.2] ${labelClassName}`.trim()}>
                {item.label}
            </span>
            {hintLabel ? (
                <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                        isInactive ? 'bg-[#f8e6b4] text-[#8b6511]' : 'bg-[#dde2ea] text-[#7d8698]'
                    }`.trim()}
                >
                    {isInactive ? WORKSPACE_INACTIVE_BADGE_LABEL : 'Draft'}
                </span>
            ) : null}
        </button>
    );
}
