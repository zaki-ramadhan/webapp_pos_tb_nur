import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Button from '@/components/ui/Button';
import ModalBase from '@/components/ui/ModalBase';
import ErrorIllustration from '@/components/ui/ErrorIllustration';
import { CloseIcon } from '@/features/workspace/shared/Icons';

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
    copiedLabel = 'Tersalin',
    closeLabel = 'Tutup modal error',
    onClose,
    onConfirm,
    onCopy,
    dismissible = true,
    maxWidthClassName = 'max-w-[780px]',
}) {
    const [copyState, setCopyState] = useState('idle');
    const normalizedMessages = useMemo(() => normalizeMessages(messages, message), [message, messages]);
    const joinedMessage = normalizedMessages.join('\n');

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

    async function handleCopy() {
        if (!joinedMessage) {
            onCopy?.('');
            return;
        }

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(joinedMessage);
            }

            setCopyState('copied');
            onCopy?.(joinedMessage);
        } catch {
            setCopyState('copied');
            onCopy?.(joinedMessage);
        }
    }

    function handleConfirm() {
        onConfirm?.();
        onClose?.();
    }

    return (
        <ModalBase
            open={open}
            onBackdropClick={dismissible ? onClose : undefined}
            className="bg-[rgba(20,30,49,0.58)] px-3 py-4 sm:px-4 sm:py-6"
            panelClassName={`${maxWidthClassName} overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_14px_30px_rgba(15,23,42,0.2)]`.trim()}
        >
            <div className="border-b border-[#133663] bg-[#163a6d] px-4 py-2.5 text-white sm:px-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <h2 className="truncate text-sm font-medium">{title}</h2>
                    </div>

                    {dismissible ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-white/90 transition hover:bg-white/10"
                            aria-label={closeLabel}
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="bg-white px-4 pt-5 pb-3 sm:px-5 sm:pt-6 sm:pb-3">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex justify-center sm:justify-start">
                        <ErrorIllustration />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2.5">
                        <p className="text-xs sm:text-sm leading-6 text-[#1f2436]">{description}</p>

                        <div className="space-y-1.5">
                            {normalizedMessages.map((item, index) => (
                                <p key={`${item}-${index}`} className="text-xs sm:text-sm leading-6 text-[#db2347]">
                                    {item}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCopy}
                            className="min-w-[80px] rounded-[6px] border-[#9ec0ec] text-[#1a63b3] shadow-none"
                        >
                            {copyState === 'copied' ? copiedLabel : copyLabel}
                        </Button>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleConfirm}
                            className="min-w-[80px] rounded-[6px] bg-[#1f57a9] text-white shadow-none hover:bg-[#1a4c95]"
                        >
                            {confirmLabel}
                        </Button>
                    </div>
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

    function handleClose() {
        setOpen(false);
        setTimeout(() => {
            resolve(false);
            onDestroy();
        }, 300);
    }

    function handleConfirm() {
        setOpen(false);
        setTimeout(() => {
            resolve(true);
            onDestroy();
        }, 300);
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
            onClose={handleClose}
            onConfirm={handleConfirm}
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

