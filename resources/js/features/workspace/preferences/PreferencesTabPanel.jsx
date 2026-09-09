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
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2.5 sm:p-3.5">
            <div className="relative z-10 shrink-0">
                <PreferencesTabs
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onSelectTab={onSelectTab}
                    activeTabClassName={activeTabClassName}
                    className="pl-0"
                />
            </div>

            <PreferencesContentPanel className={panelClassName}>
                {children}
            </PreferencesContentPanel>
        </div>
    );
}
