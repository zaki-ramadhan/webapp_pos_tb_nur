import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Button from '@/components/ui/Button';
import ModalBase from '@/components/ui/ModalBase';
import ErrorIllustration from '@/components/ui/ErrorIllustration';
import { AlertTriangleFilledIcon, CloseIcon, InfoFilledIcon } from '@/features/workspace/shared/Icons';

function PopUpInfoIllustration({ className = 'h-14 w-14 shrink-0' }) {
    return (
        <svg className={className} viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M27.5001 50.0301C39.9873 50.0301 50.1101 39.9072 50.1101 27.4201C50.1101 14.9329 39.9873 4.81006 27.5001 4.81006C15.013 4.81006 4.89014 14.9329 4.89014 27.4201C4.89014 39.9072 15.013 50.0301 27.5001 50.0301Z" fill="#339EFF" />
            <path d="M8.56007 39.78C5.9266 35.739 4.65384 30.9619 4.92758 26.1463C5.20133 21.3307 7.00725 16.7286 10.0817 13.012C13.1562 9.29545 17.3381 6.65894 22.0171 5.48741C26.6961 4.31589 31.627 4.67069 36.0901 6.50004C36.4201 6.63004 36.7501 6.78004 37.0901 6.93004" stroke="#0A2A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.4499 44.3C12.0999 43.99 11.7699 43.67 11.4499 43.3L11.1099 43" stroke="#0A2A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M46.5998 15.3101C49.3513 19.6379 50.5498 24.7725 49.9986 29.8712C49.4473 34.97 47.179 39.7298 43.5661 43.3695C39.9531 47.0092 35.2101 49.3125 30.1156 49.9013C25.0211 50.4902 19.8778 49.3296 15.5298 46.6101" stroke="#0A2A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M41.5298 9.68018C42.1298 10.1602 42.7098 10.6802 43.2598 11.2002" stroke="#0A2A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M27.3701 20.8201C27.803 20.9001 28.2481 20.8839 28.674 20.7727C29.0999 20.6614 29.496 20.4578 29.8344 20.1762C30.1728 19.8947 30.445 19.5422 30.6319 19.1436C30.8187 18.7451 30.9156 18.3103 30.9156 17.8701C30.9156 17.4299 30.8187 16.9952 30.6319 16.5966C30.445 16.1981 30.1728 15.8455 29.8344 15.564C29.496 15.2825 29.0999 15.0788 28.674 14.9676C28.2481 14.8563 27.803 14.8401 27.3701 14.9201C26.9373 14.8401 26.4922 14.8563 26.0663 14.9676C25.6404 15.0788 25.2443 15.2825 24.9059 15.564C24.5675 15.8455 24.2953 16.1981 24.1084 16.5966C23.9216 16.9952 23.8247 17.4299 23.8247 17.8701C23.8247 18.3103 23.9216 18.7451 24.1084 19.1436C24.2953 19.5422 24.5675 19.8947 24.9059 20.1762C25.2443 20.4578 25.6404 20.6614 26.0663 20.7727C26.4922 20.8839 26.9373 20.9001 27.3701 20.8201V20.8201Z" fill="white" />
            <path d="M29.9198 24.5898C29.9198 23.1649 28.7647 22.0098 27.3398 22.0098C25.9149 22.0098 24.7598 23.1649 24.7598 24.5898V37.3398C24.7598 38.7647 25.9149 39.9198 27.3398 39.9198C28.7647 39.9198 29.9198 38.7647 29.9198 37.3398V24.5898Z" fill="white" />
        </svg>
    );
}

function normalizeMessages(messages = [], message = '', isInfo = false) {
    const raw = (Array.isArray(messages) && messages.length > 0)
        ? messages
        : (message ? (Array.isArray(message) ? message : [message]) : []);

    const flattened = raw.flatMap((item) => {
        if (typeof item === 'string') {
            if (item.includes(' • ')) return item.split(' • ');
            if (item.includes('\n')) return item.split('\n');
        }
        return item;
    });

    return flattened.map((item) => {
        const s = String(item ?? '').trim();
        if (!s) return '';
        if (isInfo) return s;
        if (!s.toLowerCase().includes('harus') && !s.toLowerCase().includes('wajib') && !s.toLowerCase().includes('tidak') && !s.toLowerCase().includes('minimal') && !s.toLowerCase().includes('melebihi') && !s.toLowerCase().includes('sudah') && !s.toLowerCase().includes('gagal') && !s.toLowerCase().includes('sesuai')) {
            return `${s} harus diisi`;
        }
        return s.replace(/\.$/, '');
    }).filter(Boolean);
}

