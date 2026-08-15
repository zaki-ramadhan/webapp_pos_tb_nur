import Button from '@/components/ui/Button';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';

function ConfirmationIllustration({ iconVariant = 'warning' }) {
    if (iconVariant === 'error' || iconVariant === 'danger') {
        return <img src="/assets/images/pop-up-warning-icon.svg" className="h-14 w-14 shrink-0" alt="Error" aria-hidden="true" />;
    }
    return <img src="/assets/images/pop-up-confirm-icon.svg" className="h-14 w-14 shrink-0" alt="Confirm" aria-hidden="true" />;
}

function FormattedMessage({ message, iconVariant }) {
    if (!message) return null;
    if (typeof message !== 'string') return message;

    const lines = message.split('\n');
    const header = lines[0];
    const errorLines = lines.slice(1);

    if (lines.length > 1 && header.includes('Silakan perbaiki')) {
        return (
            <div>
                <p className="text-xs sm:text-sm font-normal leading-6 text-slate-800">{header}</p>
                <div className="mt-1 space-y-0.5 text-xs sm:text-sm leading-6 text-red-600 font-normal">
                    {errorLines.map((line, idx) => (
                        <p key={idx}>{line}</p>
                    ))}
                </div>
            </div>
        );
    }

    const isCancelOrDelete = message.includes('dibatalkan') || message.includes('dihapus') || iconVariant === 'error' || iconVariant === 'danger' || iconVariant === 'warning';
    const textColor = isCancelOrDelete ? 'text-red-600 font-normal' : 'text-slate-800 font-normal';

    return <p className={`text-sm sm:text-base leading-6 whitespace-pre-line ${textColor}`}>{message}</p>;
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
    iconVariant = 'warning',
}) {
    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            disableClose={confirmLoading}
            title={title}
            closeLabel={closeLabel}
            maxWidthClassName={maxWidthClassName}
            footerClassName="bg-white px-3.5 py-2.5 sm:px-4"
            footer={(
            <div className="flex items-center justify-between w-full">
                    {cancelLabel ? (
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={onClose}
                            disabled={cancelDisabled || confirmLoading}
                            className="min-w-[60px] rounded-[4px] border-brand-blue text-brand-blue hover:bg-brand-blue/5 shadow-none"
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
                <ConfirmationIllustration iconVariant={iconVariant} />

                <div className="min-w-0 flex-1 pt-2">
                    <FormattedMessage message={message} iconVariant={iconVariant} />
                </div>
            </div>
        </WorkspaceDialog>
    );
}
