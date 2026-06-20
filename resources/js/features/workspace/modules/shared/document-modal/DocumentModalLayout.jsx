import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon, PencilIcon } from '@/features/workspace/shared/Icons';

function DocumentModalTabButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 border-b-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer select-none max-w-[120px] sm:max-w-[160px] md:max-w-[200px] ${
                active ? 'border-[#ff4836] text-[#ff4836]' : 'border-transparent text-[#5f6980]'
            }`.trim()}
        >
            <span className="block truncate">{label}</span>
        </button>
    );
}

export function DocumentModalFooter({ deleteLabel = 'Hapus', submitLabel = 'Lanjut', onDelete, onSubmit }) {
    return (
        <div className="flex items-center justify-between border-t border-[#d8dde7] pt-3">
            <button
                type="button"
                onClick={onDelete}
                className="inline-flex h-8 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-xs font-medium text-[#21539b]"
            >
                {deleteLabel}
            </button>
            <button
                type="button"
                onClick={onSubmit}
                className="inline-flex h-8 items-center justify-center rounded-[4px] border border-[#1d52a5] bg-[#1d52a5] px-4 text-xs font-medium text-white"
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
            className="bg-[rgba(15,23,42,0.72)]"
            panelClassName={panelClassName}
        >
            <div className="bg-[#173968] px-4 py-2.5 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <PencilIcon className="h-4 w-4 text-white" />
                        <h2 className="text-sm font-medium">{title}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] text-white transition hover:bg-white/10 cursor-pointer"
                        aria-label={closeAriaLabel}
                    >
                        <CloseIcon className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>

            <div className="bg-white px-4 pb-4 pt-3">
                {tabs?.length ? (
                    <div className="flex flex-wrap border-b border-[#d8dde7]">
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
