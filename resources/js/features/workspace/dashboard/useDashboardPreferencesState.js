import { useEffect, useMemo, useState } from 'react';

import {
    clonePlainData,
    createWidgetFromLibraryItem,
    loadDashboardPreferences,
    saveDashboardPreferences,
} from '@/features/workspace/dashboard/dashboardPersistence';

export default function useDashboardPreferencesState({ dashboard, widgetTemplateMap }) {
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

    function handleOpenWidgetLibrary() {
        setIsWidgetLibraryOpen(false);
        setIsWidgetLibraryLoading(true);
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

        setDashboardPreferences((currentValue) => ({
            ...currentValue,
            widgetsByDashboard: {
                ...currentValue.widgetsByDashboard,
                [currentValue.selectedDashboardId]: [
                    ...(currentValue.widgetsByDashboard[currentValue.selectedDashboardId] ?? []),
                    createWidgetFromLibraryItem(widgetLibraryItem, widgetTemplateMap),
                ],
            },
        }));
        setIsWidgetLibraryOpen(false);
        setIsWidgetLibraryLoading(false);
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
    };
}
