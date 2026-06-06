import { useEffect } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import RadioField from '@/components/ui/RadioField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import Tooltip from '@/components/ui/Tooltip';
import PreferencesLookupField from '@/features/workspace/preferences/PreferencesLookupField';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';
import { InfoIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import PreferenceLookupAutocomplete from './components/PreferenceLookupAutocomplete';

const UNBILLED_ACCOUNT_OPTIONS = [
    '[511.000-06] Beban Selisih Pembelian Barang',
    '[511.000-07] Beban Selisih Nilai Persediaan',
    '[511.000-08] Selisih Kurs Pembelian',
];

const ASSET_ACCOUNT_OPTIONS = [
    '[121.000-01] Asset Tetap - Peralatan',
    '[121.000-02] Asset Tetap - Kendaraan',
    '[121.000-03] Asset Tetap - Gedung',
    '[121.000-04] Asset Tetap - Tanah',
];

const DIFFERENCE_ACCOUNT_OPTIONS = [
    '[511.000-06] Beban Selisih Pembelian Barang',
    '[511.000-07] Beban Selisih Nilai Persediaan',
    '[511.000-08] Selisih Kurs Pembelian',
];

const TEMPORARY_ACCOUNT_OPTIONS = [
    '[111.000-01] Kas Induk',
    '[111.000-02] Kas Kecil',
    '[112.000-01] Bank Mandiri',
    '[112.000-02] Bank BCA',
    '[112.000-03] Bank BRI',
];


function getPurchaseInfo(id, label) {
    const map = {
        'purchase-order-auto-close': 'Menutup pesanan pembelian secara otomatis ketika kuantitas barang yang diterima telah terpenuhi.',
        'purchase-payment-temporary-account': 'Akun perantara untuk membukukan transaksi pembayaran sebelum rekonsiliasi bank selesai.',
    };
    return map[id] || `Informasi tentang ${label}`;
}

function PurchaseInlineCheckboxRow({ row, onToggle }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
            <div className="text-[14px] md:text-[15px] leading-6 text-[#0f172a]">
                <span>{row.label}</span>
                {row.showInfo ? (
                    <Tooltip content={getPurchaseInfo(row.id, row.label)} portal>
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
                    label={<span className="text-[14px] md:text-[15px]">{row.option?.label}</span>}
                    className="gap-3"
                    labelClassName="text-[14px] md:text-[15px] leading-6"
                    inputClassName="rounded-[5px] border-[#6ea4ef] shadow-[0_0_0_3px_rgba(110,164,239,0.08)]"
                    onChange={(event) => onToggle(row.id, event.target.checked)}
                />
            </div>
        </div>
    );
}

function PurchaseDescriptionRow({ row }) {
    return (
        <div className="text-[14px] md:text-[15px] leading-6 text-[#111827]">
            <span className="whitespace-pre-line">{row.label}</span>
        </div>
    );
}

function PurchaseRadioGroupRow({ row, onChange }) {
    return (
        <div className="space-y-2">
            <div className="text-[14px] md:text-[15px] font-medium leading-6 text-[#111827]">
                <span className="whitespace-pre-line">{row.label}</span>
            </div>

            <div className="space-y-2 pl-0 sm:pl-10">
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
                            <span className="whitespace-pre-line text-[14px] md:text-[15px] leading-6">
                                {option.label}
                            </span>
                        }
                        className="gap-3"
                        labelClassName="text-[14px] md:text-[15px] leading-6"
                        onChange={() => onChange(row.id, option.value)}
                    />
                ))}
            </div>
        </div>
    );
}

function PurchaseStandaloneLookupRow({ row, onChangeControl }) {
    return (
        <div className="space-y-2">
            <div className="text-[14px] md:text-[15px] leading-6 text-[#111827]">
                <span>{row.label}</span>
                {row.showInfo ? (
                    <Tooltip content={getPurchaseInfo(row.id, row.label)} portal>
                        <InfoIcon className="ml-2 inline h-[18px] w-[18px] align-text-bottom text-[#111827] cursor-help" />
                    </Tooltip>
                ) : null}
            </div>

            <div className={`${row.widthClassName ?? 'max-w-[480px]'}`.trim()}>
                <PreferenceLookupAutocomplete
                    field={{
                        id: row.id,
                        label: row.label,
                        disabled: row.control?.disabled,
                        placeholder: row.control?.placeholder
                    }}
                    value={row.control?.value}
                    onChange={(fieldId, option) => onChangeControl?.(row.id, option)}
                    options={UNBILLED_ACCOUNT_OPTIONS}
                />
            </div>
        </div>
    );
}

