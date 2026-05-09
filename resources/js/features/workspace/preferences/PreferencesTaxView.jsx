import CheckboxField from '@/components/ui/CheckboxField';
import RadioField from '@/components/ui/RadioField';
import TextareaField from '@/components/ui/TextareaField';
import TextInput from '@/components/ui/TextInput';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';
import {
    CalendarIcon,
    CloseIcon,
    InfoIcon,
    LinkIcon,
} from '@/features/workspace/shared/Icons';

function TaxRowLabel({ label, showInfo = false }) {
    if (!label) {
        return <div className="hidden lg:block" aria-hidden="true" />;
    }

    return (
        <div className="pt-2 text-[16px] leading-8 text-[#0f172a]">
            <span className="whitespace-pre-line">{label}</span>
            {showInfo ? <InfoIcon className="ml-2 inline h-[18px] w-[18px] align-text-bottom text-[#111827]" /> : null}
        </div>
    );
}

function TaxActionButton({ control }) {
    return (
        <button
            type="button"
            disabled={control.disabled}
            aria-label={control.ariaLabel ?? control.label}
            className={`inline-flex h-[48px] w-[60px] items-center justify-center rounded-[6px] border border-[#4f86d9] bg-white text-[#0f65c9] transition hover:bg-[#f5f9ff] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300 ${control.className ?? ''}`.trim()}
        >
            {control.icon === 'link' ? <LinkIcon className="h-6 w-6" /> : null}
        </button>
    );
}

