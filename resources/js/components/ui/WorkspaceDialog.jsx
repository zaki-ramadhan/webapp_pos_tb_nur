import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon, InfoIcon } from '@/features/workspace/shared/Icons';

export default function WorkspaceDialog({
    open,
    onClose,
    title = '',
    closeLabel = 'Tutup modal',
    headerIcon = null,
    disableClose = false,
    maxWidthClassName = 'max-w-[620px]',
    contentClassName = 'bg-white px-5 py-4 sm:px-6 sm:py-5',
    children,
    footer = null,
    footerClassName = 'border-t border-[#d9dee8] bg-white px-5 py-3 sm:px-6',
}) {
    const HeaderIcon = headerIcon ?? InfoIcon;

    return (
        <ModalBase
            open={open}
            onBackdropClick={disableClose ? null : onClose}
            className="bg-[rgba(20,30,49,0.58)] px-3 py-4 sm:px-4 sm:py-6"
            panelClassName={`${maxWidthClassName} overflow-hidden rounded-[6px] px-0 py-0 shadow-[0_14px_30px_rgba(15,23,42,0.2)]`.trim()}
        >
            <div className="border-b border-[#14345c] bg-[#173664] px-4 py-2.5 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <HeaderIcon className="h-4 w-4 text-white" />
                        <h2 className="truncate text-sm font-medium">{title}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={disableClose}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-white/90 transition hover:bg-white/10 cursor-pointer"
                        aria-label={closeLabel}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className={contentClassName}>{children}</div>

            {footer ? <div className={footerClassName}>{footer}</div> : null}
        </ModalBase>
    );
}