function PurchaseFieldControl({ rowId, control, onChange }) {
    if (rowId === 'purchase-asset-account') {
        return (
            <PreferenceLookupAutocomplete
                field={{
                    id: rowId,
                    label: 'Pembelian Asset',
                    disabled: control.disabled,
                    placeholder: control.placeholder
                }}
                value={control.value}
                onChange={(fieldId, option) => onChange(option)}
                options={ASSET_ACCOUNT_OPTIONS}
            />
        );
    }

    if (rowId === 'purchase-difference-account') {
        return (
            <PreferenceLookupAutocomplete
                field={{
                    id: rowId,
                    label: 'Akun Selisih',
                    disabled: control.disabled,
                    placeholder: control.placeholder
                }}
                value={control.value}
                onChange={(fieldId, option) => onChange(option)}
                options={DIFFERENCE_ACCOUNT_OPTIONS}
            />
        );
    }

    if (rowId === 'purchase-payment-temporary-account') {
        return (
            <PreferenceLookupAutocomplete
                field={{
                    id: rowId,
                    label: 'Akun Kas Penampungan',
                    disabled: control.disabled,
                    placeholder: control.placeholder
                }}
                value={control.value}
                onChange={(fieldId, option) => onChange(option)}
                options={TEMPORARY_ACCOUNT_OPTIONS}
            />
        );
    }

    if (control.type === 'lookup') {
        return (
            <PreferencesLookupField
                value={control.value}
                placeholder={control.placeholder}
                clearable={control.clearable}
                tokenClassName={control.tokenClassName}
                className={control.className}
                onClear={() => onChange?.('')}
            />
        );
    }

    if (control.type === 'select') {
        return (
            <SelectField
                id={control.id}
                value={control.value}
                className={`h-[38px] rounded-[6px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
                selectClassName="text-[14px] md:text-[15px] text-[#111827]"
                onChange={(event) => onChange(event.target.value)}
            >
                {(control.options ?? []).map((option) => (
                    <option key={option.value ?? option} value={option.value ?? option}>
                        {option.label ?? option}
                    </option>
                ))}
            </SelectField>
        );
    }

    return (
        <TextInput
            id={control.id}
            value={control.value ?? ''}
            placeholder={control.placeholder}
            className={`h-[38px] rounded-[6px] border-[#cfd6e2] ${control.className ?? ''}`.trim()}
            inputClassName="text-[14px] md:text-[15px] text-[#111827]"
            trailing={<SearchIcon className="h-5 w-5 text-[#1f2937]" />}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

function PurchaseGridFieldRow({ row, onChangeControl }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
            <div className="text-[14px] md:text-[15px] leading-6 text-[#111827]">
                <span>{row.label}</span>
                {row.showInfo ? (
                    <Tooltip content={getPurchaseInfo(row.id, row.label)} portal>
                        <InfoIcon className="ml-2 inline h-[18px] w-[18px] align-text-bottom text-[#111827] cursor-help" />
                    </Tooltip>
                ) : null}
            </div>

            <div className={`${row.widthClassName ?? 'max-w-[420px]'}`.trim()}>
                <PurchaseFieldControl
                    rowId={row.id}
                    control={row.control ?? {}}
                    onChange={(value) => onChangeControl(row.id, value)}
                />
            </div>
        </div>
    );
}

function PurchaseSection({ section, onChangeRadio, onToggleSingle, onChangeControl }) {
    return (
        <section className="space-y-3.5">
            <PreferencesSectionHeading icon={section.icon} title={section.title} />

            <div className="space-y-3">
                {(section.rows ?? []).map((row) => {
                    if (row.type === 'inline-checkbox') {
                        return (
                            <PurchaseInlineCheckboxRow
                                key={row.id}
                                row={row}
                                onToggle={onToggleSingle}
                            />
                        );
                    }

                    if (row.type === 'description') {
                        return <PurchaseDescriptionRow key={row.id} row={row} />;
                    }

                    if (row.type === 'radio-group') {
                        return (
                            <PurchaseRadioGroupRow
                                key={row.id}
                                row={row}
                                onChange={onChangeRadio}
                            />
                        );
                    }

                    if (row.type === 'lookup-block') {
                        return (
                            <PurchaseStandaloneLookupRow
                                key={row.id}
                                row={row}
                                onChangeControl={onChangeControl}
                            />
                        );
                    }

                    return (
                        <PurchaseGridFieldRow
                            key={row.id}
                            row={row}
                            onChangeControl={onChangeControl}
                        />
                    );
                })}
            </div>
        </section>
    );
}

export default function PreferencesPurchaseView({
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
            panelClassName={`max-w-[760px] space-y-6 ${activeTab.contentClassName ?? ''}`.trim()}
        >
            {(activeTab.sections ?? []).map((section) => (
                <PurchaseSection
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
