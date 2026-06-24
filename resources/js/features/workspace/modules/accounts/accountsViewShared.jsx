import DockActionButton from '@/features/workspace/shared/DockActionButton';
import {
    CloseIcon,
    SaveIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

export function AccountsFieldLabel({ label, required = false, className = '' }) {
    return (
        <label className={`text-xs sm:text-sm text-brand-dark ${className}`.trim()}>
            {label}
            {required ? <span className="text-tab-active-border-t"> *</span> : null}
        </label>
    );
}

export function AccountsFormFieldRow({ label, required = false, className = '', children }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[180px_minmax(0,430px)] lg:items-start ${className}`.trim()}>
            <AccountsFieldLabel label={label} required={required} className="pt-2 lg:pt-1.5" />
            <div>{children}</div>
        </div>
    );
}

export function AccountsReadonlyTrailingIcon() {
    return <CloseIcon className="h-4 w-4 text-text-darkest" strokeWidth={2.4} />;
}

function renderDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

export function AccountsDockActions({ actions, onSave, onDelete, saveDisabled, saving }) {
    return (
        <div className="flex flex-row gap-3 lg:flex-col">
            {actions.map((action) => {
                const isSaveAction = action.id === 'save';
                const isDeleteAction = action.id === 'delete';

                return (
                    <DockActionButton
                        key={action.id}
                        label={action.label}
                        tone={isSaveAction ? 'primary' : action.tone}
                        icon={renderDockIcon(action.icon)}
                        onClick={isSaveAction ? onSave : (isDeleteAction ? onDelete : undefined)}
                        disabled={isSaveAction ? saveDisabled : saving}
                    />
                );
            })}
        </div>
    );
}
