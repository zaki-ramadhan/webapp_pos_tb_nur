import { useEffect, useRef, useState } from 'react';

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
    isOpen = false,
    children,
    className = '',
    panelClassName = '',
    onBackdropClick = null,
}) {
    const panelRef = useRef(null);
    const previousFocusRef = useRef(null);
    const isModalOpen = Boolean(open || isOpen);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const currentPosRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const dragDataRef = useRef(null);

    // Reset posisi kembali ke tengah (default) setiap kali modal ditutup
    useEffect(() => {
        if (!isModalOpen) {
            setPosition({ x: 0, y: 0 });
            currentPosRef.current = { x: 0, y: 0 };
            if (panelRef.current) {
                panelRef.current.style.transform = '';
            }
        }
    }, [isModalOpen]);

    // Drag-and-drop modal header listener
    useEffect(() => {
        if (!isModalOpen) return;

        const panel = panelRef.current;
        if (!panel) return;

        function handlePointerDown(event) {
            if (event.button !== 0 && event.pointerType === 'mouse') return;

            const target = event.target;
            if (!(target instanceof HTMLElement || target instanceof SVGElement)) return;

            const header = target.closest('[data-modal-header="true"], [data-modal-header], header, .modal-header')
                || (panel.firstElementChild && panel.firstElementChild.contains(target) && panel.firstElementChild.querySelector('h1, h2, h3, [role="heading"]') ? panel.firstElementChild : null);

            if (!header || !panel.contains(header)) return;

            // Jangan memicu drag jika menekan tombol aksi, link, input, atau elemen interaktif
            if (target.closest('button, a, input, select, textarea, [role="button"], [data-no-drag]')) {
                return;
            }

            event.preventDefault();

            const startX = event.clientX;
            const startY = event.clientY;
            const originX = currentPosRef.current.x;
            const originY = currentPosRef.current.y;

            const panelRect = panel.getBoundingClientRect();
            const baseLeft = panelRect.left - originX;
            const baseTop = panelRect.top - originY;
            const width = panelRect.width;
            const height = panelRect.height;

            isDraggingRef.current = true;
            dragDataRef.current = {
                startX,
                startY,
                originX,
                originY,
                baseLeft,
                baseTop,
                width,
                height,
            };

            const prevCursor = document.body.style.cursor;
            const prevUserSelect = document.body.style.userSelect;
            document.body.style.cursor = 'move';
            document.body.style.userSelect = 'none';

            function onPointerMove(moveEvent) {
                if (!isDraggingRef.current || !dragDataRef.current) return;

                const dx = moveEvent.clientX - dragDataRef.current.startX;
                const dy = moveEvent.clientY - dragDataRef.current.startY;

                const nextX = dragDataRef.current.originX + dx;
                const nextY = dragDataRef.current.originY + dy;

                const minTop = 8;
                const maxTop = Math.max(minTop, window.innerHeight - 40);
                const minY = minTop - dragDataRef.current.baseTop;
                const maxY = maxTop - dragDataRef.current.baseTop;

                const minLeft = Math.min(0, 80 - dragDataRef.current.width);
                const maxLeft = Math.max(0, window.innerWidth - 80);
                const minX = minLeft - dragDataRef.current.baseLeft;
                const maxX = maxLeft - dragDataRef.current.baseLeft;

                const clampedX = Math.max(minX, Math.min(maxX, nextX));
                const clampedY = Math.max(minY, Math.min(maxY, nextY));

                currentPosRef.current = { x: clampedX, y: clampedY };
                panel.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;
            }

            function onPointerUp() {
                if (!isDraggingRef.current) return;
                isDraggingRef.current = false;
                dragDataRef.current = null;

                document.body.style.cursor = prevCursor;
                document.body.style.userSelect = prevUserSelect;

                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
                window.removeEventListener('pointercancel', onPointerUp);

                setPosition(currentPosRef.current);
            }

            window.addEventListener('pointermove', onPointerMove, { passive: true });
            window.addEventListener('pointerup', onPointerUp);
            window.addEventListener('pointercancel', onPointerUp);
        }

        panel.addEventListener('pointerdown', handlePointerDown);

        return () => {
            panel.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [isModalOpen]);

    useEffect(() => {
        if (!isModalOpen) return;

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
    }, [isModalOpen]);

    useEffect(() => {
        if (!isModalOpen) return;

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
    }, [isModalOpen]);

    if (!isModalOpen) return null;

    const hasBg = className.split(' ').some((c) => c.startsWith('bg-'));
    const backdropBg = hasBg ? '' : 'bg-modal-overlay-bg';

    const hasMaxWidth = panelClassName.split(' ').some((c) => c.startsWith('max-w-') || c.includes('max-w-['));
    const resolvedMaxWidth = hasMaxWidth ? '' : 'max-w-lg';

    return (
        <div
            onClick={onBackdropClick ?? undefined}
            className={`fixed inset-0 z-[999] flex items-end justify-center overflow-y-auto ${backdropBg} px-3 py-3 sm:items-center sm:px-4 sm:py-6 backdrop-blur-[2px] ${className}`.trim()}
        >
            <div
                ref={panelRef}
                onClick={(event) => event.stopPropagation()}
                style={{
                    transform: (position.x !== 0 || position.y !== 0)
                        ? `translate3d(${position.x}px, ${position.y}px, 0)`
                        : undefined,
                }}
                className={`w-full ${resolvedMaxWidth} max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[4px] bg-white shadow-panel-primary sm:max-h-[calc(100vh-3rem)] sm:rounded-[4px] [&_[data-modal-header]]:cursor-move [&_[data-modal-header]]:select-none [&_[data-modal-header]]:touch-none ${panelClassName}`.trim()}
            >
                {children}
            </div>
        </div>
    );
}

