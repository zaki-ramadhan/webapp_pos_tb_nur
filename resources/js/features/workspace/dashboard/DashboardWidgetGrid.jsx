import { useCallback, useState } from 'react';

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
    const [refreshingByWidgetId, setRefreshingByWidgetId] = useState({});
    const [refreshErrorByWidgetId, setRefreshErrorByWidgetId] = useState({});

    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [draggableWidgetId, setDraggableWidgetId] = useState(null);

    const handleToggleAnalyticsDetails = useCallback(() => {
        setAnalyticsDetailsExpanded((currentValue) => !currentValue);
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

    const renderWidgetCard = useCallback(
        (widget, index) => {
            const isWide = widget.id === 'integrated-analysis' || widget.type === 'integrated-analysis';
            const isDragged = draggedIndex === index;
            const isDragOver = dragOverIndex === index && draggedIndex !== index;

            const spanClass = isWide ? 'min-w-0 md:col-span-2 xl:col-span-2' : 'min-w-0 flex-1';
            const dragClass = isDragged
                ? 'opacity-40 scale-[0.98] transition-all duration-200'
                : isDragOver
                ? 'ring-2 ring-brand-blue ring-offset-1 scale-[1.01] transition-all duration-200'
                : 'transition-all duration-200';

            return (
                <div
                    key={widget.id}
                    className={`${spanClass} ${dragClass} flex flex-col`.trim()}
                    draggable={draggableWidgetId === widget.id}
                    onDragStart={(e) => {
                        setDraggedIndex(index);
                        e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                        setDraggableWidgetId(null);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverIndex !== index) {
                            setDragOverIndex(index);
                        }
                    }}
                    onDrop={() => {
                        if (draggedIndex !== null && draggedIndex !== index) {
                            onReorderWidgets?.(draggedIndex, index);
                        }
                    }}
                >
                    <DashboardWidgetCard
                        widget={widget}
                        onRefresh={handleRefreshWidget}
                        isRefreshing={Boolean(refreshingByWidgetId[widget.id])}
                        refreshError={refreshErrorByWidgetId[widget.id] ?? null}
                        dragHandleProps={{
                            onMouseEnter: () => setDraggableWidgetId(widget.id),
                            onMouseLeave: () => setDraggableWidgetId(null),
                        }}
                    >
                        <DashboardWidgetBody
                            widget={widget}
                            analyticsDetailsExpanded={analyticsDetailsExpanded}
                            onToggleAnalyticsDetails={handleToggleAnalyticsDetails}
                            isLoading={isLoading}
                        />
                    </DashboardWidgetCard>
                </div>
            );
        },
        [
            analyticsDetailsExpanded,
            dragOverIndex,
            draggedIndex,
            draggableWidgetId,
            handleRefreshWidget,
            handleToggleAnalyticsDetails,
            isLoading,
            onReorderWidgets,
            refreshErrorByWidgetId,
            refreshingByWidgetId,
        ],
    );

    const renderGridItems = useCallback(() => {
        const items = [];
        let i = 0;

        while (i < widgets.length) {
            const widget = widgets[i];

            if (widget.id === 'integrated-analysis' || widget.type === 'integrated-analysis') {
                const reg1Index = i + 1;
                const reg2Index = i + 2;

                if (
                    reg2Index < widgets.length &&
                    !(widgets[reg1Index].id === 'integrated-analysis' || widgets[reg1Index].type === 'integrated-analysis') &&
                    !(widgets[reg2Index].id === 'integrated-analysis' || widgets[reg2Index].type === 'integrated-analysis')
                ) {
                    const reg1Widget = widgets[reg1Index];
                    const reg2Widget = widgets[reg2Index];

                    items.push(
                        <div key={`stacked-group-${widget.id}`} className="contents">
                            {renderWidgetCard(widget, i)}
                            <div className="md:contents xl:flex xl:flex-col xl:gap-2 xl:h-full xl:justify-between min-w-0 flex-1">
                                {renderWidgetCard(reg1Widget, reg1Index)}
                                {renderWidgetCard(reg2Widget, reg2Index)}
                            </div>
                        </div>
                    );

                    i += 3;
                    continue;
                }
            }

            items.push(renderWidgetCard(widget, i));
            i += 1;
        }

        return items;
    }, [renderWidgetCard, widgets]);

    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:gap-2.5 xl:grid-cols-3">
            {renderGridItems()}
        </div>
    );
}
