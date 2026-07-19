import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon, PencilIcon } from '@/features/workspace/shared/Icons';

function DocumentModalTabButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 border-b-2 px-2.5 py-1.5 text-xs sm:text-sm font-normal text-brand-dark cursor-pointer select-none max-w-[120px] sm:max-w-[160px] md:max-w-[200px] -mb-[1px] ${
                active ? 'border-illustration-danger-bg text-illustration-danger-bg font-normal' : 'border-transparent text-tab-view-active-text'
            }`.trim()}
        >
            <span className="block truncate">{label}</span>
        </button>
    );
}

export function DocumentModalFooter({ deleteLabel = 'Hapus', submitLabel = 'Lanjut', onDelete, onSubmit }) {
    return (
        <div className="flex items-center justify-between border-t border-ui-border-medium pt-3">
            {onDelete ? (
                <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex h-10 items-center justify-center rounded-[4px] border border-brand-blue bg-white px-5 text-sm sm:text-base font-normal text-brand-blue hover:bg-brand-blue/5 active:scale-[0.98] transition cursor-pointer"
                >
                    {deleteLabel}
                </button>
            ) : (
                <div />
            )}
            <button
                type="button"
                onClick={onSubmit}
                className="inline-flex h-10 items-center justify-center rounded-[4px] border border-brand-blue bg-brand-blue px-5 text-sm sm:text-base font-normal text-white hover:bg-brand-blue-hover active:scale-[0.98] transition cursor-pointer shadow-button-primary"
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
            <div className="px-4 py-2 text-white" style={{ backgroundColor: '#0A2A55' }}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <PencilIcon className="h-4 w-4 text-white" />
                        <h2 className="text-sm font-normal">{title}</h2>
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
 
            <div className="bg-white px-4 pb-3 pt-2">
                {tabs?.length ? (
                    <div className="flex flex-wrap border-b border-ui-border-medium mt-0 mb-2">
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
