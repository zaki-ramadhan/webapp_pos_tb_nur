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

function resolveToneClassName(tone) {
    switch (tone) {
        case 'primary':
            return 'border-[#2d61ab] bg-[#2d61ab] text-white shadow-[0_4px_10px_rgba(15,23,42,0.12)]';
        case 'warning':
            return 'border-[#ffb11e] bg-[#ffb11e] text-white shadow-[0_4px_10px_rgba(15,23,42,0.1)]';
        case 'muted':
        default:
            return 'border-[#c9cdd5] bg-[#e6e6e7] text-[#9a9ea7] shadow-[0_4px_10px_rgba(15,23,42,0.08)]';
    }
}

function PanelActionButton({ action }) {
    const showLabel = action.showLabel ?? false;

    return (
        <button
            type="button"
            className={`inline-flex h-12 shrink-0 items-center justify-center rounded-[4px] border sm:h-14 ${showLabel ? 'min-w-[110px] gap-2 px-3.5 sm:min-w-[126px] sm:gap-2.5 sm:px-4' : 'w-12 sm:w-14'} ${resolveToneClassName(action.tone)}`.trim()}
            aria-label={action.label}
            title={action.label}
        >
            {resolveActionIcon(action.icon)}
            {showLabel ? <span className="text-[15px] font-medium">{action.label}</span> : null}
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
