import { useEffect } from 'react';

import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';
import { LimitationsSection } from '@/features/workspace/preferences/components/LimitationsComponents';

export default function PreferencesLimitationsView({
    tabs,
    activeTabId,
    onSelectTab,
    onUpdate,
}) {
    const { tabState, activeTab, updateActiveTab } = usePreferencesTabsState(tabs, activeTabId, onUpdate);

    function updateActiveTabSections(updater) {
        updateActiveTab((tab) => ({
            ...tab,
            sections: updater(tab.sections ?? []),
        }));
    }

    function handleChangeRadio(rowId, value) {
        updateActiveTabSections((sections) =>
            sections.map((section) => ({
                ...section,
                rows: (section.rows ?? []).map((row) =>
                    row.id === rowId ? { ...row, value } : row,
                ),
            })),
        );
    }

    function handleToggleCheckboxItem(rowId, itemId, checked) {
        updateActiveTabSections((sections) =>
            sections.map((section) => ({
                ...section,
                rows: (section.rows ?? []).map((row) =>
                    row.id === rowId
                        ? {
                              ...row,
                              items: (row.items ?? []).map((item) =>
                                  item.id === itemId ? { ...item, checked } : item,
                              ),
                          }
                        : row,
                ),
            })),
        );
    }

    function handleToggleTimingRule(rowId, optionValue, blockId, checked) {
        updateActiveTabSections((sections) =>
            sections.map((section) => ({
                ...section,
                rows: (section.rows ?? []).map((row) =>
                    row.id === rowId
                        ? {
                              ...row,
                              options: (row.options ?? []).map((option) =>
                                  option.value === optionValue
                                      ? {
                                            ...option,
                                            blocks: (option.blocks ?? []).map((block) =>
                                                block.id === blockId
                                                    ? {
                                                          ...block,
                                                          option: {
                                                              ...(block.option ?? {}),
                                                              checked,
                                                          },
                                                      }
                                                    : block,
                                            ),
                                        }
                                      : option,
                              ),
                          }
                        : row,
                ),
            })),
        );
    }

    function handleChangeTimingRule(rowId, optionValue, blockId, key, value) {
        updateActiveTabSections((sections) =>
            sections.map((section) => ({
                ...section,
                rows: (section.rows ?? []).map((row) =>
                    row.id === rowId
                        ? {
                              ...row,
                              options: (row.options ?? []).map((option) =>
                                  option.value === optionValue
                                      ? {
                                            ...option,
                                            blocks: (option.blocks ?? []).map((block) =>
                                                block.id === blockId
                                                    ? {
                                                          ...block,
                                                          [key]: value,
                                                      }
                                                    : block,
                                            ),
                                        }
                                      : option,
                              ),
                          }
                        : row,
                ),
            })),
        );
    }

    function handleChangeNestedRadio(rowId, optionValue, blockId, value) {
        updateActiveTabSections((sections) =>
            sections.map((section) => ({
                ...section,
                rows: (section.rows ?? []).map((row) =>
                    row.id === rowId
                        ? {
                              ...row,
                              options: (row.options ?? []).map((option) =>
                                  option.value === optionValue
                                      ? {
                                            ...option,
                                            blocks: (option.blocks ?? []).map((block) =>
                                                block.id === blockId ? { ...block, value } : block,
                                            ),
                                        }
                                      : option,
                              ),
                          }
                        : row,
                ),
            })),
        );
    }

    if (!activeTab) {
        return null;
    }

    return (
        <PreferencesTabPanel
            tabs={tabs}
            activeTabId={activeTab.id}
            onSelectTab={onSelectTab}
            panelClassName={`max-w-[1120px] space-y-4 ${activeTab.contentClassName ?? ''}`.trim()}
        >
            {(activeTab.sections ?? []).map((section) => (
                <LimitationsSection
                    key={section.id}
                    section={section}
                    onChangeRadio={handleChangeRadio}
                    onChangeAdvancedRadio={handleChangeRadio}
                    onToggleTimingRule={handleToggleTimingRule}
                    onChangeTimingRule={handleChangeTimingRule}
                    onChangeNestedRadio={handleChangeNestedRadio}
                    onToggleCheckboxItem={handleToggleCheckboxItem}
                />
            ))}
        </PreferencesTabPanel>
    );
}
