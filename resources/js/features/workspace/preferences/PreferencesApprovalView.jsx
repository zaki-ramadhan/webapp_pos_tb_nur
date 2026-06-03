import PreferencesChecklistView from '@/features/workspace/preferences/PreferencesChecklistView';

export default function PreferencesApprovalView({
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
            contentClassName="max-w-[760px]"
        />
    );
}
