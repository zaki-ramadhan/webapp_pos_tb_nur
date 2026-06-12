import Spinner from '@/components/ui/Spinner';
import { IdeaIcon, SaveIcon } from '@/features/workspace/shared/Icons';

function resolveActionIcon(icon) {
    switch (icon) {
        case 'save':
            return <SaveIcon />;
        case 'idea':
            return <IdeaIcon className="h-6 w-6" />;
        default:
            return null;
    }
}

function resolveToneClassName(tone, isDisabled) {
    if (isDisabled) {
        switch (tone) {
            case 'primary':
                return 'border-[#2d61ab]/60 bg-[#2d61ab]/60 text-white/60 pointer-events-none cursor-default';
            case 'warning':
                return 'border-[#ffb11e]/60 bg-[#ffb11e]/60 text-white/60 pointer-events-none cursor-default';
            case 'muted':
            default:
                return 'border-[#c9cdd5]/60 bg-[#e6e6e7]/60 text-[#9a9ea7]/60 pointer-events-none cursor-default';
        }
    }
    switch (tone) {
        case 'primary':
            return 'border-[#2d61ab] bg-[#2d61ab] text-white shadow-[0_4px_10px_rgba(15,23,42,0.12)] hover:bg-[#27579c] cursor-pointer';
        case 'warning':
            return 'border-[#ffb11e] bg-[#ffb11e] text-white shadow-[0_4px_10px_rgba(15,23,42,0.1)] hover:bg-[#ea9f13] cursor-pointer';
        case 'muted':
        default:
            return 'border-[#c9cdd5] bg-[#e6e6e7] text-[#9a9ea7] shadow-[0_4px_10px_rgba(15,23,42,0.08)] hover:bg-[#dbdbdc] cursor-pointer';
    }
}

function PanelActionButton({ action }) {
    const showLabel = action.showLabel ?? false;
    const isDisabled = action.disabled || action.loading;

    return (
        <button
            type="button"
            className={`inline-flex h-12 shrink-0 items-center justify-center rounded-[4px] border sm:h-14 transition ${showLabel ? 'min-w-[110px] gap-2 px-3.5 sm:min-w-[126px] sm:gap-2.5 sm:px-4' : 'w-12 sm:w-14'} ${resolveToneClassName(action.tone, isDisabled)} ${isDisabled ? 'opacity-55 shadow-none' : ''}`.trim()}
            aria-label={action.label}
            title={action.label}
            onClick={isDisabled ? undefined : action.onClick}
            disabled={isDisabled}
        >
            {action.loading ? (
                <Spinner className="h-6 w-6 text-current" />
            ) : (
                resolveActionIcon(action.icon)
            )}
            {showLabel ? <span className="text-base font-medium">{action.label}</span> : null}
        </button>
    );
}

export default function PanelActions({ actions = [] }) {
    if (!actions.length) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-start justify-end gap-3">
            {actions.map((action) => (
                <PanelActionButton key={action.id} action={action} />
            ))}
        </div>
    );
}
