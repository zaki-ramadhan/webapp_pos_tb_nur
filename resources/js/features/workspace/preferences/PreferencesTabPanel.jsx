import PreferencesContentPanel from '@/features/workspace/preferences/PreferencesContentPanel';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';

export default function PreferencesTabPanel({
    tabs,
    activeTabId,
    onSelectTab,
    panelClassName = '',
    activeTabClassName = '',
    children,
}) {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PreferencesTabs
                tabs={tabs}
                activeTabId={activeTabId}
                onSelectTab={onSelectTab}
                activeTabClassName={activeTabClassName}
            />

            <PreferencesContentPanel className={panelClassName}>
                {children}
            </PreferencesContentPanel>
        </div>
    );
}
