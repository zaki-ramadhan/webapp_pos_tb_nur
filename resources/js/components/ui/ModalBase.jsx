import { useEffect, useRef } from 'react';

const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

export default function ModalBase({
    open = false,
    children,
    className = '',
    panelClassName = '',
    onBackdropClick = null,
}) {
    const panelRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        previousFocusRef.current = document.activeElement;

        const frame = requestAnimationFrame(() => {
            const panel = panelRef.current;
            if (!panel) return;
            const first = panel.querySelectorAll(FOCUSABLE)[0];
            first?.focus();
        });

        return () => {
            cancelAnimationFrame(frame);
            previousFocusRef.current?.focus();
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event) {
            if (event.key !== 'Tab') return;
            const panel = panelRef.current;
            if (!panel) return;
            const focusable = Array.from(panel.querySelectorAll(FOCUSABLE));
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    if (!open) return null;

    return (
        <div
            onClick={onBackdropClick ?? undefined}
            className={`fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 px-3 py-3 sm:items-center sm:px-4 sm:py-6 ${className}`.trim()}
        >
            <div
                ref={panelRef}
                onClick={(event) => event.stopPropagation()}
                className={`w-full max-w-lg max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[16px] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] sm:max-h-[calc(100vh-3rem)] sm:rounded-[12px] ${panelClassName}`.trim()}
            >
                {children}
            </div>
        </div>
    );
}

