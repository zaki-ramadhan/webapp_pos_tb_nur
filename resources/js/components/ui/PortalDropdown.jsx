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
            const rect = anchorEl.getBoundingClientRect();
            setCoords({
                top: rect.bottom,
                left: rect.left,
                right: rect.right,
                width: rect.width,
                spaceBelow: window.innerHeight - rect.bottom,
                rectTop: rect.top,
            });
        }

        updatePosition();

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
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

    if (!open) return null;

    const showDropdown = coords !== null;

    const renderAbove = coords && (side === 'top' || (side === 'auto' && coords.spaceBelow < (maxHeightLimit + 15) && coords.rectTop > (maxHeightLimit + 15)));

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
        ...style,
    };

    if (coords) {
        if (align === 'stretch') {
            positionStyle.left = `${coords.left}px`;
            positionStyle.width = `${coords.width}px`;
        } else if (align === 'start') {
            positionStyle.left = `${coords.left}px`;
        } else if (align === 'end') {
            positionStyle.left = `${coords.right}px`;
            positionStyle.transform = 'translateX(-100%)';
        }

        if (renderAbove) {
            positionStyle.bottom = `${window.innerHeight - coords.rectTop + 4}px`;
        } else {
            positionStyle.top = `${coords.top + 4}px`;
        }
    }

    return (
        <>
            {!externalAnchorRef && <div ref={markerRef} className="hidden" />}
            {showDropdown && createPortal(
                <Panel
                    ref={panelRef}
                    style={positionStyle}
                    data-portal-dropdown="true"
                    className={`flex flex-col min-h-0 overflow-hidden rounded-[6px] border border-slate-400 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.15),0_1px_3px_rgba(15,23,42,0.08)] ${className}`.trim()}
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
