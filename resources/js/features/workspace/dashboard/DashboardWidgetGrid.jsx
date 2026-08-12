import { useCallback, useEffect, useState } from 'react';

import DashboardWidgetBody from '@/features/workspace/dashboard/widgets/DashboardWidgetBody';
import DashboardWidgetCard from '@/features/workspace/dashboard/widgets/DashboardWidgetCard';

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default function DashboardWidgetGrid({
    widgets = [],
    onRefreshWidget = null,
    onReorderWidgets = null,
    isLoading = false,
}) {
    const [analyticsDetailsExpanded, setAnalyticsDetailsExpanded] = useState(false);
    const [chartExpanded, setChartExpanded] = useState(false);
    const [refreshingByWidgetId, setRefreshingByWidgetId] = useState({});
    const [refreshErrorByWidgetId, setRefreshErrorByWidgetId] = useState({});

    const [displayWidgets, setDisplayWidgets] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [draggableWidgetId, setDraggableWidgetId] = useState(null);

    useEffect(() => {
        if (Array.isArray(widgets) && widgets.length > 0) {
            try {
                const savedOrderJson = localStorage.getItem('pos_tb_nur_widget_order');
                if (savedOrderJson) {
                    const savedOrder = JSON.parse(savedOrderJson);
                    if (Array.isArray(savedOrder) && savedOrder.length > 0) {
                        const map = new Map(widgets.map((w) => [w.id, w]));
                        const ordered = [];
                        for (const id of savedOrder) {
                            if (map.has(id)) {
                                ordered.push(map.get(id));
                                map.delete(id);
                            }
                        }
                        for (const remaining of map.values()) {
                            ordered.push(remaining);
                        }
                        setDisplayWidgets(ordered);
                        return;
                    }
                }
            } catch (e) {
                // Ignore parsing errors and fallback to props
            }
            setDisplayWidgets(widgets);
        }
    }, [widgets]);

    const handleToggleAnalyticsDetails = useCallback(() => {
        setAnalyticsDetailsExpanded((currentValue) => !currentValue);
    }, []);

    const handleToggleChart = useCallback(() => {
        setChartExpanded((currentValue) => !currentValue);
    }, []);

    const handleRefreshWidget = useCallback(
        async (widget) => {
            if (!widget?.id || refreshingByWidgetId[widget.id]) {
                return;
            }

            setRefreshErrorByWidgetId((currentValue) => ({
                ...currentValue,
                [widget.id]: null,
            }));
            setRefreshingByWidgetId((currentValue) => ({
                ...currentValue,
                [widget.id]: true,
            }));

            try {
                const refreshHandler = typeof widget.onRefresh === 'function' ? widget.onRefresh : onRefreshWidget;

                if (typeof refreshHandler === 'function') {
                    await refreshHandler(widget);
                } else {
                    await wait(500);
                }
            } catch (error) {
                setRefreshErrorByWidgetId((currentValue) => ({
                    ...currentValue,
                    [widget.id]: error?.message ?? 'Widget belum berhasil diperbarui. Coba lagi.',
                }));
            } finally {
                setRefreshingByWidgetId((currentValue) => ({
                    ...currentValue,
                    [widget.id]: false,
                }));
            }
        },
        [onRefreshWidget, refreshingByWidgetId],
    );

    const handleReorder = useCallback(
        (fromIndex, toIndex) => {
            setDisplayWidgets((current) => {
                if (fromIndex < 0 || fromIndex >= current.length || toIndex < 0 || toIndex >= current.length) {
                    return current;
                }
                const next = [...current];
                const [movedItem] = next.splice(fromIndex, 1);
                next.splice(toIndex, 0, movedItem);

                try {
                    const orderIds = next.map((w) => w.id);
                    localStorage.setItem('pos_tb_nur_widget_order', JSON.stringify(orderIds));
                } catch (e) {
                    // Ignore quota errors
                }

                return next;
            });

            onReorderWidgets?.(fromIndex, toIndex);
        },
        [onReorderWidgets],
    );

    const renderWidgetCard = useCallback(
        (widget, index) => {
            const isWide = widget.id === 'integrated-analysis' || widget.type === 'integrated-analysis';
            const isDragged = draggedIndex === index;
            const isDragOver = dragOverIndex === index && draggedIndex !== index;
            const isDraggable = draggableWidgetId === widget.id || isDragged;

            const spanClass = isWide ? 'min-w-0 md:col-span-2 xl:col-span-2' : 'min-w-0 flex-1';
            const dragClass = isDragged
                ? 'opacity-40 scale-[0.98] transition-all duration-200 cursor-grabbing'
                : isDragOver
                ? 'ring-2 ring-brand-blue ring-offset-1 scale-[1.01] transition-all duration-200'
                : 'transition-all duration-200';

            return (
                <div
                    key={widget.id}
                    className={`${spanClass} ${dragClass} flex flex-col`.trim()}
                    draggable={isDraggable}
                    onDragStart={(e) => {
                        setDraggedIndex(index);
                        e.dataTransfer.effectAllowed = 'move';
                        try {
                            e.dataTransfer.setData('text/plain', String(index));
                        } catch (err) {
                            // Safari fallback
                        }
                    }}
                    onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                        setDraggableWidgetId(null);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverIndex !== index) {
                            setDragOverIndex(index);
                        }
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== index) {
                            handleReorder(draggedIndex, index);
                        }
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                        setDraggableWidgetId(null);
                    }}
                >
                    <DashboardWidgetCard
                        widget={widget}
                        onRefresh={handleRefreshWidget}
                        isRefreshing={Boolean(refreshingByWidgetId[widget.id])}
                        refreshError={refreshErrorByWidgetId[widget.id] ?? null}
                        dragHandleProps={{
                            onMouseDown: () => setDraggableWidgetId(widget.id),
                            onTouchStart: () => setDraggableWidgetId(widget.id),
                            onMouseEnter: () => setDraggableWidgetId(widget.id),
                            onMouseLeave: () => {
                                if (draggedIndex === null) {
                                    setDraggableWidgetId(null);
                                }
                            },
                        }}
                    >
                        <DashboardWidgetBody
                            widget={widget}
                            analyticsDetailsExpanded={analyticsDetailsExpanded}
                            onToggleAnalyticsDetails={handleToggleAnalyticsDetails}
                            chartExpanded={chartExpanded}
                            onToggleChart={handleToggleChart}
                            isLoading={isLoading}
                        />
                    </DashboardWidgetCard>
                </div>
            );
        },
        [
            analyticsDetailsExpanded,
            chartExpanded,
            dragOverIndex,
            draggedIndex,
            draggableWidgetId,
            handleRefreshWidget,
            handleReorder,
            handleToggleAnalyticsDetails,
            handleToggleChart,
            isLoading,
            refreshErrorByWidgetId,
            refreshingByWidgetId,
        ],
    );

    const activeWidgets = displayWidgets.length > 0 ? displayWidgets : widgets;

    const renderGridItems = useCallback(() => {
        const items = [];
        let i = 0;

        while (i < activeWidgets.length) {
            const widget = activeWidgets[i];

            if (widget.id === 'integrated-analysis' || widget.type === 'integrated-analysis') {
                const openCount = (chartExpanded ? 1 : 0) + (analyticsDetailsExpanded ? 1 : 0);

                if (openCount === 1) {
                    const reg1Index = i + 1;
                    const reg2Index = i + 2;

                    if (
                        reg2Index < activeWidgets.length &&
                        !(activeWidgets[reg1Index].id === 'integrated-analysis' || activeWidgets[reg1Index].type === 'integrated-analysis') &&
                        !(activeWidgets[reg2Index].id === 'integrated-analysis' || activeWidgets[reg2Index].type === 'integrated-analysis')
                    ) {
                        const reg1Widget = activeWidgets[reg1Index];
                        const reg2Widget = activeWidgets[reg2Index];

                        items.push(
                            <div key={`stacked-group-2-${widget.id}`} className="contents">
                                {renderWidgetCard(widget, i)}
                                <div className="md:contents xl:flex xl:flex-col xl:gap-2 xl:h-full xl:justify-between min-w-0 flex-1">
                                    {renderWidgetCard(reg1Widget, reg1Index)}
                                    {renderWidgetCard(reg2Widget, reg2Index)}
                                </div>
                            </div>,
                        );

                        i += 3;
                        continue;
                    }
                } else if (openCount === 2) {
                    const reg1Index = i + 1;
                    const reg2Index = i + 2;
                    const reg3Index = i + 3;

                    if (
                        reg3Index < activeWidgets.length &&
                        !(activeWidgets[reg1Index].id === 'integrated-analysis' || activeWidgets[reg1Index].type === 'integrated-analysis') &&
                        !(activeWidgets[reg2Index].id === 'integrated-analysis' || activeWidgets[reg2Index].type === 'integrated-analysis') &&
                        !(activeWidgets[reg3Index].id === 'integrated-analysis' || activeWidgets[reg3Index].type === 'integrated-analysis')
                    ) {
                        const reg1Widget = activeWidgets[reg1Index];
                        const reg2Widget = activeWidgets[reg2Index];
                        const reg3Widget = activeWidgets[reg3Index];

                        items.push(
                            <div key={`stacked-group-3-${widget.id}`} className="contents">
                                {renderWidgetCard(widget, i)}
                                <div className="md:contents xl:flex xl:flex-col xl:gap-2 xl:h-full xl:justify-between min-w-0 flex-1">
                                    {renderWidgetCard(reg1Widget, reg1Index)}
                                    {renderWidgetCard(reg2Widget, reg2Index)}
                                    {renderWidgetCard(reg3Widget, reg3Index)}
                                </div>
                            </div>,
                        );

                        i += 4;
                        continue;
                    }
                }
            }

            items.push(renderWidgetCard(widget, i));
            i += 1;
        }

        return items;
    }, [activeWidgets, analyticsDetailsExpanded, chartExpanded, renderWidgetCard]);

    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:gap-2.5 xl:grid-cols-3">
            {renderGridItems()}
        </div>
    );
}
