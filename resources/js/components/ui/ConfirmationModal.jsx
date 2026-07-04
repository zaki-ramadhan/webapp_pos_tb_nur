import Button from '@/components/ui/Button';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';

function ConfirmationIllustration() {
    return (
        <svg viewBox="0 0 56 56" className="h-16 w-16 shrink-0" aria-hidden="true">
            <path
                d="M28 6 45 18v20L28 50 11 38V18 18L28 6Z"
                fill="var(--color-confirmation-warning-bg)"
                stroke="var(--color-confirmation-warning-border)"
                strokeWidth="2.4"
                strokeLinejoin="round"
            />
            <path
                d="M28 18v13"
                fill="none"
                stroke="var(--color-tab-view-inactive-text)"
                strokeWidth="4.2"
                strokeLinecap="round"
            />
            <circle cx="28" cy="37.5" r="2.5" fill="var(--color-tab-view-inactive-text)" />
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
    confirmVariant = 'brand-blue',
    confirmDisabled = false,
    confirmLoading = false,
    cancelDisabled = false,
}) {
    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            disableClose={confirmLoading}
            title={title}
            closeLabel={closeLabel}
            maxWidthClassName={maxWidthClassName}
            footer={(
            <div className="flex items-center justify-between w-full">
                    {cancelLabel ? (
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={onClose}
                            disabled={cancelDisabled || confirmLoading}
                            className="min-w-[60px] rounded-[4px] border-brand-blue-border-light text-brand-blue-dark shadow-none"
                        >
                            {cancelLabel}
                        </Button>
                    ) : (
                        <span />
                    )}

                    <Button
                        variant={confirmVariant}
                        size="md"
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        loading={confirmLoading}
                        loadingLabel={confirmLabel}
                        className="min-w-[60px] rounded-[4px] shadow-none"
                    >
                        {confirmLabel}
                    </Button>
                </div>
            )}
        >
            <div className="flex items-start gap-5">
                <ConfirmationIllustration />

                <div className="min-w-0 flex-1 pt-2">
                    <p className="text-xs sm:text-sm leading-6 text-red-850 whitespace-pre-line">{message}</p>
                </div>
            </div>
        </WorkspaceDialog>
    );
}
