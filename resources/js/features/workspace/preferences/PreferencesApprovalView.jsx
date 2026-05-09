import PreferencesChecklistView from '@/features/workspace/preferences/PreferencesChecklistView';

export default function PreferencesApprovalView({
    tabs,
    activeTabId,
    onSelectTab,
}) {
    return (
        <PreferencesChecklistView
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={onSelectTab}
            contentClassName="max-w-[760px]"
        />
    );
}
