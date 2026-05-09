export default function buildWorkspaceSearchItems(dashboard) {
    const pageMap = dashboard?.pages ?? {};
    const modalConfig = dashboard?.toolbar?.searchModal ?? {};
    const sidebarItems = dashboard?.sidebar?.items ?? [];
    const items = [];
    const seenIds = new Set();

    sidebarItems.forEach((group) => {
        (group.panel?.items ?? []).forEach((item) => {
            if (seenIds.has(item.id)) {
                return;
            }

            seenIds.add(item.id);
            const page = pageMap[item.id] ?? {};

            items.push({
                id: item.id,
                label: item.label,
                icon: item.icon,
                tone: item.tone,
                implemented: item.implemented,
                moduleLabel: group.label,
                description: page.placeholder?.description ?? '',
                keywords: [item.label, group.label, page.moduleLabel, page.placeholder?.description]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase(),
            });
        });
    });

    const itemMap = items.reduce((result, item) => {
        result[item.id] = item;
        return result;
    }, {});
    const topItems = (modalConfig.topItemIds ?? [])
        .map((id) => itemMap[id])
        .filter(Boolean);

    return {
        ...modalConfig,
        items,
        topItems: topItems.length ? topItems : items.slice(0, 9),
    };
}
