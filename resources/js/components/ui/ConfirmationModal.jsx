import Button from '@/components/ui/Button';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';

function ConfirmationIllustration() {
    return (
        <img src="/assets/images/pop-up-confirm-icon.svg" className="h-14 w-14 shrink-0" alt="Confirm" aria-hidden="true" />
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
    maxWidthClassName = 'max-w-[480px]',
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
