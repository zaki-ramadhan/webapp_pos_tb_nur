import RadioField from '@/components/ui/RadioField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';
import { InfoIcon } from '@/features/workspace/shared/Icons';

function OthersRowLabel({ label }) {
    return <div className="pt-2 text-[16px] leading-8 text-[#111827]">{label}</div>;
}

function OthersRowNote({ note }) {
    if (!note) {
        return null;
    }

    return (
        <div className="flex items-start gap-3 pt-1">
            <span className="mt-1 block h-8 w-[6px] rounded-[2px] bg-[#9a9a9a]" aria-hidden="true" />
            <p className="text-[16px] italic leading-8 text-[#ff4b2b]">{note}</p>
        </div>
    );
}

function normalizeOptions(options = []) {
    return options.map((option) =>
        typeof option === 'string'
            ? {
                  value: option,
                  label: option,
              }
            : option,
    );
}

function OthersSelectControl({ control, onChange }) {
    return (
        <SelectField
            id={control.id}
            value={control.value ?? ''}
            disabled={control.disabled}
            error={control.error}
            message={control.message}
            containerClassName={control.containerClassName ?? 'w-full max-w-[320px]'}
            className={`h-[44px] rounded-[6px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
            selectClassName={`text-[15px] text-[#111827] ${control.selectClassName ?? ''}`.trim()}
            onChange={(event) => onChange(event.target.value)}
        >
            {normalizeOptions(control.options).map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </SelectField>
    );
}

function OthersTextControl({ control, onChange }) {
    return (
        <TextInput
            id={control.id}
            value={control.value ?? ''}
            type={control.inputType ?? 'text'}
            placeholder={control.placeholder}
            disabled={control.disabled}
            error={control.error}
            message={control.message}
            containerClassName={control.containerClassName ?? 'w-full max-w-[160px]'}
            className={`h-[44px] rounded-[6px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
            inputClassName={`text-[15px] text-[#111827] ${control.inputClassName ?? ''}`.trim()}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

function OthersControl({ control, onChange }) {
    if (control.type === 'text') {
        return <OthersTextControl control={control} onChange={onChange} />;
    }

    if (control.type === 'static') {
        return <span className="text-[17px] leading-8 text-[#111827]">{control.label}</span>;
    }

    return <OthersSelectControl control={control} onChange={onChange} />;
}

function OthersFieldRow({ row, onChangeControl }) {
    return (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
            <OthersRowLabel label={row.label} />

            <div className="space-y-2">
                <div className={`flex flex-wrap items-center gap-3 ${row.controlsClassName ?? ''}`.trim()}>
                    {(row.controls ?? []).map((control) => (
                        <OthersControl
                            key={control.id}
                            control={control}
                            onChange={(value) => onChangeControl(row.id, control.id, value)}
                        />
                    ))}
                </div>

                <OthersRowNote note={row.note} />
            </div>
        </div>
    );
}

function OthersRadioRow({ row, onChange }) {
    return (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
            <OthersRowLabel label={row.label} />

            <div className="space-y-2">
                <div className="space-y-3 pt-1">
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
                                <span className="text-[17px] leading-8">
                                    {option.label}
                                    {option.showInfo ? (
                                        <InfoIcon className="ml-2 inline h-[18px] w-[18px] align-text-bottom text-[#111827]" />
                                    ) : null}
                                </span>
                            }
                            className="gap-3"
                            onChange={() => onChange(row.id, option.value)}
                        />
                    ))}
                </div>

                <OthersRowNote note={row.note} />
            </div>
        </div>
    );
}

function OthersSection({ section, onChangeControl, onChangeRadio }) {
    return (
        <section className="space-y-5">
            <PreferencesSectionHeading icon={section.icon} title={section.title} />

            <div className="space-y-5">
                {(section.rows ?? []).map((row) =>
                    row.type === 'radio' ? (
                        <OthersRadioRow key={row.id} row={row} onChange={onChangeRadio} />
                    ) : (
                        <OthersFieldRow key={row.id} row={row} onChangeControl={onChangeControl} />
                    ),
                )}
            </div>
        </section>
    );
}

function EmailIntro({ intro }) {
    if (!intro) {
        return null;
    }

    return (
        <div className="space-y-2">
            <h2 className="text-[28px] leading-tight text-[#111827]">{intro.title}</h2>
            <p className="text-[18px] leading-9 text-[#111827]">{intro.description}</p>
        </div>
    );
}

function EmailTabContent({ tab, onChangeRadio }) {
    return (
        <div className={`space-y-6 ${tab.contentClassName ?? ''}`.trim()}>
            <EmailIntro intro={tab.intro} />

            <div className="max-w-[640px] space-y-4 pt-2">
                {(tab.rows ?? []).map((row) => (
                    <div key={row.id} className="space-y-3">
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
                                    <span className="text-[17px] leading-8">
                                        {option.label}
                                        {option.showInfo ? (
                                            <InfoIcon className="ml-2 inline h-[18px] w-[18px] align-text-bottom text-[#111827]" />
                                        ) : null}
                                    </span>
                                }
                                className="gap-3"
                                onChange={() => onChangeRadio(row.id, option.value)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function PreferencesOthersView({ tabs, activeTabId, onSelectTab }) {
    const { activeTab, updateActiveTab } = usePreferencesTabsState(tabs, activeTabId);

    function handleChangeControl(rowId, controlId, value) {
        updateActiveTab((tab) => ({
            ...tab,
            sections: (tab.sections ?? []).map((section) => ({
                ...section,
                rows: (section.rows ?? []).map((row) =>
                    row.id === rowId
                        ? {
                              ...row,
                              controls: (row.controls ?? []).map((control) =>
                                  control.id === controlId ? { ...control, value } : control,
                              ),
                          }
                        : row,
                ),
            })),
        }));
    }

    function handleChangeRadio(rowId, value) {
        updateActiveTab((tab) => ({
            ...tab,
            rows: (tab.rows ?? []).map((row) => (row.id === rowId ? { ...row, value } : row)),
            sections: (tab.sections ?? []).map((section) => ({
                ...section,
                rows: (section.rows ?? []).map((row) =>
                    row.id === rowId ? { ...row, value } : row,
                ),
            })),
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
        >
            {activeTab.variant === 'email-config' ? (
                <EmailTabContent tab={activeTab} onChangeRadio={handleChangeRadio} />
            ) : (
                <div className={`max-w-[980px] space-y-6 ${activeTab.contentClassName ?? ''}`.trim()}>
                    {(activeTab.sections ?? []).map((section) => (
                        <OthersSection
                            key={section.id}
                            section={section}
                            onChangeControl={handleChangeControl}
                            onChangeRadio={handleChangeRadio}
                        />
                    ))}
                </div>
            )}
        </PreferencesTabPanel>
    );
}
