import { useCallback, useState } from 'react';

import DashboardFormModal from '@/features/workspace/dashboard/DashboardFormModal';
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
    onRenameWidget = null,
    onRemoveWidget = null,
    onReorderWidgets = null,
    isLoading = false,
}) {
    const [analyticsDetailsExpanded, setAnalyticsDetailsExpanded] = useState(false);
    const [refreshingByWidgetId, setRefreshingByWidgetId] = useState({});
    const [refreshErrorByWidgetId, setRefreshErrorByWidgetId] = useState({});
    const [renamingWidgetId, setRenamingWidgetId] = useState(null);

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

    const handleRenameWidget = useCallback((widget) => {
        setRenamingWidgetId(widget?.id ?? null);
    }, []);

    const handleSubmitWidgetRename = useCallback((nextTitle) => {
        onRenameWidget?.(renamingWidgetId, nextTitle);
        setRenamingWidgetId(null);
    }, [onRenameWidget, renamingWidgetId]);

    const renamingWidget = widgets.find((widget) => widget.id === renamingWidgetId) ?? null;

    return (
        <>
            <div className="grid min-w-0 grid-cols-1 gap-1.5 sm:gap-2 md:grid-cols-2 xl:grid-cols-3">
                {widgets.map((widget, index) => {
                    const isWide = widget.id === 'integrated-analysis' || 
                                   widget.type === 'integrated-analysis';
                    const isDragged = draggedIndex === index;
                    const isDragOver = dragOverIndex === index && draggedIndex !== index;

                    const spanClass = isWide ? "min-w-0 md:col-span-2" : "min-w-0";
                    const dragClass = isDragged
                        ? 'opacity-40 scale-[0.98] transition-all duration-200'
                        : isDragOver
                        ? 'ring-2 ring-brand-blue ring-offset-1 scale-[1.01] transition-all duration-200'
                        : 'transition-all duration-200';

                    return (
                        <div
                            key={widget.id}
                            className={`${spanClass} ${dragClass}`.trim()}
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
                                onRename={handleRenameWidget}
                                onRemove={onRemoveWidget}
                                isRefreshing={Boolean(refreshingByWidgetId[widget.id])}
                                refreshError={refreshErrorByWidgetId[widget.id] ?? null}
                                canRemove={widgets.length > 1}
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
                })}
            </div>

            <DashboardFormModal
                open={Boolean(renamingWidget)}
                mode="add"
                modal={{
                    title: 'Ubah Judul Widget',
                    closeLabel: 'Tutup modal ubah judul widget',
                    nameLabel: 'Judul widget',
                    clearLabel: 'Kosongkan judul widget',
                    deleteLabel: '',
                    submitLabel: 'Simpan',
                }}
                initialValue={renamingWidget?.title ?? ''}
                onClose={() => setRenamingWidgetId(null)}
                onSubmit={handleSubmitWidgetRename}
            />
        </>
    );
}
