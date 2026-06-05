import { useEffect } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import RadioField from '@/components/ui/RadioField';
import Tooltip from '@/components/ui/Tooltip';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';
import { InfoIcon } from '@/features/workspace/shared/Icons';


function getSalesInfo(id, label) {
    const map = {
        'sales-order-auto-close': 'Menutup pesanan penjualan secara otomatis ketika semua barang telah dikirimkan ke pelanggan.',
    };
    return map[id] || `Informasi tentang ${label}`;
}

function SalesInlineCheckboxRow({ row, onToggle }) {
    return (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
            <div className="text-[16px] leading-8 text-[#0f172a]">
                <span>{row.label}</span>
                {row.showInfo ? (
                    <Tooltip content={getSalesInfo(row.id, row.label)} portal>
                        <InfoIcon className="ml-2 inline h-[18px] w-[18px] align-text-bottom text-[#111827] cursor-help" />
                    </Tooltip>
                ) : null}
            </div>


            <div className="max-w-[180px]">
                <CheckboxField
                    id={`${row.id}-${row.option?.id ?? 'option'}`}
                    checked={Boolean(row.option?.checked)}
                    disabled={Boolean(row.option?.disabled)}
                    size="sm"
                    align="center"
                    label={<span className="text-[17px]">{row.option?.label}</span>}
                    className="gap-3"
                    inputClassName="rounded-[5px] border-[#b6c1d1]"
                    onChange={(event) => onToggle(row.id, event.target.checked)}
                />
            </div>
        </div>
    );
}

function SalesRadioGroupRow({ row, onChange }) {
    return (
        <div className="space-y-3">
            <div className="text-[16px] font-semibold leading-8 text-[#111827]">
                <span className="whitespace-pre-line">{row.label}</span>
            </div>

            <div className="space-y-3 pl-0 sm:pl-10">
                {(row.options ?? []).map((option) => (
                    <RadioField
                        key={option.value}
                        id={`${row.id}-${option.value}`}
                        name={row.name ?? row.id}
                        checked={row.value === option.value}
                        disabled={option.disabled}
                        size="md"
                        align="center"
                        label={
                            <span className="whitespace-pre-line text-[17px] leading-8">
                                {option.label}
                            </span>
                        }
                        className="gap-3"
                        onChange={() => onChange(row.id, option.value)}
                    />
                ))}
            </div>
        </div>
    );
}

function SalesCheckboxRow({ row, onToggle }) {
    return (
        <div className="pl-0 sm:pl-0">
            <CheckboxField
                id={`${row.id}-${row.option?.id ?? 'option'}`}
                checked={Boolean(row.option?.checked)}
                disabled={Boolean(row.option?.disabled)}
                size="sm"
                align="center"
                label={
                    <span className="whitespace-pre-line text-[17px] leading-8">
                        {row.option?.label}
                    </span>
                }
                className="gap-3"
                inputClassName="rounded-[5px] border-[#b6c1d1]"
                onChange={(event) => onToggle(row.id, event.target.checked)}
            />
        </div>
    );
}

function SalesSection({ section, onChangeRadio, onToggleSingle }) {
    return (
        <section className="space-y-5">
            <PreferencesSectionHeading icon={section.icon} title={section.title} />

            <div className="space-y-4">
                {(section.rows ?? []).map((row) => {
                    if (row.type === 'inline-checkbox') {
                        return (
                            <SalesInlineCheckboxRow
                                key={row.id}
                                row={row}
                                onToggle={onToggleSingle}
                            />
                        );
                    }

                    if (row.type === 'radio-group') {
                        return (
                            <SalesRadioGroupRow
                                key={row.id}
                                row={row}
                                onChange={onChangeRadio}
                            />
                        );
                    }

                    return (
                        <SalesCheckboxRow
                            key={row.id}
                            row={row}
                            onToggle={onToggleSingle}
                        />
                    );
                })}
            </div>
        </section>
    );
}

export default function PreferencesSalesView({
    tabs,
    activeTabId,
    onSelectTab,
    onUpdate,
}) {
    const { tabState, activeTab, updateActiveTab } = usePreferencesTabsState(tabs, activeTabId);

    useEffect(() => {
        if (onUpdate && tabState !== tabs) {
            onUpdate(tabState);
        }
    }, [onUpdate, tabState, tabs]);

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

    function handleToggleSingle(rowId, checked) {
        updateActiveTabSections((sections) =>
            sections.map((section) => ({
                ...section,
                rows: (section.rows ?? []).map((row) =>
                    row.id === rowId && row.option
                        ? {
                              ...row,
                              option: {
                                  ...row.option,
                                  checked,
                              },
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
            panelClassName={`max-w-[760px] space-y-6 ${activeTab.contentClassName ?? ''}`.trim()}
        >
            {(activeTab.sections ?? []).map((section) => (
                <SalesSection
                    key={section.id}
                    section={section}
                    onChangeRadio={handleChangeRadio}
                    onToggleSingle={handleToggleSingle}
                />
            ))}
        </PreferencesTabPanel>
    );
}
