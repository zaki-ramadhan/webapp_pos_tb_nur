import CheckboxField from '@/components/ui/CheckboxField';
import { AlertTriangleIcon } from '@/features/workspace/shared/Icons';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';

function ChecklistItem({ item, inputId, onToggle }) {
    const label = (
        <>
            <span className="text-[15px] leading-7 sm:text-[16px] md:text-[17px]">{item.label}</span>
            {item.note ? (
                <span className="ml-2 inline text-[14px] italic text-[#2b8de8] sm:text-[15px] md:text-[16px]">
                    ({item.note})
                </span>
            ) : null}
        </>
    );

    return (
        <CheckboxField
            id={inputId}
            checked={Boolean(item.checked)}
            disabled={Boolean(item.disabled)}
            error={item.error}
            message={item.message}
            hint={item.hint}
            size="sm"
            align="center"
            label={label}
            className="gap-3"
            inputClassName="rounded-[5px] border-[#b6c1d1] shadow-[0_2px_8px_rgba(15,23,42,0.06)] checked:border-[#86b7ee]"
            onChange={(event) => onToggle(event.target.checked)}
        />
    );
}

function ChecklistTextItem({ item }) {
    return <div className="text-[15px] leading-7 text-[#131a28] sm:text-[16px] md:text-[17px]">{item.label}</div>;
}

function ChecklistNotice({ notice }) {
    if (!notice) {
        return null;
    }

    return (
        <div
            className={`flex items-start gap-3 rounded-[10px] border border-[#ef4444] bg-[#ffd9d9] px-4 py-3 text-[14px] leading-7 text-[#bf2323] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] sm:text-[15px] md:text-[16px] ${notice.className ?? ''}`.trim()}
        >
            <AlertTriangleIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#bf1313] sm:h-7 sm:w-7" />
            <div className="min-w-0 text-[15px] leading-7 sm:text-[16px] md:text-[17px]">
                {(notice.parts ?? []).map((part, index) =>
                    part.emphasis ? (
                        <strong key={`${part.text}-${index}`} className="font-bold tracking-[0.01em]">
                            {part.text}
                        </strong>
                    ) : (
                        <span key={`${part.text}-${index}`}>{part.text}</span>
                    ),
                )}
            </div>
        </div>
    );
}

function ChecklistSection({ section, tabId, onToggleItem }) {
    return (
        <section className="space-y-5">
            <PreferencesSectionHeading icon={section.icon} title={section.title} />

            <div className="space-y-3">
                {(section.items ?? []).map((item) => (
                    <ChecklistItem
                        key={item.id}
                        item={item}
                        inputId={`preference-checklist-${tabId}-${section.id}-${item.id}`}
                        onToggle={(checked) => onToggleItem(section.id, item.id, checked)}
                    />
                ))}

                {(section.textItems ?? []).map((item) => (
                    <ChecklistTextItem key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}

function ChecklistColumn({ sections, tabId, onToggleItem }) {
    return (
        <div className="space-y-8 sm:space-y-10">
            {sections.map((section) => (
                <ChecklistSection
                    key={section.id}
                    section={section}
                    tabId={tabId}
                    onToggleItem={onToggleItem}
                />
            ))}
        </div>
    );
}

function buildColumns(sections = []) {
    const maxColumn = Math.max(...sections.map((section) => section.column ?? 1), 1);

    return Array.from({ length: maxColumn }, (_, index) =>
        sections.filter((section) => (section.column ?? 1) === index + 1),
    ).filter((columnSections) => columnSections.length);
}

export default function PreferencesChecklistView({
    tabs,
    activeTabId,
    onSelectTab,
    contentClassName = '',
}) {
    const { activeTab, updateActiveTab } = usePreferencesTabsState(tabs, activeTabId);
    const columns = activeTab ? buildColumns(activeTab.sections ?? []) : [];
    const bodyClassName = activeTab?.bodyClassName ?? activeTab?.contentClassName ?? contentClassName;
    const resolvedContentClassName = activeTab?.contentClassName ?? contentClassName;

    function handleToggleItem(sectionId, itemId, checked) {
        updateActiveTab((tab) => ({
            ...tab,
            sections: (tab.sections ?? []).map((section) => {
                if (section.id !== sectionId) {
                    return section;
                }

                return {
                    ...section,
                    items: (section.items ?? []).map((item) =>
                        item.id === itemId ? { ...item, checked } : item,
                    ),
                };
            }),
        }));
    }

    if (!activeTab) {
        return null;
    }

    return (
        <PreferencesTabPanel
            tabs={tabs}
            activeTabId={activeTab.id}
            onSelectTab={onSelectTab}
            panelClassName={`space-y-8 ${bodyClassName}`.trim()}
        >
            <ChecklistNotice notice={activeTab.notice} />

            <div
                className={`grid gap-x-8 gap-y-8 ${columns.length > 1 ? 'md:grid-cols-2' : ''} ${resolvedContentClassName}`.trim()}
            >
                {columns.map((sections, index) => (
                    <ChecklistColumn
                        key={index}
                        sections={sections}
                        tabId={activeTab.id}
                        onToggleItem={handleToggleItem}
                    />
                ))}
            </div>
        </PreferencesTabPanel>
    );
}
