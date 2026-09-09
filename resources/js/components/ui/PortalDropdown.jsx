import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Panel from './Panel';

export default function PortalDropdown({
    open,
    onClose,
    anchorRef: externalAnchorRef,
    children,
    align = 'stretch',
    side = 'bottom',
    maxHeightLimit = 260,
    minHeightNeeded = 120,
    className = '',
    panelClassName = '',
    style = {},
    stopMouseDownPropagation = true,
}) {
    const markerRef = useRef(null);
    const panelRef = useRef(null);
    const [coords, setCoords] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    useLayoutEffect(() => {
        if (!open) return;
        if (externalAnchorRef?.current) {
            setAnchorEl(externalAnchorRef.current);
        } else if (markerRef.current) {
            setAnchorEl(markerRef.current.parentElement);
        }
    }, [open, externalAnchorRef]);

    useLayoutEffect(() => {
        if (!open || !anchorEl) return;

        function updatePosition() {
            if (!anchorEl || !anchorEl.isConnected) return;
            const rect = anchorEl.getBoundingClientRect();
            const panelEl = panelRef.current;
            const panelWidth = panelEl ? panelEl.offsetWidth : 0;
            const panelHeight = panelEl ? panelEl.offsetHeight : 0;

            setCoords((prev) => {
                const nextTop = rect.bottom;
                const nextLeft = rect.left;
                const nextRight = rect.right;
                const nextWidth = rect.width;
                const nextSpaceBelow = window.innerHeight - rect.bottom;
                const nextRectTop = rect.top;
                const nextPanelWidth = panelWidth || prev?.panelWidth || 0;
                const nextPanelHeight = panelHeight || prev?.panelHeight || 0;

                if (
                    prev &&
                    prev.top === nextTop &&
                    prev.left === nextLeft &&
                    prev.right === nextRight &&
                    prev.width === nextWidth &&
                    prev.spaceBelow === nextSpaceBelow &&
                    prev.rectTop === nextRectTop &&
                    prev.panelWidth === nextPanelWidth &&
                    prev.panelHeight === nextPanelHeight
                ) {
                    return prev;
                }

                return {
                    top: nextTop,
                    left: nextLeft,
                    right: nextRight,
                    width: nextWidth,
                    spaceBelow: nextSpaceBelow,
                    rectTop: nextRectTop,
                    panelWidth: nextPanelWidth,
                    panelHeight: nextPanelHeight,
                };
            });
        }

        updatePosition();

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        let resizeObserver = null;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                updatePosition();
            });
            resizeObserver.observe(anchorEl);
            if (anchorEl.parentElement) {
                resizeObserver.observe(anchorEl.parentElement);
            }
        }

        let mutationObserver = null;
        if (typeof MutationObserver !== 'undefined') {
            mutationObserver = new MutationObserver(() => {
                updatePosition();
            });
            mutationObserver.observe(anchorEl, {
                childList: true,
                subtree: true,
                attributes: true,
            });
        }

        let rafId = null;
        const tick = () => {
            updatePosition();
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
            if (resizeObserver) resizeObserver.disconnect();
            if (mutationObserver) mutationObserver.disconnect();
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [open, anchorEl]);

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event) {
            const target = event.target;
            if (
                panelRef.current?.contains(target) ||
                (externalAnchorRef?.current && externalAnchorRef.current.contains(target)) ||
                (anchorEl && anchorEl.contains(target))
            ) {
                return;
            }
            onClose?.();
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                onClose?.();
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, anchorEl, externalAnchorRef, onClose]);

    useEffect(() => {
        if (!open || !stopMouseDownPropagation) return;

        const el = panelRef.current;
        if (!el) return;

        const handleMouseDown = (e) => {
            e.stopPropagation();
        };

        el.addEventListener('mousedown', handleMouseDown);
        return () => {
            el.removeEventListener('mousedown', handleMouseDown);
        };
    }, [open, stopMouseDownPropagation, coords]);

    useLayoutEffect(() => {
        if (!open || !panelRef.current) return;
        const panelEl = panelRef.current;
        const w = panelEl.offsetWidth;
        const h = panelEl.offsetHeight;
        if (w > 0 && (w !== coords?.panelWidth || h !== coords?.panelHeight)) {
            setCoords((prev) => (prev ? { ...prev, panelWidth: w, panelHeight: h } : prev));
        }

        let observer = null;
        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(() => {
                const nextW = panelEl.offsetWidth;
                const nextH = panelEl.offsetHeight;
                if (nextW > 0) {
                    setCoords((prev) => {
                        if (!prev || (prev.panelWidth === nextW && prev.panelHeight === nextH)) return prev;
                        return { ...prev, panelWidth: nextW, panelHeight: nextH };
                    });
                }
            });
            observer.observe(panelEl);
        }
        return () => {
            if (observer) observer.disconnect();
        };
    }, [open]);

    if (!open) return null;

    const showDropdown = coords !== null;

    const renderAbove = coords && (
        side === 'top' ||
        (side === 'auto' && coords.spaceBelow < minHeightNeeded && coords.rectTop > coords.spaceBelow)
    );

    const dynamicMaxHeight = coords
        ? renderAbove
            ? Math.max(100, coords.rectTop - 16)
            : Math.max(100, window.innerHeight - coords.top - 16)
        : maxHeightLimit;

    const finalMaxHeight = Math.min(maxHeightLimit, dynamicMaxHeight);

    const positionStyle = {
        position: 'fixed',
        zIndex: 9999,
        maxHeight: `${finalMaxHeight}px`,
        maxWidth: 'calc(100vw - 16px)',
        boxSizing: 'border-box',
        ...style,
    };

    if (coords) {
        if (align === 'stretch') {
            const targetWidth = Math.min(coords.width, window.innerWidth - 16);
            const targetLeft = Math.max(8, Math.min(coords.left, window.innerWidth - targetWidth - 8));
            positionStyle.left = `${targetLeft}px`;
            positionStyle.width = `${targetWidth}px`;
        } else {
            const currentWidth = coords.panelWidth || panelRef.current?.offsetWidth || 0;
            const safeViewportWidth = window.innerWidth;
            const minMargin = 8;

            const spaceRight = safeViewportWidth - coords.left - minMargin;
            const spaceLeft = coords.right - minMargin;

            let resolvedAlign = align;
            if (align === 'auto') {
                if (spaceRight >= currentWidth) {
                    resolvedAlign = 'start';
                } else if (spaceLeft >= currentWidth) {
                    resolvedAlign = 'end';
                } else {
                    resolvedAlign = spaceRight >= spaceLeft ? 'start' : 'end';
                }
            } else if (align === 'start') {
                if (currentWidth > 0 && spaceRight < currentWidth && spaceLeft > spaceRight) {
                    resolvedAlign = 'end';
                }
            } else if (align === 'end') {
                if (currentWidth > 0 && spaceLeft < currentWidth && spaceRight > spaceLeft) {
                    resolvedAlign = 'start';
                }
            }

            let targetLeft;
            if (resolvedAlign === 'end') {
                targetLeft = currentWidth > 0 ? (coords.right - currentWidth) : coords.left;
            } else {
                targetLeft = coords.left;
            }

            if (currentWidth > 0) {
                const maxLeft = Math.max(minMargin, safeViewportWidth - currentWidth - minMargin);
                targetLeft = Math.max(minMargin, Math.min(targetLeft, maxLeft));
            } else {
                targetLeft = Math.max(minMargin, Math.min(targetLeft, safeViewportWidth - minMargin));
            }

            positionStyle.left = `${targetLeft}px`;
        }

        if (renderAbove) {
            positionStyle.bottom = `${window.innerHeight - coords.rectTop + 4}px`;
        } else {
            positionStyle.top = `${coords.top + 4}px`;
        }
    }

    const hasBorder = className.split(' ').some((c) => c.startsWith('border-') || c === 'border' || c === '!border-none');
    const borderClass = hasBorder ? '' : 'border border-slate-400';
    const hasShadow = className.split(' ').some((c) => c.startsWith('shadow-') || c === 'shadow' || c === '!shadow-none');
    const shadowClass = hasShadow ? '' : 'shadow-[0_4px_12px_rgba(15,23,42,0.15),0_1px_3px_rgba(15,23,42,0.08)]';
    const hasRounded = className.split(' ').some((c) => c.startsWith('rounded-'));
    const roundedClass = hasRounded ? '' : 'rounded-[6px]';

    return (
        <>
            {!externalAnchorRef && <div ref={markerRef} className="hidden" />}
            {showDropdown && createPortal(
                <Panel
                    ref={panelRef}
                    style={positionStyle}
                    data-portal-dropdown="true"
                    className={`flex flex-col min-h-0 overflow-hidden ${roundedClass} ${borderClass} bg-white ${shadowClass} ${className}`.trim()}
                >
                    <div className={`flex flex-col overflow-y-auto w-full min-h-0 ${panelClassName}`.trim()}>
                        {children}
                    </div>
                </Panel>,
                document.body
            )}
        </>
    );
}
