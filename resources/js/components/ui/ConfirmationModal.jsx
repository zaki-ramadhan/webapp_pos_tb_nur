import Button from '@/components/ui/Button';
import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon, InfoIcon } from '@/features/workspace/shared/Icons';

function ConfirmationIllustration() {
    return (
        <svg viewBox="0 0 56 56" className="h-16 w-16 shrink-0" aria-hidden="true">
            <path
                d="M28 6 45 18v20L28 50 11 38V18 18L28 6Z"
                fill="#ffc93b"
                stroke="#162746"
                strokeWidth="2.4"
                strokeLinejoin="round"
            />
            <path
                d="M28 18v13"
                fill="none"
                stroke="#fff"
                strokeWidth="4.2"
                strokeLinecap="round"
            />
            <circle cx="28" cy="37.5" r="2.5" fill="#fff" />
        </svg>
    );
}

export default function ConfirmationModal({
    open,
    title = 'Konfirmasi',
    message = '',
    confirmLabel = 'Ya',
    cancelLabel = 'Batal',
    closeLabel = 'Tutup modal konfirmasi',
    onClose,
    onConfirm,
    maxWidthClassName = 'max-w-[620px]',
}) {
    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-[rgba(20,30,49,0.58)] px-3 py-4 sm:px-4 sm:py-6"
            panelClassName={`${maxWidthClassName} overflow-hidden rounded-[6px] px-0 py-0 shadow-[0_14px_30px_rgba(15,23,42,0.2)]`.trim()}
        >
            <div className="border-b border-[#14345c] bg-[#173664] px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <InfoIcon className="h-5 w-5 text-white" />
                        <h2 className="truncate text-[15px] font-medium sm:text-[16px]">{title}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] text-white/90 transition hover:bg-white/10"
                        aria-label={closeLabel}
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-start gap-5">
                    <ConfirmationIllustration />

                    <div className="min-w-0 flex-1 pt-2">
                        <p className="text-[16px] leading-6 text-[#db2347] sm:text-[17px]">{message}</p>
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2.5">
                    <Button
                        size="md"
                        onClick={onConfirm}
                        className="h-10 min-w-[60px] rounded-[4px] bg-[#1f57a9] px-5 text-[15px] shadow-none hover:bg-[#1a4c95]"
                    >
                        {confirmLabel}
                    </Button>

                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                        className="h-10 min-w-[60px] rounded-[4px] border-[#8ec1ef] px-4 text-[15px] text-[#1a63b3] shadow-none"
                    >
                        {cancelLabel}
                    </Button>
                </div>
            </div>
        </ModalBase>
    );
}
