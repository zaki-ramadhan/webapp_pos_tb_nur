import { useEffect, useRef, useState } from 'react';

import Panel from '@/components/ui/Panel';
import NavigationTile from '@/features/workspace/navigation/NavigationTile';

function resolveMaxColumns(itemCount) {
    if (itemCount <= 3) {
        return itemCount;
    }

    if (itemCount <= 7) {
        return 3;
    }

    if (itemCount <= 11) {
        return 5;
    }

    return 6;
}

function resolveColumnCount(itemCount) {
    if (itemCount <= 1) {
        return 1;
    }

    const maxColumns = Math.min(resolveMaxColumns(itemCount), itemCount);
    const minColumns = itemCount <= 4 ? itemCount : 3;
    let bestColumns = minColumns;
    let bestEmptySlots = Number.POSITIVE_INFINITY;
    let bestRows = Number.POSITIVE_INFINITY;

    for (let columns = maxColumns; columns >= minColumns; columns -= 1) {
        const rows = Math.ceil(itemCount / columns);
        const emptySlots = rows * columns - itemCount;

        if (
            emptySlots < bestEmptySlots ||
            (emptySlots === bestEmptySlots && rows < bestRows) ||
            (emptySlots === bestEmptySlots && rows === bestRows && columns > bestColumns)
        ) {
            bestColumns = columns;
            bestEmptySlots = emptySlots;
            bestRows = rows;
        }
    }

    return bestColumns;
}

function resolveTileWidth(columnCount, dense) {
    if (columnCount >= 6) {
        return dense ? 96 : 110;
    }

    if (columnCount === 5) {
        return dense ? 102 : 116;
    }

    if (columnCount === 4) {
        return dense ? 108 : 122;
    }

    return dense ? 116 : 130;
}

function resolveFlyoutWidth(columnCount, tileWidth, dense) {
    const gap = columnCount > 1 ? (columnCount - 1) * (dense ? 8 : 10) : 0;
    const panelHorizontalPadding = dense ? 26 : 32;
    const panelBorderWidth = 2;

    return columnCount * tileWidth + gap + panelHorizontalPadding + panelBorderWidth;
}

export default function SidebarFlyout({
    open,
    onClose,
    title,
    items,
    anchorRef,
    activeAnchorElement,
    onSelectItem,
}) {
    const panelRef = useRef(null);
    const [topOffset, setTopOffset] = useState(0);
    const [panelMaxHeight, setPanelMaxHeight] = useState(null);
    const [useInternalScroll, setUseInternalScroll] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(() =>
        typeof window === 'undefined' ? 1280 : window.innerWidth,
    );
    const itemCount = items.length;
    const isDense = itemCount >= 10;
    const columnCount =
        viewportWidth < 480
            ? 1
            : viewportWidth < 768
              ? Math.min(2, itemCount || 1)
              : viewportWidth < 1024
                ? Math.min(isDense ? 4 : 3, resolveColumnCount(itemCount))
                : viewportWidth < 1280
                  ? Math.min(isDense ? 5 : 4, resolveColumnCount(itemCount))
                  : resolveColumnCount(itemCount);
    const tileWidth = resolveTileWidth(columnCount, isDense);
    const flyoutWidth = resolveFlyoutWidth(columnCount, tileWidth, isDense);

    useEffect(() => {
        function handleResize() {
            setViewportWidth(window.innerWidth);
        }

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function handlePointerDown(event) {
            const target = event.target;

            if (panelRef.current?.contains(target) || anchorRef?.current?.contains(target)) {
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
    }, [anchorRef, onClose, open]);

    useEffect(() => {
        if (!open) {
            setTopOffset(0);
            setPanelMaxHeight(null);
            setUseInternalScroll(false);
            return undefined;
        }

        function updatePosition() {
            const viewportPadding = 12;
            const fallbackPanelHeight = isDense ? 560 : 420;

            if (!activeAnchorElement || !anchorRef?.current) {
                setTopOffset(0);
                setPanelMaxHeight(null);
                setUseInternalScroll(false);
                return;
            }

            const railRect = anchorRef.current.getBoundingClientRect();
            const activeRect = activeAnchorElement.getBoundingClientRect();
            const minTopInViewport = Math.max(viewportPadding, railRect.top);
            const maxAvailableHeight = Math.max(280, window.innerHeight - minTopInViewport - viewportPadding);
            const naturalPanelHeight = panelRef.current?.scrollHeight ?? fallbackPanelHeight;
            const shouldConstrainHeight = naturalPanelHeight > maxAvailableHeight;
            const desiredPanelHeight = shouldConstrainHeight ? maxAvailableHeight : naturalPanelHeight;
            const preferredTopInViewport = activeRect.top;
            const maxTopInViewport = window.innerHeight - viewportPadding - desiredPanelHeight;
            const panelTopInViewport =
                maxTopInViewport >= minTopInViewport
                    ? Math.min(Math.max(preferredTopInViewport, minTopInViewport), maxTopInViewport)
                    : minTopInViewport;
            const nextTopOffset = panelTopInViewport - railRect.top;
            const nextMaxHeight = shouldConstrainHeight
                ? Math.max(280, window.innerHeight - panelTopInViewport - viewportPadding)
                : null;

            setTopOffset(nextTopOffset);
            setPanelMaxHeight(nextMaxHeight);
            setUseInternalScroll(shouldConstrainHeight);
        }

        updatePosition();
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
        };
    }, [activeAnchorElement, anchorRef, isDense, open]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="z-40 mt-3 w-full lg:absolute lg:left-full lg:mt-0 lg:w-[min(var(--flyout-width),calc(100vw-112px))]"
            style={{
                top: topOffset,
                '--flyout-width': `${flyoutWidth}px`,
            }}
        >
            <Panel
                ref={panelRef}
                className={`flex flex-col overflow-hidden rounded-[10px] border border-[#d7ddea] bg-white/98 shadow-[0_18px_38px_rgba(15,23,42,0.18)] ${
                    isDense ? 'px-2 py-2.5 sm:px-2.5 md:py-3' : 'px-2.5 py-3 sm:px-3 md:py-3.5'
                }`.trim()}
                style={panelMaxHeight ? { maxHeight: `${panelMaxHeight}px` } : undefined}
            >
                <div className={`shrink-0 ${isDense ? 'pb-1.5' : 'pb-2'}`.trim()}>
                    <h3 className={`font-medium text-[#555b76] ${isDense ? 'text-[15px] sm:text-[16px] md:text-[17px]' : 'text-[16px] sm:text-[17px] md:text-[19px]'}`.trim()}>{title}</h3>
                    <div className={`h-[3px] w-full bg-[#ED3969] ${isDense ? 'mt-1.5' : 'mt-2'}`.trim()} />
                </div>

                <div className={`min-h-0 flex-1 pr-1 ${useInternalScroll ? 'overflow-y-auto' : 'overflow-visible'} ${isDense ? 'mt-2' : 'mt-2.5'}`.trim()}>
                    <div
                        className={`grid ${isDense ? 'gap-1.5' : 'gap-2'}`.trim()}
                        style={{
                            gridTemplateColumns:
                                viewportWidth < 768
                                    ? `repeat(${columnCount}, minmax(0, 1fr))`
                                    : `repeat(${columnCount}, minmax(min(100%, ${tileWidth}px), 1fr))`,
                        }}
                    >
                        {items.map((item) => (
                            <NavigationTile key={item.id} item={item} onSelect={onSelectItem} dense={isDense} />
                        ))}
                    </div>
                </div>
            </Panel>
        </div>
    );
}
