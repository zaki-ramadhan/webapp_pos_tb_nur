import { useEffect } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import RadioField from '@/components/ui/RadioField';
import TextareaField from '@/components/ui/TextareaField';
import TextInput from '@/components/ui/TextInput';
import TransactionDateInput from '@/features/workspace/modules/shared/transaction/TransactionDateInput';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';
import usePreferencesSectionHandlers from './hooks/usePreferencesSectionHandlers';
import Tooltip from '@/components/ui/Tooltip';
import {
    CalendarIcon,
    CloseIcon,
    InfoIcon,
    LinkIcon,
} from '@/features/workspace/shared/Icons';

function getTaxTooltip(label) {
    const cleanLabel = String(label || '').trim();
    if (cleanLabel.includes('Tampilkan Kuantitas')) {
        return 'Mengisi nilai kuantitas default = 1 dan mengambil harga jual terbaru saat memilih item barang/jasa.';
    }
    if (cleanLabel.includes('Default DPP')) {
        return 'Menetapkan perhitungan DPP Pajak secara otomatis sebesar 11/12 dari nilai transaksi bruto.';
    }
    return `Informasi tentang ${cleanLabel}`;
}

function TaxRowLabel({ label, showInfo = false }) {
    if (!label) {
        return <div className="hidden lg:block" aria-hidden="true" />;
    }

    return (
        <div className="pt-1.5 text-xs sm:text-sm leading-6 text-[#0f172a]">
            <span className="whitespace-pre-line">{label}</span>
            {showInfo ? (
                <Tooltip content={getTaxTooltip(label)} portal>
                    <InfoIcon className="ml-2 inline h-[18px] w-[18px] align-text-bottom text-[#111827] cursor-help" />
                </Tooltip>
            ) : null}
        </div>
    );
}


function TaxActionButton({ control }) {
    return (
        <button
            type="button"
            disabled={control.disabled}
            aria-label={control.ariaLabel ?? control.label}
            className={`inline-flex h-[38px] w-[50px] items-center justify-center rounded-[6px] border border-[#4f86d9] bg-white text-[#0f65c9] transition hover:bg-[#f5f9ff] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300 ${control.className ?? ''}`.trim()}
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
                prefixClassName={`min-w-[60px] border-[#d8dde7] px-3 py-2 text-xs sm:text-sm text-[#7b8597] ${control.prefixClassName ?? ''}`.trim()}
                textareaClassName={`min-h-[80px] px-3 py-2 text-xs sm:text-sm leading-6 text-[#111827] ${control.inputClassName ?? ''}`.trim()}
                onChange={(event) => onChange(event.target.value)}
            />
        );
    }

    if (control.type === 'date') {
        return (
            <TransactionDateInput
                value={control.value ?? ''}
                disabled={control.disabled}
                onChange={(displayValue) => onChange(displayValue)}
                className={`w-full max-w-[424px] ${control.fieldClassName ?? ''}`.trim()}
                inputClassName={`text-xs sm:text-sm text-[#111827] ${control.inputClassName ?? ''}`.trim()}
            />
        );
    }

    const hasValue = Boolean(control.value);
    return (
        <TextInput
            id={control.id}
            value={control.value ?? ''}
            placeholder={control.placeholder}
            disabled={control.disabled}
            error={control.error}
            message={control.message}
            prefix={control.prefix}
            trailing={
                control.clearable && hasValue ? (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors"
                        aria-label="Hapus"
                    >
                        <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                ) : null
            }
            className={`h-[38px] rounded-[6px] border-[#cfd6e2] ${control.fieldClassName ?? ''}`.trim()}
            prefixClassName={`min-w-[62px] border-[#d8dde7] px-3 text-xs sm:text-sm text-[#7b8597] ${control.prefixClassName ?? ''}`.trim()}
            inputClassName={`text-xs sm:text-sm text-[#111827] ${control.inputClassName ?? ''}`.trim()}
            trailingClassName={control.clearable && hasValue ? 'px-2.5 text-[#1f2937]' : ''}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

function TaxFieldRow({ row, onChangeControl }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
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
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
            <TaxRowLabel label={row.label} showInfo={row.showInfo} />

            <div className={`flex flex-wrap gap-x-8 gap-y-2 pt-0.5 ${row.optionsClassName ?? ''}`.trim()}>
                {(row.options ?? []).map((option) => (
                    <RadioField
                        key={option.value}
                        id={`${row.id}-${option.value}`}
                        name={row.name ?? row.id}
                        checked={row.value === option.value}
                        disabled={option.disabled}
                        size="sm"
                        containerClassName="w-auto"
                        label={<span className="text-xs sm:text-sm">{option.label}</span>}
                        className="gap-3"
                        labelClassName="text-xs sm:text-sm leading-6"
                        onChange={() => onChange(row.id, option.value)}
                    />
                ))}
            </div>
        </div>
    );
}

function TaxCheckboxListRow({ row, onToggle }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
            <TaxRowLabel label={row.label} showInfo={row.showInfo} />

            <div className={`space-y-1.5 pt-0.5 ${row.optionsClassName ?? ''}`.trim()}>
                {(row.options ?? []).map((option) => (
                    <CheckboxField
                        key={option.id}
                        id={`${row.id}-${option.id}`}
                        checked={Boolean(option.checked)}
                        disabled={Boolean(option.disabled)}
                        size="sm"
                        align="center"
                        label={<span className="text-xs sm:text-sm">{option.label}</span>}
                        className="gap-3"
                        labelClassName="text-xs sm:text-sm leading-6"
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
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
            <TaxRowLabel label={row.label} showInfo={row.showInfo} />

            <div className="pt-1">
                <CheckboxField
                    id={`${row.id}-${row.option?.id ?? 'option'}`}
                    checked={Boolean(row.option?.checked)}
                    disabled={Boolean(row.option?.disabled)}
                    size="sm"
                    align="center"
                    label={<span className="text-xs sm:text-sm">{row.option?.label}</span>}
                    className="gap-3"
                    labelClassName="text-xs sm:text-sm leading-6"
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

export default function PreferencesTaxView({ tabs, activeTabId, onSelectTab, onUpdate }) {
    const { tabState, activeTab, updateActiveTab } = usePreferencesTabsState(tabs, activeTabId, onUpdate);

    const {
        handleChangeRadio,
        handleToggleSingle,
        handleChangeNestedControl: handleChangeControl,
        handleToggleOption,
    } = usePreferencesSectionHandlers(updateActiveTab, false);

    if (!activeTab) {
        return null;
    }

    return (
        <PreferencesTabPanel
            tabs={tabs}
            activeTabId={activeTab.id}
            onSelectTab={onSelectTab}
            panelClassName={`space-y-2 ${activeTab.contentClassName ?? ''}`.trim()}
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
