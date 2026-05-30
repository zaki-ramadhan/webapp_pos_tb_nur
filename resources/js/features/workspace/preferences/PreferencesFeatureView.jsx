import PreferencesChecklistView from '@/features/workspace/preferences/PreferencesChecklistView';

export default function PreferencesFeatureView({
    tabs,
    activeTabId,
    onSelectTab,
    onUpdate,
}) {
    return (
        <PreferencesChecklistView
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={onSelectTab}
            onUpdate={onUpdate}
        />
    );
}
