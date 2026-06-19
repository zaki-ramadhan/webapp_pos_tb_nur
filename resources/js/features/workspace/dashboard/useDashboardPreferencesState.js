import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';

import {
    clonePlainData,
    createWidgetFromLibraryItem,
    loadDashboardPreferences,
    saveDashboardPreferences,
} from '@/features/workspace/dashboard/dashboardPersistence';

export default function useDashboardPreferencesState({ dashboard, widgets, widgetTemplateMap }) {
    const [isWidgetLibraryLoading, setIsWidgetLibraryLoading] = useState(false);
    const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false);
    const [dashboardPreferences, setDashboardPreferences] = useState(() =>
        loadDashboardPreferences({
            dashboards: dashboard.toolbar.dashboards,
            selectedDashboardId: dashboard.toolbar.selectedDashboardId,
            widgets: dashboard.widgets ?? [],
        }),
    );
    const [isDashboardActionsOpen, setIsDashboardActionsOpen] = useState(false);
    const [activeDashboardModal, setActiveDashboardModal] = useState(null);

    useEffect(() => {
        if (widgets && widgets.length > 0) {
            setDashboardPreferences((currentValue) => {
                const nextWidgetsByDashboard = { ...currentValue.widgetsByDashboard };
                Object.keys(nextWidgetsByDashboard).forEach((dashboardId) => {
                    nextWidgetsByDashboard[dashboardId] = nextWidgetsByDashboard[dashboardId].map((widget) => {
                        const computed = widgets.find(
                            (w) => w.type === widget.type || w.id === widget.id || w.id === widget.sourceWidgetId
                        );
                        if (computed) {
                            return {
                                ...widget,
                                ...computed,
                                id: widget.id,
                                title: widget.title,
                                gridClass: widget.gridClass,
                                heightClass: widget.heightClass,
                                sourceWidgetId: widget.sourceWidgetId || widget.id,
                            };
                        }
                        return widget;
                    });
                });
                return {
                    ...currentValue,
                    widgetsByDashboard: nextWidgetsByDashboard,
                };
            });
        }
    }, [widgets]);

    useEffect(() => {
        if (!isWidgetLibraryLoading) {
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            setIsWidgetLibraryLoading(false);
            setIsWidgetLibraryOpen(true);
        }, dashboard.toolbar.loadingOverlay.durationMs ?? 900);

        return () => clearTimeout(timeoutId);
    }, [dashboard.toolbar.loadingOverlay.durationMs, isWidgetLibraryLoading]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            saveDashboardPreferences(dashboardPreferences);
        }, 120);

        return () => clearTimeout(timeoutId);
    }, [dashboardPreferences]);

    const dashboardItems = dashboardPreferences.dashboards;
    const selectedDashboardId = dashboardPreferences.selectedDashboardId;
    const activeDashboardWidgets =
        dashboardPreferences.widgetsByDashboard[selectedDashboardId] ?? dashboard.widgets ?? [];
    const selectedDashboard = useMemo(
        () => dashboardItems.find((item) => item.id === selectedDashboardId) ?? dashboardItems[0] ?? null,
        [dashboardItems, selectedDashboardId],
    );

    const filteredLibraryItems = useMemo(() => {
        const activeIds = new Set(
            activeDashboardWidgets.map((w) => w.sourceWidgetId || w.id || w.type)
        );
        return (dashboard.toolbar.widgetLibraryModal.items ?? []).filter(
            (item) => !activeIds.has(item.id)
        );
    }, [activeDashboardWidgets, dashboard.toolbar.widgetLibraryModal.items]);

    function handleOpenWidgetLibrary() {
        setIsWidgetLibraryOpen(true);
    }

    function handleOpenDashboardModal(mode) {
        setIsDashboardActionsOpen(false);
        setActiveDashboardModal(mode);
    }

    function handleSelectDashboardAction(actionId) {
        if (actionId === 'add') {
            handleOpenDashboardModal('add');
            return;
        }

        if (actionId === 'edit') {
            handleOpenDashboardModal('edit');
        }
    }

    function handleCreateDashboard(label) {
        const nextId = `dashboard-${Date.now()}`;
        const nextDashboard = {
            id: nextId,
            label,
        };
        setDashboardPreferences((currentValue) => ({
            dashboards: [...currentValue.dashboards, nextDashboard],
            selectedDashboardId: nextId,
            widgetsByDashboard: {
                ...currentValue.widgetsByDashboard,
                [nextId]: clonePlainData(
                    currentValue.widgetsByDashboard[currentValue.selectedDashboardId] ?? dashboard.widgets ?? [],
                ),
            },
        }));
        setActiveDashboardModal(null);
    }

    function handleUpdateDashboard(label) {
        setDashboardPreferences((currentValue) => ({
            ...currentValue,
            dashboards: currentValue.dashboards.map((item) =>
                item.id === selectedDashboardId
                    ? {
                          ...item,
                          label,
                      }
                    : item,
            ),
        }));
        setActiveDashboardModal(null);
    }

    function handleDeleteDashboard() {
        if (dashboardItems.length <= 1) {
            return;
        }

        setDashboardPreferences((currentValue) => {
            const remainingDashboards = currentValue.dashboards.filter((item) => item.id !== currentValue.selectedDashboardId);
            const nextWidgetsByDashboard = { ...currentValue.widgetsByDashboard };

            delete nextWidgetsByDashboard[currentValue.selectedDashboardId];

            return {
                dashboards: remainingDashboards,
                selectedDashboardId: remainingDashboards[0]?.id ?? '',
                widgetsByDashboard: nextWidgetsByDashboard,
            };
        });
        setActiveDashboardModal(null);
    }

    function handleSelectDashboard(nextDashboardId) {
        setDashboardPreferences((currentValue) => ({
            ...currentValue,
            selectedDashboardId: nextDashboardId,
        }));
    }

    function handleRenameWidget(widgetId, nextTitle) {
        if (!widgetId) {
            return;
        }

        setDashboardPreferences((currentValue) => ({
            ...currentValue,
            widgetsByDashboard: {
                ...currentValue.widgetsByDashboard,
                [currentValue.selectedDashboardId]: (currentValue.widgetsByDashboard[currentValue.selectedDashboardId] ?? []).map((widget) =>
                    widget.id === widgetId
                        ? {
                              ...widget,
                              title: nextTitle,
                          }
                        : widget,
                ),
            },
        }));
    }

    function handleAddWidget(widgetLibraryItem) {
        if (!widgetLibraryItem?.id) {
            return;
        }

        setDashboardPreferences((currentValue) => {
            const newWidget = createWidgetFromLibraryItem(widgetLibraryItem, widgetTemplateMap);
            const computed = widgets?.find(
                (w) => w.type === newWidget.type || w.id === newWidget.id || w.id === newWidget.sourceWidgetId
            );
            const syncedWidget = computed
                ? {
                      ...newWidget,
                      ...computed,
                      id: newWidget.id,
                      title: newWidget.title,
                      gridClass: newWidget.gridClass,
                      heightClass: newWidget.heightClass,
                      sourceWidgetId: newWidget.sourceWidgetId || newWidget.id,
                  }
                : newWidget;

            return {
                ...currentValue,
                widgetsByDashboard: {
                    ...currentValue.widgetsByDashboard,
                    [currentValue.selectedDashboardId]: [
                        ...(currentValue.widgetsByDashboard[currentValue.selectedDashboardId] ?? []),
                        syncedWidget,
                    ],
                },
            };
        });
        setIsWidgetLibraryOpen(false);
        setIsWidgetLibraryLoading(false);
    }

    function handleRemoveWidget(widgetOrId) {
        const id = widgetOrId && typeof widgetOrId === 'object' ? widgetOrId.id : widgetOrId;
        if (!id) {
            return;
        }

        setDashboardPreferences((currentValue) => ({
            ...currentValue,
            widgetsByDashboard: {
                ...currentValue.widgetsByDashboard,
                [currentValue.selectedDashboardId]: (currentValue.widgetsByDashboard[currentValue.selectedDashboardId] ?? []).filter(
                    (widget) => widget.id !== id
                ),
            },
        }));
    }

    async function handleRefreshWidget(widget) {
        if (!widget?.id) {
            return;
        }

        await new Promise((resolve, reject) => {
            router.reload({
                only: ['widgets'],
                data: { force_refresh: 1 },
                showProgress: false,
                onSuccess: (page) => {
                    resolve(page);
                },
                onError: (error) => {
                    reject(error);
                },
                onFinish: () => {
                    resolve();
                },
            });
        });
    }

    return {
        isWidgetLibraryLoading,
        isWidgetLibraryOpen,
        setIsWidgetLibraryOpen,
        isDashboardActionsOpen,
        setIsDashboardActionsOpen,
        activeDashboardModal,
        setActiveDashboardModal,
        dashboardItems,
        selectedDashboardId,
        activeDashboardWidgets,
        selectedDashboard,
        handleOpenWidgetLibrary,
        handleSelectDashboardAction,
        handleCreateDashboard,
        handleUpdateDashboard,
        handleDeleteDashboard,
        handleSelectDashboard,
        handleRenameWidget,
        handleAddWidget,
        handleRemoveWidget,
        handleRefreshWidget,
        filteredLibraryItems,
    };
}
