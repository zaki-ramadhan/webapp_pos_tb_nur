import CheckboxField from '@/components/ui/CheckboxField';
import RadioField from '@/components/ui/RadioField';
import { AlertTriangleIcon } from '@/features/workspace/shared/Icons';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';
import { isPreferenceChecklistItemInactive } from '@/features/workspace/shared/workspaceAvailability';

function ChecklistItem({ item, inputId, onToggle }) {
    const isInactive = isPreferenceChecklistItemInactive(item.id);
    if (isInactive) {
        return null;
    }

    const label = (
        <span className="text-xs sm:text-sm leading-6">{item.label}</span>
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
            labelClassName="text-xs sm:text-sm leading-6"
            inputClassName="rounded-[5px] border-tab-active-border-x shadow-checkbox checked:border-border-checkbox-checked"
            onChange={(event) => onToggle(event.target.checked)}
        />
    );
}

function ChecklistTextItem({ item }) {
    return <div className="text-xs sm:text-sm leading-6 text-text-workspace-dark">{item.label}</div>;
}

function ChecklistNotice({ notice }) {
    if (!notice) {
        return null;
    }

    return (
        <div
            className={`flex items-start gap-3 rounded-[10px] border border-text-danger-hover-alt bg-preferences-item-bg-danger px-4 py-3 text-xs sm:text-sm leading-6 text-preferences-text-danger shadow-inset-light-medium ${notice.className ?? ''}`.trim()}
        >
            <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-preferences-icon-danger" />
            <div className="min-w-0 text-xs sm:text-sm leading-6">
                {(notice.parts ?? []).map((part, index) =>
                    part.emphasis ? (
                        <strong key={`${part.text}-${index}`} className="font-semibold tracking-[0.01em]">
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

function ChecklistSection({ section, tabId, onToggleItem, onSelectRadioItem }) {
    return (
        <section className="space-y-3.5">
            <PreferencesSectionHeading icon={section.icon} title={section.title} />

            <div className="space-y-1.5">
                {(section.items ?? []).map((item) => (
                    <ChecklistItem
                        key={item.id}
                        item={item}
                        inputId={`preference-checklist-${tabId}-${section.id}-${item.id}`}
                        onToggle={(checked) => onToggleItem(section.id, item.id, checked)}
                    />
                ))}

                {(section.radioItems ?? []).length > 0 && (
                    <div className="flex flex-row flex-wrap gap-5 items-center pt-0.5">
                        {section.radioItems.map((item) => (
                            <RadioField
                                key={item.id}
                                id={`preference-checklist-${tabId}-${section.id}-${item.id}`}
                                name={`preference-checklist-${tabId}-${section.id}`}
                                checked={Boolean(item.checked)}
                                disabled={Boolean(item.disabled)}
                                label={item.label}
                                containerClassName="!w-fit"
                                className="gap-3"
                                labelClassName="text-xs sm:text-sm leading-6"
                                inputClassName="rounded-full border-tab-active-border-x shadow-checkbox checked:border-border-checkbox-checked"
                                onChange={() => onSelectRadioItem(section.id, item.id)}
                            />
                        ))}
                    </div>
                )}

                {(section.textItems ?? []).map((item) => (
                    <ChecklistTextItem key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}

function ChecklistColumn({ sections, tabId, onToggleItem, onSelectRadioItem }) {
    return (
        <div className="space-y-4 sm:space-y-7">
            {sections.map((section) => (
                <ChecklistSection
                    key={section.id}
                    section={section}
                    tabId={tabId}
                    onToggleItem={onToggleItem}
                    onSelectRadioItem={onSelectRadioItem}
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
    onUpdate,
    contentClassName = '',
}) {
    const { tabState, activeTab, updateActiveTab } = usePreferencesTabsState(tabs, activeTabId, onUpdate);

    const visibleSections = activeTab
        ? (activeTab.sections ?? [])
              .map((section) => {
                  const activeItems = (section.items ?? []).filter(
                      (item) => !isPreferenceChecklistItemInactive(item.id)
                  );
                  const activeRadioItems = (section.radioItems ?? []).filter(
                      (item) => !isPreferenceChecklistItemInactive(item.id)
                  );
                  return {
                      ...section,
                      items: activeItems,
                      radioItems: activeRadioItems,
                  };
              })
              .filter((section) => {
                  return (
                      section.items.length > 0 ||
                      section.radioItems.length > 0 ||
                      (section.textItems ?? []).length > 0
                  );
              })
        : [];

    const columns = activeTab ? buildColumns(visibleSections) : [];
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

    function handleSelectRadioItem(sectionId, itemId) {
        updateActiveTab((tab) => ({
            ...tab,
            sections: (tab.sections ?? []).map((section) => {
                if (section.id !== sectionId) {
                    return section;
                }

                return {
                    ...section,
                    radioItems: (section.radioItems ?? []).map((item) => ({
                        ...item,
                        checked: item.id === itemId,
                    })),
                };
            }),
        }));
    }

    if (!activeTab) {
        return null;
    }

    const hasCheckedItems = visibleSections.some((section) =>
        (section.items ?? []).some((item) => item.checked)
    ) ?? false;

    return (
        <PreferencesTabPanel
            tabs={tabs}
            activeTabId={activeTab.id}
            onSelectTab={onSelectTab}
            panelClassName={`space-y-6 ${bodyClassName}`.trim()}
        >
            {!hasCheckedItems && <ChecklistNotice notice={activeTab.notice} />}

            <div
                className={`grid gap-x-8 gap-y-8 ${columns.length > 1 ? 'md:grid-cols-2' : ''} ${resolvedContentClassName}`.trim()}
            >
                {columns.map((sections, index) => (
                    <ChecklistColumn
                        key={index}
                        sections={sections}
                        tabId={activeTab.id}
                        onToggleItem={handleToggleItem}
                        onSelectRadioItem={handleSelectRadioItem}
                    />
                ))}
            </div>
        </PreferencesTabPanel>
    );
}
