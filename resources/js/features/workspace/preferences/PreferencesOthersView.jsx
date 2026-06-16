import RadioField from '@/components/ui/RadioField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';

function OthersRowLabel({ label }) {
    return <div className="pt-1.5 text-xs sm:text-sm leading-6 text-[#111827]">{label}</div>;
}

function OthersRowNote({ note }) {
    if (!note) {
        return null;
    }

    return (
        <div className="flex items-center gap-3 pt-0.5">
            <span className="block h-6 w-[5px] rounded-[2px] bg-[#9a9a9a]" aria-hidden="true" />
            <p className="text-xs sm:text-sm italic leading-6 text-[#ff4b2b]">{note}</p>
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
            className={`h-[38px] rounded-[6px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
            selectClassName={`text-xs sm:text-sm text-[#111827] ${control.selectClassName ?? ''}`.trim()}
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
            maxLength={control.maxLength}
            containerClassName={control.containerClassName ?? 'w-full max-w-[160px]'}
            className={`h-[38px] rounded-[6px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
            inputClassName={`text-xs sm:text-sm text-[#111827] ${control.inputClassName ?? ''}`.trim()}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

function OthersControl({ control, onChange }) {
    if (control.type === 'text') {
        return <OthersTextControl control={control} onChange={onChange} />;
    }

    if (control.type === 'static') {
        return <span className="text-xs sm:text-sm leading-6 text-[#111827]">{control.label}</span>;
    }

    return <OthersSelectControl control={control} onChange={onChange} />;
}

function OthersFieldRow({ row, onChangeControl }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
            <OthersRowLabel label={row.label} />

            <div className="space-y-1.5">
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

function getOthersInfo(value, label) {
    const map = {
        'company-smtp': 'Menggunakan server SMTP milik perusahaan sendiri untuk pengiriman email transaksi.',
    };
    return map[value] || `Informasi tentang ${label}`;
}

function OthersRadioRow({ row, onChange }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
            <OthersRowLabel label={row.label} />

            <div className="space-y-1.5">
                <div className="space-y-2 pt-0.5">
                    {(row.options ?? []).map((option) => (
                        <RadioField
                            key={option.value}
                            id={`${row.id}-${option.value}`}
                            name={row.name ?? row.id}
                            checked={row.value === option.value}
                            disabled={option.disabled}
                            size="sm"
                            align="center"
                            label={
                                <span className="text-xs sm:text-sm leading-6">
                                    {option.label}
                                </span>
                            }
                            className="gap-3"
                            labelClassName="text-xs sm:text-sm leading-6"
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
        <section className="space-y-3.5">
            <PreferencesSectionHeading icon={section.icon} title={section.title} />

            <div className="space-y-3">
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
        <div className="space-y-1.5">
            <h2 className="text-2xl leading-tight text-[#111827]">{intro.title}</h2>
            <p className="text-xs sm:text-sm leading-6 text-[#111827]">{intro.description}</p>
        </div>
    );
}

function EmailTabContent({ tab, onChangeRadio }) {
    return (
        <div className={`space-y-3 ${tab.contentClassName ?? ''}`.trim()}>
            <EmailIntro intro={tab.intro} />

            <div className="max-w-[640px] space-y-3 pt-1">
                {(tab.rows ?? []).map((row) => (
                    <div key={row.id} className="space-y-2">
                        {(row.options ?? []).map((option) => (
                            <RadioField
                                key={option.value}
                                id={`${row.id}-${option.value}`}
                                name={row.name ?? row.id}
                                checked={row.value === option.value}
                                disabled={option.disabled}
                                size="sm"
                                align="center"
                                label={
                                    <span className="text-xs sm:text-sm leading-6">
                                        {option.label}
                                    </span>
                                }
                                className="gap-3"
                                labelClassName="text-xs sm:text-sm leading-6"
                                onChange={() => onChangeRadio(row.id, option.value)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function PreferencesOthersView({ tabs, activeTabId, onSelectTab, onUpdate }) {
    const { tabState, activeTab, updateActiveTab } = usePreferencesTabsState(tabs, activeTabId, onUpdate);

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
                <div className={`max-w-[980px] space-y-3 ${activeTab.contentClassName ?? ''}`.trim()}>
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