export default function SystemErrorModal({
    open,
    type = 'error',
    title,
    description,
    message = '',
    messages = [],
    copyLabel = 'Salin',
    confirmLabel = 'OK',
    cancelLabel = null,
    copiedLabel = 'Tersalin',
    closeLabel = 'Tutup modal',
    showCloseButton = true,
    onClose,
    onConfirm,
    onCancel,
    onCopy,
    dismissible = true,
    maxWidthClassName = 'max-w-[720px]',
}) {
    const isInfo = type === 'info' || title === 'Informasi';
    const isConfirmationTitle = type === 'confirmation' || title === 'Konfirmasi';
    const defaultTitle = isInfo ? 'Informasi' : 'Terjadi Permasalahan pada Pemrosesan';
    const activeTitle = title ?? defaultTitle;

    const [copyState, setCopyState] = useState('idle');
    const normalizedMessages = useMemo(() => normalizeMessages(messages, message, isInfo), [isInfo, message, messages]);

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

    const defaultDescription = isInfo ? '' : 'Silakan perbaiki permasalahan berikut ini:';
    const activeDescription = description !== undefined ? description : defaultDescription;

    const finalDescription = (activeDescription === '' || activeDescription === null)
        ? ''
        : ((normalizedMessages.length === 0 && activeDescription !== 'Silakan perbaiki permasalahan berikut ini:')
            ? (isInfo ? '' : 'Silakan perbaiki permasalahan berikut ini:')
            : activeDescription);

    const finalMessages = (normalizedMessages.length === 0 && activeDescription !== '' && activeDescription !== 'Silakan perbaiki permasalahan berikut ini:')
        ? (activeDescription ? [activeDescription] : [])
        : normalizedMessages;

    const hasMessages = finalMessages.length > 0;

    return (
        <ModalBase
            open={open}
            onBackdropClick={dismissible ? handleClose : undefined}
            className="bg-modal-overlay-bg px-3 py-4 sm:px-4 sm:py-6"
            panelClassName={`${maxWidthClassName} overflow-hidden rounded-[4px] sm:rounded-[4px] px-0 py-0 shadow-dialog-large`.trim()}
        >
            <div data-modal-header="true" className="border-b border-[#081f3b] bg-[#0A2A55] px-4 py-2 text-white sm:px-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2">
                        {isInfo || isConfirmationTitle ? (
                            <InfoFilledIcon className="h-5 w-5 text-white shrink-0" />
                        ) : (
                            <AlertTriangleFilledIcon className="h-5 w-5 text-white shrink-0" />
                        )}
                        <h2 className="truncate text-sm font-normal">{activeTitle}</h2>
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
                        {isInfo ? (
                            <PopUpInfoIllustration />
                        ) : (
                            <ErrorIllustration />
                        )}
                    </div>

                    <div className={`min-w-0 flex-1 flex flex-col ${hasMessages && finalDescription ? 'justify-between py-0.5' : 'justify-center'}`}>
                        {finalDescription ? (
                            <p className="text-sm sm:text-[15px] font-normal leading-5 text-black">{finalDescription}</p>
                        ) : null}

                        {hasMessages && (
                            <div className={finalDescription ? 'mt-2.5' : ''}>
                                {isInfo ? (
                                    <div className="space-y-1 text-sm sm:text-[15px] font-normal leading-relaxed text-black">
                                        {finalMessages.map((item, index) => (
                                            <p key={`${item}-${index}`}>{item}</p>
                                        ))}
                                    </div>
                                ) : (
                                    finalMessages.length === 1 ? (
                                        <p className="text-sm sm:text-[15px] font-normal leading-5 text-[#A20025]">
                                            {finalMessages[0]}
                                        </p>
                                    ) : (
                                        <ul className="list-disc pl-5 space-y-1 marker:text-black">
                                            {finalMessages.map((item, index) => (
                                                <li key={`${item}-${index}`} className="text-sm sm:text-[15px] font-normal leading-6 text-[#A20025]">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )
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
    type = 'error',
    title,
    description,
    message,
    messages,
    confirmLabel,
    cancelLabel,
    copyLabel,
    copiedLabel,
    maxWidthClassName,
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
            type={type}
            title={title}
            description={description}
            message={message}
            messages={messages}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
            maxWidthClassName={maxWidthClassName}
            onClose={() => cleanup(false)}
            onConfirm={() => cleanup(true)}
            onCancel={() => cleanup(false)}
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
                type={options.type || 'error'}
                title={options.title}
                description={options.description}
                message={options.message}
                messages={options.messages}
                confirmLabel={options.confirmLabel}
                cancelLabel={options.cancelLabel}
                copyLabel={options.copyLabel}
                copiedLabel={options.copiedLabel}
                maxWidthClassName={options.maxWidthClassName || 'max-w-[720px]'}
                resolve={resolve}
                onDestroy={onDestroy}
            />
        );
    });
}

export function showSystemInfoModal(options = {}) {
    return showSystemErrorModal({
        ...options,
        type: 'info',
        title: options.title || 'Informasi',
        description: options.description ?? '',
    });
}

