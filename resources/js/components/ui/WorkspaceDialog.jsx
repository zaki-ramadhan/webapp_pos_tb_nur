import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon, InfoIcon } from '@/features/workspace/shared/Icons';

export default function WorkspaceDialog({
    open,
    onClose,
    title = '',
    closeLabel = 'Tutup modal',
    headerIcon = null,
    disableClose = false,
    hideCloseButton = false,
    maxWidthClassName = 'max-w-[620px]',
    contentClassName = 'bg-white px-5 pt-4 pb-2.5 sm:px-6 sm:pt-5 sm:pb-3',
    children,
    footer = null,
    footerClassName = 'bg-white px-3.5 pt-1 pb-3 sm:px-4 sm:pb-3.5',
}) {
    const HeaderIcon = headerIcon ?? InfoIcon;

    return (
        <ModalBase
            open={open}
            onBackdropClick={disableClose ? null : onClose}
            className="bg-modal-overlay-bg px-3 py-4 sm:px-4 sm:py-6"
            panelClassName={`${maxWidthClassName} overflow-hidden rounded-[4px] sm:rounded-[4px] px-0 py-0 shadow-dialog-large`.trim()}
        >
            <div className="border-b border-[#0A2A55] bg-[#0A2A55] px-4 py-2 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2">
                        {HeaderIcon ? <HeaderIcon className="h-4 w-4 shrink-0 text-white" /> : null}
                        <h2 className="truncate text-sm font-normal">{title}</h2>
                    </div>

                    {!hideCloseButton ? (
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={disableClose}
                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-white/90 transition-colors hover:text-[#A20025] active:text-red-950 cursor-pointer"
                            aria-label={closeLabel}
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>

            <div className={contentClassName}>{children}</div>

            {footer ? <div className={footerClassName}>{footer}</div> : null}
        </ModalBase>
    );
}
