import PreferencesContentPanel from '@/features/workspace/preferences/PreferencesContentPanel';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';

export default function PreferencesTabPanel({
    tabs,
    activeTabId,
    onSelectTab,
    panelClassName = '',
    children,
}) {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PreferencesTabs
                tabs={tabs}
                activeTabId={activeTabId}
                onSelectTab={onSelectTab}
            />

            <PreferencesContentPanel className={panelClassName}>
                {children}
            </PreferencesContentPanel>
        </div>
    );
}
