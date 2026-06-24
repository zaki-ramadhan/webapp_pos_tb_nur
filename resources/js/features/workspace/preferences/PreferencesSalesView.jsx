import { useEffect } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import RadioField from '@/components/ui/RadioField';
import Tooltip from '@/components/ui/Tooltip';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';
import { InfoIcon } from '@/features/workspace/shared/Icons';
import PreferenceLookupAutocomplete from './components/PreferenceLookupAutocomplete';

const RETURN_ACCOUNT_OPTIONS = [
    '[511.000-01] Beban Retur Penjualan',
    '[511.000-02] Beban Kerusakan Barang Retur',
    '[511.000-03] Beban Selisih Retur',
];


function getSalesInfo(id, label) {
    const map = {
        'sales-order-auto-close': 'Menutup pesanan penjualan secara otomatis ketika semua barang telah dikirimkan ke pelanggan.',
    };
    return map[id] || `Informasi tentang ${label}`;
}

function SalesInlineCheckboxRow({ row, onToggle }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
            <div className="text-xs sm:text-sm leading-6 text-text-contrast">
                <span>{row.label}</span>
                {row.showInfo ? (
                    <Tooltip content={getSalesInfo(row.id, row.label)} portal>
                        <InfoIcon className="ml-2 inline h-[18px] w-[18px] align-text-bottom text-text-darkest cursor-help" />
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
                    label={<span className="text-xs sm:text-sm">{row.option?.label}</span>}
                    className="gap-3"
                    labelClassName="text-xs sm:text-sm leading-6"
                    inputClassName="rounded-[5px] border-tab-active-border-x"
                    onChange={(event) => onToggle(row.id, event.target.checked)}
                />
            </div>
        </div>
    );
}

function SalesRadioGroupRow({ row, onChange }) {
    return (
        <div className="space-y-2">
            <div className="text-xs sm:text-sm font-semibold leading-6 text-text-darkest">
                <span className="whitespace-pre-line">{row.label}</span>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2 pl-0 sm:pl-10 pt-0.5">
                {(row.options ?? []).map((option) => (
                    <RadioField
                        key={option.value}
                        id={`${row.id}-${option.value}`}
                        name={row.name ?? row.id}
                        checked={row.value === option.value}
                        disabled={option.disabled}
                        size="sm"
                        containerClassName="w-auto"
                        align="center"
                        label={
                            <span className="whitespace-pre-line text-xs sm:text-sm leading-6">
                                {option.label}
                            </span>
                        }
                        className="gap-3"
                        labelClassName="text-xs sm:text-sm leading-6"
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
                    <span className="whitespace-pre-line text-xs sm:text-sm leading-6">
                        {row.option?.label}
                    </span>
                }
                className="gap-3"
                labelClassName="text-xs sm:text-sm leading-6"
                inputClassName="rounded-[5px] border-tab-active-border-x"
                onChange={(event) => onToggle(row.id, event.target.checked)}
            />
        </div>
    );
}

function SalesGridFieldRow({ row, onChangeControl }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
            <div className="text-xs sm:text-sm leading-6 text-text-darkest">
                <span>{row.label}</span>
            </div>

            <div className={`${row.widthClassName ?? 'max-w-[420px]'}`.trim()}>
                <PreferenceLookupAutocomplete
                    field={{
                        id: row.control?.id ?? row.id,
                        label: row.label,
                        disabled: row.control?.disabled,
                        placeholder: row.control?.placeholder
                    }}
                    value={row.control?.value}
                    onChange={(fieldId, option) => onChangeControl(row.id, option)}
                    options={RETURN_ACCOUNT_OPTIONS}
                />
            </div>
        </div>
    );
}

function SalesSection({ section, onChangeRadio, onToggleSingle, onChangeControl }) {
    return (
        <section className="space-y-3.5">
            <PreferencesSectionHeading icon={section.icon} title={section.title} />

            <div className="space-y-2.5">
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

                    if (row.type === 'field') {
                        if (row.id === 'sales-return-custom-account-row') {
                            const noItemOptionRow = section.rows?.find(r => r.id === 'sales-return-no-item-option');
                            if (noItemOptionRow?.value !== 'custom-account') {
                                return null;
                            }
                        }
                        return (
                            <SalesGridFieldRow
                                key={row.id}
                                row={row}
                                onChangeControl={onChangeControl}
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

    function handleChangeControl(rowId, value) {
        updateActiveTabSections((sections) =>
            sections.map((section) => ({
                ...section,
                rows: (section.rows ?? []).map((row) =>
                    row.id === rowId && row.control
                        ? {
                              ...row,
                              control: {
                                  ...row.control,
                                  value,
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
            panelClassName={`max-w-[760px] space-y-4 ${activeTab.contentClassName ?? ''}`.trim()}
        >
            {(activeTab.sections ?? []).map((section) => (
                <SalesSection
                    key={section.id}
                    section={section}
                    onChangeRadio={handleChangeRadio}
                    onToggleSingle={handleToggleSingle}
                    onChangeControl={handleChangeControl}
                />
            ))}
        </PreferencesTabPanel>
    );
}
