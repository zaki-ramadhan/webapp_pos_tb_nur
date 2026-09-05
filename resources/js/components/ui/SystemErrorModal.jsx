import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Button from '@/components/ui/Button';
import ModalBase from '@/components/ui/ModalBase';
import ErrorIllustration from '@/components/ui/ErrorIllustration';
import { AlertTriangleIcon, CloseIcon, InfoIcon } from '@/features/workspace/shared/Icons';

function normalizeMessages(messages = [], message = '') {
    if (messages.length) {
        return messages;
    }

    if (message) {
        return [message];
    }

    return [];
}

export default function SystemErrorModal({
    open,
    title = 'Terjadi Permasalahan pada Pemrosesan',
    description = 'Silakan perbaiki permasalahan berikut ini:',
    message = '',
    messages = [],
    copyLabel = 'Salin',
    confirmLabel = 'OK',
    cancelLabel = null,
    copiedLabel = 'Tersalin',
    closeLabel = 'Tutup modal error',
    showCloseButton = true,
    onClose,
    onConfirm,
    onCancel,
    onCopy,
    dismissible = true,
    maxWidthClassName = 'max-w-[520px]',
}) {
    const [copyState, setCopyState] = useState('idle');
    const normalizedMessages = useMemo(() => normalizeMessages(messages, message), [message, messages]);

    useEffect(() => {
        if (!open || !dismissible) {
            return undefined;
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                onClose?.();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [dismissible, onClose, open]);

    useEffect(() => {
        if (!open) {
            setCopyState('idle');
        }
    }, [open]);

    function handleConfirm(event) {
        if (event) {
            event.stopPropagation();
        }
        if (onConfirm) {
            onConfirm();
        } else {
            onClose?.();
        }
    }

    function handleClose(event) {
        if (event) {
            event.stopPropagation();
        }
        onClose?.();
    }

    function handleCancel(event) {
        if (event) {
            event.stopPropagation();
        }
        if (onCancel) {
            onCancel();
        } else {
            onClose?.();
        }
    }

    const finalDescription = (description === '' || description === null)
        ? ''
        : ((normalizedMessages.length === 0 && description !== 'Silakan perbaiki permasalahan berikut ini:')
            ? 'Silakan perbaiki permasalahan berikut ini:'
            : description);

    const finalMessages = (normalizedMessages.length === 0 && description !== 'Silakan perbaiki permasalahan berikut ini:')
        ? (description ? [description] : [])
        : normalizedMessages;

    const hasMessages = finalMessages.length > 0;
    const isConfirmationTitle = title === 'Konfirmasi';

    return (
        <ModalBase
            open={open}
            onBackdropClick={dismissible ? handleClose : undefined}
            className="bg-modal-overlay-bg px-3 py-4 sm:px-4 sm:py-6"
            panelClassName={`${maxWidthClassName} overflow-hidden rounded-[4px] sm:rounded-[4px] px-0 py-0 shadow-dialog-large`.trim()}
        >
            <div className="border-b border-[#081f3b] bg-[#0A2A55] px-4 py-2 text-white sm:px-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2">
                        {isConfirmationTitle ? (
                            <InfoIcon className="h-5 w-5 text-white shrink-0" strokeWidth={2.4} />
                        ) : (
                            <AlertTriangleIcon className="h-5 w-5 text-white shrink-0" strokeWidth={2.4} />
                        )}
                        <h2 className="truncate text-sm font-normal">{title}</h2>
                    </div>

                    {dismissible && showCloseButton ? (
                        <button
                            type="button"
                            onClick={handleClose}
                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-white/90 transition-colors hover:text-[#A20025] active:text-red-950 cursor-pointer"
                            aria-label={closeLabel}
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="bg-white px-4 pt-5 pb-2.5 sm:px-5 sm:pt-6 sm:pb-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                    <div className="flex justify-center sm:justify-start shrink-0">
                        <ErrorIllustration />
                    </div>

                    <div className={`min-w-0 flex-1 flex flex-col ${hasMessages && finalDescription ? 'justify-between py-0.5' : 'justify-center'}`}>
                        {finalDescription ? (
                            <p className="text-sm sm:text-[15px] font-normal leading-5 text-brand-dark">{finalDescription}</p>
                        ) : null}

                        {hasMessages && (
                            <div className={finalDescription ? 'mt-2.5' : ''}>
                                {finalMessages.length === 1 ? (
                                    <p className="text-sm sm:text-[15px] font-normal leading-5 text-[#A20025]">
                                        {finalMessages[0]}
                                    </p>
                                ) : (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {finalMessages.map((item, index) => (
                                            <li key={`${item}-${index}`} className="text-sm sm:text-[15px] font-normal leading-6 text-[#A20025]">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-3.5 flex justify-end gap-2">
                    <Button
                        type="button"
                        size="md"
                        onClick={handleConfirm}
                        className="min-w-[64px] rounded-[4px] bg-brand-blue text-white shadow-none hover:bg-brand-blue-hover px-4 py-1.5 text-sm font-normal cursor-pointer"
                    >
                        {confirmLabel}
                    </Button>
                    {cancelLabel ? (
                        <Button
                            type="button"
                            size="md"
                            variant="secondary"
                            onClick={handleCancel}
                            className="min-w-[64px] rounded-[4px] border border-brand-blue text-brand-blue bg-white shadow-none hover:bg-blue-50 px-4 py-1.5 text-sm font-normal cursor-pointer"
                        >
                            {cancelLabel}
                        </Button>
                    ) : null}
                </div>
            </div>
        </ModalBase>
    );
}

function SystemErrorModalContainer({
    title,
    description,
    message,
    messages,
    confirmLabel,
    copyLabel,
    copiedLabel,
    resolve,
    onDestroy,
}) {
    const [open, setOpen] = useState(true);
    const hasClosedRef = useRef(false);

    function cleanup(result) {
        if (hasClosedRef.current) return;
        hasClosedRef.current = true;
        setOpen(false);
        resolve(result);
        setTimeout(() => {
            onDestroy();
        }, 100);
    }

    return (
        <SystemErrorModal
            open={open}
            title={title}
            description={description}
            message={message}
            messages={messages}
            confirmLabel={confirmLabel}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
            onClose={() => cleanup(false)}
            onConfirm={() => cleanup(true)}
        />
    );
}


export function showSystemErrorModal(options = {}) {
    return new Promise((resolve) => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const root = createRoot(div);

        function onDestroy() {
            root.unmount();
            div.remove();
        }

        root.render(
            <SystemErrorModalContainer
                title={options.title}
                description={options.description}
                message={options.message}
                messages={options.messages}
                confirmLabel={options.confirmLabel}
                copyLabel={options.copyLabel}
                copiedLabel={options.copiedLabel}
                resolve={resolve}
                onDestroy={onDestroy}
            />
        );
    });
}

