import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon, PencilIcon } from '@/features/workspace/shared/Icons';

function DocumentModalTabButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 border-b-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer select-none max-w-[120px] sm:max-w-[160px] md:max-w-[200px] ${
                active ? 'border-illustration-danger-bg text-illustration-danger-bg' : 'border-transparent text-tab-view-active-text'
            }`.trim()}
        >
            <span className="block truncate">{label}</span>
        </button>
    );
}

export function DocumentModalFooter({ deleteLabel = 'Hapus', submitLabel = 'Lanjut', onDelete, onSubmit }) {
    return (
        <div className="flex items-center justify-between border-t border-ui-border-medium pt-3">
            <button
                type="button"
                onClick={onDelete}
                className="inline-flex h-8 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white px-4 text-xs font-medium text-brand-blue-accent"
            >
                {deleteLabel}
            </button>
            <button
                type="button"
                onClick={onSubmit}
                className="inline-flex h-8 items-center justify-center rounded-[4px] border border-import-action-blue bg-import-action-blue px-4 text-xs font-medium text-white"
            >
                {submitLabel}
            </button>
        </div>
    );
}

export default function DocumentModalLayout({
    open,
    onClose,
    title,
    tabs,
    activeTabId,
    onTabChange,
    closeAriaLabel,
    panelClassName,
    bodyClassName = 'py-3',
    children,
    footer = null,
}) {
    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-modal-overlay-dark"
            panelClassName={panelClassName}
        >
            <div className="bg-blue-900 px-4 py-2.5 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <PencilIcon className="h-4 w-4 text-white" />
                        <h2 className="text-sm font-medium">{title}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] text-white hover:text-red-600 active:text-red-800 transition cursor-pointer"
                        aria-label={closeAriaLabel}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="bg-white px-4 pb-4 pt-3">
                {tabs?.length ? (
                    <div className="flex flex-wrap border-b border-ui-border-medium">
                        {tabs.map((tab) => (
                            <DocumentModalTabButton
                                key={tab.id}
                                active={tab.id === activeTabId}
                                label={tab.label}
                                onClick={() => onTabChange(tab.id)}
                            />
                        ))}
                    </div>
                ) : null}

                <div className={bodyClassName}>{children}</div>

                {footer}
            </div>
        </ModalBase>
    );
}
