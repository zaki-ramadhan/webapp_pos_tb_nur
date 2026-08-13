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
    asOfDate = null,
    dashboard = null,
}) {
    const [analyticsDetailsExpanded, setAnalyticsDetailsExpanded] = useState(false);
    const [chartExpanded, setChartExpanded] = useState(() => {
        return typeof window !== 'undefined' && window.innerWidth >= 1024;
    });
    const [refreshingByWidgetId, setRefreshingByWidgetId] = useState({});
    const [refreshErrorByWidgetId, setRefreshErrorByWidgetId] = useState({});

    const [displayWidgets, setDisplayWidgets] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [draggableWidgetId, setDraggableWidgetId] = useState(null);

    useEffect(() => {
        if (Array.isArray(widgets) && widgets.length > 0) {
            let currentList = widgets;

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
                        currentList = ordered;
                    }
                }
            } catch (e) {
                // Ignore parsing errors
            }

            setDisplayWidgets(currentList);

            // Restore saved dates per widget across page refreshes
            try {
                const savedDatesJson = localStorage.getItem('pos_tb_nur_widget_dates');
                if (savedDatesJson) {
                    const datesMap = JSON.parse(savedDatesJson);
                    if (datesMap && typeof datesMap === 'object') {
                        Object.entries(datesMap).forEach(([wId, savedDate]) => {
                            if (savedDate) {
                                fetch(`/api/workspace/dashboard/widget-data?widget_id=${wId}&as_of_date=${savedDate}`, {
                                    headers: {
                                        'Accept': 'application/json',
                                        'X-Requested-With': 'XMLHttpRequest',
                                    },
                                })
                                    .then((res) => (res.ok ? res.json() : null))
                                    .then((data) => {
                                        if (data?.widget && data?.widgetId) {
                                            window.dispatchEvent(new CustomEvent('pos:update-single-widget', { detail: data }));
                                        }
                                    })
                                    .catch(() => {});
                            }
                        });
                    }
                }
            } catch (e) {}
        }
    }, [widgets]);

    useEffect(() => {
        const handleWidgetsUpdate = (event) => {
            const updatedWidgets = event.detail?.widgets;
            if (Array.isArray(updatedWidgets) && updatedWidgets.length > 0) {
                try {
                    const savedOrderJson = localStorage.getItem('pos_tb_nur_widget_order');
                    if (savedOrderJson) {
                        const savedOrder = JSON.parse(savedOrderJson);
                        if (Array.isArray(savedOrder) && savedOrder.length > 0) {
                            const map = new Map(updatedWidgets.map((w) => [w.id, w]));
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
                    // Ignore parsing errors and fallback
                }
                setDisplayWidgets(updatedWidgets);
            }
        };

        window.addEventListener('pos:update-dashboard-widgets', handleWidgetsUpdate);
        return () => window.removeEventListener('pos:update-dashboard-widgets', handleWidgetsUpdate);
    }, []);

    useEffect(() => {
        const handleSingleWidgetUpdate = (event) => {
            const { widgetId, widget: updatedWidget } = event.detail || {};
            if (widgetId && updatedWidget) {
                setDisplayWidgets((prevWidgets) =>
                    prevWidgets.map((w) => (w.id === widgetId ? updatedWidget : w))
                );
            }
        };

        window.addEventListener('pos:update-single-widget', handleSingleWidgetUpdate);
        return () => window.removeEventListener('pos:update-single-widget', handleSingleWidgetUpdate);
    }, []);

    const handleToggleAnalyticsDetails = useCallback(() => {
        setAnalyticsDetailsExpanded((currentValue) => !currentValue);
    }, []);

    const handleToggleChart = useCallback(() => {
        setChartExpanded((currentValue) => !currentValue);
    }, []);

    const handleRefreshWidget = useCallback(
        async (widget) => {
            const widgetId = widget.id;
            setRefreshingByWidgetId((prev) => ({ ...prev, [widgetId]: true }));
            setRefreshErrorByWidgetId((prev) => ({ ...prev, [widgetId]: null }));

            try {
                if (onRefreshWidget) {
                    await onRefreshWidget(widget);
                } else {
                    await wait(500);
                }
            } catch (err) {
                setRefreshErrorByWidgetId((prev) => ({
                    ...prev,
                    [widgetId]: 'Gagal memuat ulang data. Silahkan coba lagi.',
                }));
            } finally {
                setRefreshingByWidgetId((prev) => ({ ...prev, [widgetId]: false }));
            }
        },
        [onRefreshWidget],
    );

    const handleReorder = useCallback(
        (fromIndex, toIndex) => {
            setDisplayWidgets((prevWidgets) => {
                const next = [...prevWidgets];
                const [moved] = next.splice(fromIndex, 1);
                next.splice(toIndex, 0, moved);

                try {
                    const newOrderIds = next.map((w) => w.id);
                    localStorage.setItem('pos_tb_nur_widget_order', JSON.stringify(newOrderIds));
                } catch (e) {
                    // Ignore storage quota errors
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
                        if (draggedIndex !== null && draggedIndex !== index) {
                            setDragOverIndex(index);
                        }
                    }}
                    onDragLeave={() => {
                        if (dragOverIndex === index) {
                            setDragOverIndex(null);
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
                        refreshError={refreshErrorByWidgetId[widget.id]}
                        showRefresh={true}
                        dragHandleProps={{
                            onMouseDown: () => setDraggableWidgetId(widget.id),
                            onMouseUp: () => setDraggableWidgetId(null),
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
            displayWidgets,
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
            widgets,
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

                if (openCount === 2) {
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
                                <div className="md:contents xl:flex xl:flex-col xl:gap-2.5 xl:h-full xl:justify-between min-w-0 flex-1">
                                    {renderWidgetCard(reg1Widget, reg1Index)}
                                    {renderWidgetCard(reg2Widget, reg2Index)}
                                    {renderWidgetCard(reg3Widget, reg3Index)}
                                </div>
                            </div>,
                        );

                        i += 4;
                        continue;
                    }
                } else {
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
                                <div className="md:contents xl:flex xl:flex-col xl:gap-2.5 xl:h-full xl:justify-between min-w-0 flex-1">
                                    {renderWidgetCard(reg1Widget, reg1Index)}
                                    {renderWidgetCard(reg2Widget, reg2Index)}
                                </div>
                            </div>,
                        );

                        i += 3;
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
