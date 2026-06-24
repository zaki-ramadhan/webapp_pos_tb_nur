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
                return 'border-blue-570/60 bg-blue-570/60 text-white/60 pointer-events-none cursor-default';
            case 'warning':
                return 'border-warning/60 bg-warning/60 text-white/60 pointer-events-none cursor-default';
            case 'muted':
            default:
                return 'border-border-disabled-btn/60 bg-bg-disabled-btn/60 text-text-disabled-btn/60 pointer-events-none cursor-default';
        }
    }
    switch (tone) {
        case 'primary':
            return 'border-blue-570 bg-blue-570 text-white shadow-button-glow-blue hover:bg-bg-import-action-hover cursor-pointer';
        case 'warning':
            return 'border-warning bg-warning text-white shadow-button-glow-orange hover:bg-warning cursor-pointer';
        case 'muted':
        default:
            return 'border-border-disabled-btn bg-bg-disabled-btn text-text-disabled-btn shadow-card-medium hover:bg-tab-primary-inactive-bg cursor-pointer';
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
