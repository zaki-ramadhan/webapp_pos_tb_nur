import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon, PencilIcon } from '@/features/workspace/shared/Icons';

function DocumentModalTabButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`border-b-2 px-3 py-2 text-[16px] ${
                active ? 'border-[#ff4836] text-[#ff4836]' : 'border-transparent text-[#5f6980]'
            }`.trim()}
        >
            {label}
        </button>
    );
}

export function DocumentModalFooter({ deleteLabel = 'Hapus', submitLabel = 'Lanjut' }) {
    return (
        <div className="flex items-center justify-between border-t border-[#d8dde7] pt-3">
            <button
                type="button"
                className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-5 text-[18px] text-[#21539b]"
            >
                {deleteLabel}
            </button>
            <button
                type="button"
                className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#1d52a5] bg-[#1d52a5] px-6 text-[18px] text-white"
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
            <div className="bg-[#173968] px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <PencilIcon className="h-5 w-5 text-white" />
                        <h2 className="text-[16px] font-medium">{title}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-white transition hover:bg-white/10"
                        aria-label={closeAriaLabel}
                    >
                        <CloseIcon className="h-5 w-5 text-white" />
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
