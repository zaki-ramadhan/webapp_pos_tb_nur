const DASHBOARD_PREFERENCES_STORAGE_KEY = 'pos-workspace-dashboard-preferences:v6';

const WIDGET_LIBRARY_TEMPLATE_IDS = {
    'recent-activity': 'recent-activity',
    'cash-flow': 'cash-flow',
    'company-expense': 'company-expense',
    'minimum-stock': 'top-products',
    'current-assets': 'profit-loss',
};

function canUseBrowserStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function clonePlainData(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizeDashboardItems(items = []) {
    return (items ?? [])
        .filter((item) => item?.id && item?.label)
        .map((item) => ({
            id: String(item.id),
            label: String(item.label),
        }));
}

function buildDefaultWidgetsByDashboard(dashboards = [], widgets = []) {
    const defaultWidgets = clonePlainData(widgets ?? []);

    return dashboards.reduce((result, dashboard) => {
        result[dashboard.id] = clonePlainData(defaultWidgets);
        return result;
    }, {});
}

export function createDefaultDashboardPreferences({
    dashboards = [],
    selectedDashboardId = '',
    widgets = [],
}) {
    const normalizedDashboards = normalizeDashboardItems(dashboards);
    const resolvedSelectedDashboardId =
        normalizedDashboards.some((item) => item.id === selectedDashboardId)
            ? selectedDashboardId
            : normalizedDashboards[0]?.id ?? '';

    return {
        dashboards: normalizedDashboards,
        selectedDashboardId: resolvedSelectedDashboardId,
        widgetsByDashboard: buildDefaultWidgetsByDashboard(normalizedDashboards, widgets),
    };
}

export function loadDashboardPreferences(defaultPreferences) {
    const fallbackPreferences = createDefaultDashboardPreferences(defaultPreferences);

    if (!canUseBrowserStorage()) {
        return fallbackPreferences;
    }

    try {
        const rawValue = window.localStorage.getItem(DASHBOARD_PREFERENCES_STORAGE_KEY);

        if (!rawValue) {
            return fallbackPreferences;
        }

        const parsedValue = JSON.parse(rawValue);
        const dashboards = normalizeDashboardItems(parsedValue?.dashboards);
        const resolvedDashboards = dashboards.length ? dashboards : fallbackPreferences.dashboards;
        const widgetsByDashboard = resolvedDashboards.reduce((result, dashboard) => {
            const persistedWidgets = parsedValue?.widgetsByDashboard?.[dashboard.id];

            result[dashboard.id] = Array.isArray(persistedWidgets)
                ? clonePlainData(persistedWidgets)
                : fallbackPreferences.widgetsByDashboard[dashboard.id] ?? [];

            return result;
        }, {});
        const selectedDashboardId = resolvedDashboards.some((item) => item.id === parsedValue?.selectedDashboardId)
            ? parsedValue.selectedDashboardId
            : fallbackPreferences.selectedDashboardId;

        return {
            dashboards: resolvedDashboards,
            selectedDashboardId,
            widgetsByDashboard,
        };
    } catch {
        return fallbackPreferences;
    }
}

export function saveDashboardPreferences(preferences) {
    if (!canUseBrowserStorage()) {
        return;
    }

    try {
        window.localStorage.setItem(
            DASHBOARD_PREFERENCES_STORAGE_KEY,
            JSON.stringify({
                dashboards: preferences.dashboards,
                selectedDashboardId: preferences.selectedDashboardId,
                widgetsByDashboard: preferences.widgetsByDashboard,
            }),
        );
    } catch {
        // Ignore persistence failures and keep the dashboard usable.
    }
}

export function clearDashboardPreferences() {
    if (!canUseBrowserStorage()) {
        return;
    }

    try {
        window.localStorage.removeItem(DASHBOARD_PREFERENCES_STORAGE_KEY);
    } catch {
        // Ignore persistence cleanup failures.
    }
}

export function buildWidgetTemplateMap(widgets = []) {
    const templateMap = new Map();

    (widgets ?? []).forEach((widget) => {
        if (!widget?.id) {
            return;
        }

        templateMap.set(String(widget.id), clonePlainData(widget));
    });

    Object.entries(WIDGET_LIBRARY_TEMPLATE_IDS).forEach(([libraryItemId, widgetId]) => {
        const templateWidget = templateMap.get(widgetId);

        if (templateWidget) {
            templateMap.set(libraryItemId, clonePlainData(templateWidget));
        }
    });

    return templateMap;
}

function buildFallbackWidget(libraryItem) {
    return {
        id: libraryItem.id,
        title: libraryItem.title,
        type: 'blank',
        emptyState: {
            enabled: true,
            title: libraryItem.title,
            description: `${libraryItem.description} Widget ini siap dihubungkan ke data backend saat tersedia.`,
        },
        gridClass: 'md:col-span-1 lg:col-span-2 xl:col-span-4',
        heightClass: 'min-h-[318px]',
    };
}

export function createWidgetFromLibraryItem(libraryItem, templateMap) {
    const baseTemplate = templateMap.get(libraryItem.id) ?? buildFallbackWidget(libraryItem);
    const clonedTemplate = clonePlainData(baseTemplate);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return {
        ...clonedTemplate,
        id: `${libraryItem.id}-${uniqueSuffix}`,
        sourceWidgetId: clonedTemplate.id ?? libraryItem.id,
        title: libraryItem.title ?? clonedTemplate.title,
    };
}
