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
            const isDragged = draggedIndex === index;
            const isDragOver = dragOverIndex === index && draggedIndex !== index;
            const isDraggable = draggableWidgetId === widget.id || isDragged;

            const spanClass = 'min-w-0 flex-1';
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
                            isLoading={isLoading}
                        />
                    </DashboardWidgetCard>
                </div>
            );
        },
        [
            displayWidgets,
            dragOverIndex,
            draggedIndex,
            draggableWidgetId,
            handleRefreshWidget,
            handleReorder,
            isLoading,
            refreshErrorByWidgetId,
            refreshingByWidgetId,
            widgets,
        ],
    );

    const activeWidgets = displayWidgets.length > 0 ? displayWidgets : widgets;

    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:gap-2.5 xl:grid-cols-3">
            {activeWidgets.map((widget, i) => renderWidgetCard(widget, i))}
        </div>
    );
}
