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
}) {
    const [analyticsDetailsExpanded, setAnalyticsDetailsExpanded] = useState(false);
    const [refreshingByWidgetId, setRefreshingByWidgetId] = useState({});
    const [refreshErrorByWidgetId, setRefreshErrorByWidgetId] = useState({});
    const [renamingWidgetId, setRenamingWidgetId] = useState(null);

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
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
                {widgets.map((widget) => (
                    <div key={widget.id} className="min-w-0">
                        <DashboardWidgetCard
                            widget={widget}
                            onRefresh={handleRefreshWidget}
                            onRename={handleRenameWidget}
                            isRefreshing={Boolean(refreshingByWidgetId[widget.id])}
                            refreshError={refreshErrorByWidgetId[widget.id] ?? null}
                        >
                            <DashboardWidgetBody
                                widget={widget}
                                analyticsDetailsExpanded={analyticsDetailsExpanded}
                                onToggleAnalyticsDetails={handleToggleAnalyticsDetails}
                            />
                        </DashboardWidgetCard>
                    </div>
                ))}
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