function TaxInputControl({ control, onChange }) {
    if (control.type === 'textarea') {
        return (
            <TextareaField
                id={control.id}
                value={control.value ?? ''}
                placeholder={control.placeholder}
                disabled={control.disabled}
                error={control.error}
                message={control.message}
                prefix={control.prefix}
                rows={control.rows ?? 3}
                className={`rounded-[6px] border-[#cfd6e2] ${control.fieldClassName ?? ''}`.trim()}
                prefixClassName={`min-w-[60px] border-[#d8dde7] px-3 py-2.5 text-[15px] text-[#7b8597] ${control.prefixClassName ?? ''}`.trim()}
                textareaClassName={`min-h-[96px] px-3 py-2.5 text-[15px] leading-6 text-[#111827] ${control.inputClassName ?? ''}`.trim()}
                onChange={(event) => onChange(event.target.value)}
            />
        );
    }

    if (control.type === 'date') {
        return (
            <div className="flex w-full items-start">
                <TextInput
                    id={control.id}
                    value={control.value ?? ''}
                    placeholder={control.placeholder}
                    disabled={control.disabled}
                    error={control.error}
                    message={control.message}
                    className={`h-[44px] rounded-r-none rounded-l-[6px] border-[#cfd6e2] ${control.fieldClassName ?? ''}`.trim()}
                    inputClassName={`text-[15px] text-[#111827] ${control.inputClassName ?? ''}`.trim()}
                    onChange={(event) => onChange(event.target.value)}
                />
                <button
                    type="button"
                    disabled={control.disabled}
                    aria-label={control.calendarLabel ?? 'Pilih tanggal'}
                    className="inline-flex h-[44px] w-[42px] shrink-0 items-center justify-center rounded-r-[6px] border border-l-0 border-[#cfd6e2] bg-white text-[#1f2937] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                    <CalendarIcon />
                </button>
            </div>
        );
    }

    return (
        <TextInput
            id={control.id}
            value={control.value ?? ''}
            placeholder={control.placeholder}
            disabled={control.disabled}
            error={control.error}
            message={control.message}
            prefix={control.prefix}
            trailing={control.clearable ? <CloseIcon className="h-4 w-4" /> : null}
            className={`h-[44px] rounded-[6px] border-[#cfd6e2] ${control.fieldClassName ?? ''}`.trim()}
            prefixClassName={`min-w-[62px] border-[#d8dde7] px-3 text-[15px] text-[#7b8597] ${control.prefixClassName ?? ''}`.trim()}
            inputClassName={`text-[15px] text-[#111827] ${control.inputClassName ?? ''}`.trim()}
            trailingClassName={control.clearable ? 'px-3 text-[#1f2937]' : ''}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

function TaxFieldRow({ row, onChangeControl }) {
    return (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[168px_minmax(0,1fr)] lg:items-start">
            <TaxRowLabel label={row.label} showInfo={row.showInfo} />

            <div className={`flex flex-wrap items-start gap-3 ${row.controlsClassName ?? ''}`.trim()}>
                {(row.controls ?? []).map((control) => (
                    <div
                        key={control.id}
                        className={`${control.wrapperClassName ?? 'w-full max-w-[424px]'} ${control.type === 'action' ? 'w-auto max-w-none' : ''}`.trim()}
                    >
                        {control.type === 'action' ? (
                            <TaxActionButton control={control} />
                        ) : (
                            <TaxInputControl
                                control={control}
                                onChange={(value) => onChangeControl(row.id, control.id, value)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TaxRadioRow({ row, onChange }) {
    return (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[168px_minmax(0,1fr)] lg:items-start">
            <TaxRowLabel label={row.label} showInfo={row.showInfo} />

            <div className={`flex flex-wrap gap-x-8 gap-y-3 pt-1 ${row.optionsClassName ?? ''}`.trim()}>
                {(row.options ?? []).map((option) => (
                    <RadioField
                        key={option.value}
                        id={`${row.id}-${option.value}`}
                        name={row.name ?? row.id}
                        checked={row.value === option.value}
                        disabled={option.disabled}
                        size="md"
                        label={<span className="text-[17px]">{option.label}</span>}
                        className="gap-3"
                        onChange={() => onChange(row.id, option.value)}
                    />
                ))}
            </div>
        </div>
    );
}

function TaxCheckboxListRow({ row, onToggle }) {
    return (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[168px_minmax(0,1fr)] lg:items-start">
            <TaxRowLabel label={row.label} showInfo={row.showInfo} />

            <div className={`space-y-3 pt-1 ${row.optionsClassName ?? ''}`.trim()}>
                {(row.options ?? []).map((option) => (
                    <CheckboxField
                        key={option.id}
                        id={`${row.id}-${option.id}`}
                        checked={Boolean(option.checked)}
                        disabled={Boolean(option.disabled)}
                        size="sm"
                        align="center"
                        label={<span className="text-[17px]">{option.label}</span>}
                        className="gap-3"
                        inputClassName="rounded-[5px] border-[#b6c1d1]"
                        onChange={(event) => onToggle(row.id, option.id, event.target.checked)}
                    />
                ))}
            </div>
        </div>
    );
}

function TaxSingleCheckboxRow({ row, onToggle }) {
    return (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[168px_minmax(0,1fr)] lg:items-start">
            <TaxRowLabel label={row.label} showInfo={row.showInfo} />

            <div className="pt-1">
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

function TaxRow({ row, onChangeControl, onChangeRadio, onToggleOption, onToggleSingle }) {
    if (row.type === 'radio') {
        return <TaxRadioRow row={row} onChange={onChangeRadio} />;
    }

    if (row.type === 'checkbox-list') {
        return <TaxCheckboxListRow row={row} onToggle={onToggleOption} />;
    }

    if (row.type === 'single-checkbox') {
        return <TaxSingleCheckboxRow row={row} onToggle={onToggleSingle} />;
    }

    return <TaxFieldRow row={row} onChangeControl={onChangeControl} />;
}

export default function PreferencesTaxView({ tabs, activeTabId, onSelectTab }) {
    const { activeTab, updateActiveTab } = usePreferencesTabsState(tabs, activeTabId);

    function updateActiveTabRows(updater) {
        updateActiveTab((tab) => ({
            ...tab,
            rows: updater(tab.rows ?? []),
        }));
    }

    function handleChangeControl(rowId, controlId, value) {
        updateActiveTabRows((rows) =>
            rows.map((row) =>
                row.id === rowId
                    ? {
                          ...row,
                          controls: (row.controls ?? []).map((control) =>
                              control.id === controlId ? { ...control, value } : control,
                          ),
                      }
                    : row,
            ),
        );
    }

    function handleChangeRadio(rowId, value) {
        updateActiveTabRows((rows) =>
            rows.map((row) => (row.id === rowId ? { ...row, value } : row)),
        );
    }

    function handleToggleOption(rowId, optionId, checked) {
        updateActiveTabRows((rows) =>
            rows.map((row) =>
                row.id === rowId
                    ? {
                          ...row,
                          options: (row.options ?? []).map((option) =>
                              option.id === optionId ? { ...option, checked } : option,
                          ),
                      }
                    : row,
            ),
        );
    }

    function handleToggleSingle(rowId, checked) {
        updateActiveTabRows((rows) =>
            rows.map((row) =>
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
            panelClassName={`space-y-5 ${activeTab.contentClassName ?? ''}`.trim()}
        >
            {(activeTab.rows ?? []).map((row) => (
                <TaxRow
                    key={row.id}
                    row={row}
                    onChangeControl={handleChangeControl}
                    onChangeRadio={handleChangeRadio}
                    onToggleOption={handleToggleOption}
                    onToggleSingle={handleToggleSingle}
                />
            ))}
        </PreferencesTabPanel>
    );
}
