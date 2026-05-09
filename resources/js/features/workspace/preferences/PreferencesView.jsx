import { useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextareaField from '@/components/ui/TextareaField';
import TextInput from '@/components/ui/TextInput';
import PreferencesAttachmentsView from '@/features/workspace/preferences/PreferencesAttachmentsView';
import PreferencesApprovalView from '@/features/workspace/preferences/PreferencesApprovalView';
import PreferencesFeatureView from '@/features/workspace/preferences/PreferencesFeatureView';
import PreferencesLimitationsView from '@/features/workspace/preferences/PreferencesLimitationsView';
import PreferencesOthersView from '@/features/workspace/preferences/PreferencesOthersView';
import PreferencesPurchaseView from '@/features/workspace/preferences/PreferencesPurchaseView';
import PreferencesSalesView from '@/features/workspace/preferences/PreferencesSalesView';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import PreferencesTaxView from '@/features/workspace/preferences/PreferencesTaxView';
import PanelActions from '@/features/workspace/shared/PanelActions';
import {
    CalendarIcon,
    CloseIcon,
    PencilIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';

function PreferenceSideItem({ item, active, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick(item.id)}
            className={`relative flex h-[36px] w-full items-center justify-center rounded-l-[3px] border border-r-0 px-4 text-center text-[15px] transition sm:justify-end sm:text-right ${
                active
                    ? 'z-10 -mr-px border-[#d3d9e5] border-l-[3px] border-l-[#ED3969] bg-white font-semibold text-[#333c52] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]'
                    : 'border-[#b5bcc8] bg-[#c8c8c8] font-normal text-[#5f6679] hover:bg-[#cfcfd1]'
            }`.trim()}
        >
            {item.label}
        </button>
    );
}

function PreferenceAddressTokenField({ tokens = [] }) {
    return (
        <div className="flex min-h-[36px] w-full flex-wrap items-center gap-2 rounded-[3px] border border-[#d8dde7] bg-white px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            {tokens.map((token) => (
                <span
                    key={token.id}
                    className="inline-flex items-center gap-2 rounded-[4px] border border-[#7ea8e6] bg-[#eaf3ff] px-2 py-1 text-[14px] text-[#35507a]"
                >
                    <span>{token.label}</span>
                    <CloseIcon className="h-3.5 w-3.5" />
                </span>
            ))}
        </div>
    );
}

function PreferenceAddressTextField({ field, className = '' }) {
    return (
        <TextInput
            id={field.id}
            defaultValue={field.value}
            placeholder={field.placeholder}
            disabled={field.disabled}
            error={field.error}
            message={field.message}
            prefix={field.label}
            prefixClassName="min-w-[62px] border-[#d8dde7] px-3 text-[15px] text-[#7b8597]"
            trailing={field.clearable ? <CloseIcon /> : null}
            trailingClassName="px-2.5 text-[#1f2d42]"
            className={`h-[34px] rounded-[3px] border-[#d8dde7] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ${className}`.trim()}
            inputClassName="text-[15px] text-[#1f2436]"
        />
    );
}

function PreferenceCompanyAddress({ address }) {
    const addressFields = address?.fields?.reduce((result, field) => {
        result[field.id] = field;
        return result;
    }, {});
    const cityField = addressFields?.city;
    const provinceField = addressFields?.province;
    const postalCodeField = addressFields?.['postal-code'];
    const countryField = addressFields?.country;

    if (!address || !cityField || !provinceField || !postalCodeField || !countryField) {
        return (
            <div className="p-5 text-[16px] text-[#65708a]">
                Pengaturan alamat perusahaan belum tersedia.
            </div>
        );
    }

    return (
        <div className="max-w-[980px]">
            <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[190px_minmax(0,646px)] lg:items-start">
                <label className="pt-3 text-[16px] text-[#1f2436]">{address.label}</label>

                <div className="space-y-3">
                    <TextareaField
                        id={address.street?.id}
                        defaultValue={address.street?.value}
                        placeholder={address.street?.placeholder}
                        disabled={address.street?.disabled}
                        error={address.street?.error}
                        message={address.street?.message}
                        prefix={address.street?.label}
                        rows={3}
                        prefixClassName="min-w-[72px] border-[#d8dde7] px-3 py-3 text-[15px] text-[#7b8597]"
                        className="rounded-[3px] border-[#d8dde7] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                        textareaClassName="min-h-[96px] px-3 py-2.5 text-[15px] leading-6 text-[#1f2436]"
                    />

                    <PreferenceAddressTokenField tokens={address.tokens} />

                    <PreferenceAddressTextField field={cityField} />

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_206px]">
                        <PreferenceAddressTextField field={provinceField} />
                        <PreferenceAddressTextField field={postalCodeField} />
                    </div>

                    <PreferenceAddressTextField field={countryField} />
                </div>
            </div>
        </div>
    );
}

const PREFERENCE_FIELD_RENDERERS = {
    select(field) {
        return (
            <SelectField
                id={field.id}
                defaultValue={field.value}
                disabled={field.disabled}
                error={field.error}
                message={field.message}
                className="h-[34px] rounded-[3px] border-[#cfd6e2]"
                selectClassName="text-[15px]"
            >
                {field.options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </SelectField>
        );
    },
    date(field) {
        return (
            <div className="flex max-w-[280px] items-center gap-0">
                <TextInput
                    id={field.id}
                    defaultValue={field.value}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    error={field.error}
                    message={field.message}
                    className="h-[34px] rounded-r-none rounded-l-[3px] border-[#cfd6e2]"
                    inputClassName="text-[15px]"
                />
                <button
                    type="button"
                    disabled={field.disabled}
                    className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-r-[3px] border border-l-0 border-[#cfd6e2] bg-white text-[#2f394f] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    aria-label={`Pilih ${field.label}`}
                >
                    <CalendarIcon />
                </button>
            </div>
        );
    },
    'readonly-edit'(field) {
        return (
            <div className="flex max-w-[480px] items-center gap-4">
                <TextInput
                    id={field.id}
                    defaultValue={field.value}
                    readOnly
                    disabled={field.disabled}
                    error={field.error}
                    message={field.message}
                    className="h-[34px] flex-1 rounded-[3px] border-[#cfd6e2] bg-[#f8f8f8]"
                    inputClassName="text-[15px] text-[#6a7388]"
                />
                <button
                    type="button"
                    disabled={field.disabled}
                    className="inline-flex h-[32px] w-[40px] items-center justify-center rounded-[2px] bg-[#e8e4dd] text-[#2a3349] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    aria-label={`Edit ${field.label}`}
                >
                    <PencilIcon />
                </button>
            </div>
        );
    },
    'chip-search'(field) {
        return (
            <TextInput
                id={field.id}
                defaultValue={field.value}
                placeholder={field.placeholder}
                disabled={field.disabled}
                error={field.error}
                message={field.message}
                trailing={
                    <span className="inline-flex items-center gap-3 text-[#1f2d42]">
                        <CloseIcon />
                        <SearchIcon className="h-5 w-5 text-[#1f2d42]" />
                    </span>
                }
                className="h-[34px] rounded-[3px] border-[#cfd6e2]"
                inputClassName="text-[15px]"
            />
        );
    },
    search(field) {
        return (
            <TextInput
                id={field.id}
                placeholder={field.placeholder}
                disabled={field.disabled}
                error={field.error}
                message={field.message}
                trailing={<SearchIcon className="h-5 w-5 text-[#1f2d42]" />}
                className="h-[34px] rounded-[3px] border-[#cfd6e2]"
                inputClassName="text-[15px]"
            />
        );
    },
    default(field) {
        return (
            <TextInput
                id={field.id}
                defaultValue={field.value}
                placeholder={field.placeholder}
                disabled={field.disabled}
                error={field.error}
                message={field.message}
                trailing={field.clearable ? <CloseIcon /> : null}
                className="h-[34px] rounded-[3px] border-[#cfd6e2]"
                inputClassName="text-[15px]"
            />
        );
    },
};

function PreferenceField({ field }) {
    const renderField = PREFERENCE_FIELD_RENDERERS[field.type] ?? PREFERENCE_FIELD_RENDERERS.default;

    return renderField(field);
}

export default function PreferencesView({ page }) {
    const workspace = page.workspace;
    const companyRootItem = { id: 'company-root', label: workspace.topTab };
    const sideItems = [companyRootItem, ...workspace.sidebarItems];
    const [activeAttachmentsTabId, setActiveAttachmentsTabId] = useState(
        workspace.attachmentsTabs?.[0]?.id ?? '',
    );
    const [activeProfileTabId, setActiveProfileTabId] = useState(workspace.companyTabs[0]?.id ?? '');
    const [activeApprovalTabId, setActiveApprovalTabId] = useState(workspace.approvalTabs?.[0]?.id ?? '');
    const [activeFeatureTabId, setActiveFeatureTabId] = useState(workspace.featureTabs?.[0]?.id ?? '');
    const [activeLimitationsTabId, setActiveLimitationsTabId] = useState(
        workspace.limitationsTabs?.[0]?.id ?? '',
    );
    const [activeOthersTabId, setActiveOthersTabId] = useState(workspace.othersTabs?.[0]?.id ?? '');
    const [activePurchaseTabId, setActivePurchaseTabId] = useState(workspace.purchaseTabs?.[0]?.id ?? '');
    const [activeSalesTabId, setActiveSalesTabId] = useState(workspace.salesTabs?.[0]?.id ?? '');
    const [activeTaxTabId, setActiveTaxTabId] = useState(workspace.taxTabs?.[0]?.id ?? '');
    const [activeSideItemId, setActiveSideItemId] = useState(
        workspace.defaultSidebarItemId ?? companyRootItem.id,
    );

    function renderSidebarContent() {
        if (activeSideItemId === 'features' && workspace.featureTabs?.length) {
            return (
                <PreferencesFeatureView
                    tabs={workspace.featureTabs}
                    activeTabId={activeFeatureTabId}
                    onSelectTab={setActiveFeatureTabId}
                />
            );
        }

        if (activeSideItemId === 'tax' && workspace.taxTabs?.length) {
            return (
                <PreferencesTaxView
                    tabs={workspace.taxTabs}
                    activeTabId={activeTaxTabId}
                    onSelectTab={setActiveTaxTabId}
                />
            );
        }

        if (activeSideItemId === 'approval' && workspace.approvalTabs?.length) {
            return (
                <PreferencesApprovalView
                    tabs={workspace.approvalTabs}
                    activeTabId={activeApprovalTabId}
                    onSelectTab={setActiveApprovalTabId}
                />
            );
        }

        if (activeSideItemId === 'attachments' && workspace.attachmentsTabs?.length) {
            return (
                <PreferencesAttachmentsView
                    tabs={workspace.attachmentsTabs}
                    activeTabId={activeAttachmentsTabId}
                    onSelectTab={setActiveAttachmentsTabId}
                />
            );
        }

        if (activeSideItemId === 'sales' && workspace.salesTabs?.length) {
            return (
                <PreferencesSalesView
                    tabs={workspace.salesTabs}
                    activeTabId={activeSalesTabId}
                    onSelectTab={setActiveSalesTabId}
                />
            );
        }

        if (activeSideItemId === 'purchase' && workspace.purchaseTabs?.length) {
            return (
                <PreferencesPurchaseView
                    tabs={workspace.purchaseTabs}
                    activeTabId={activePurchaseTabId}
                    onSelectTab={setActivePurchaseTabId}
                />
            );
        }

        if (activeSideItemId === 'limitations' && workspace.limitationsTabs?.length) {
            return (
                <PreferencesLimitationsView
                    tabs={workspace.limitationsTabs}
                    activeTabId={activeLimitationsTabId}
                    onSelectTab={setActiveLimitationsTabId}
                />
            );
        }

        if (activeSideItemId === 'others' && workspace.othersTabs?.length) {
            return (
                <PreferencesOthersView
                    tabs={workspace.othersTabs}
                    activeTabId={activeOthersTabId}
                    onSelectTab={setActiveOthersTabId}
                />
            );
        }

        if (activeSideItemId === companyRootItem.id) {
            return (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <PreferencesTabs
                        tabs={workspace.companyTabs}
                        activeTabId={activeProfileTabId}
                        onSelectTab={setActiveProfileTabId}
                        activeTabClassName="font-medium text-[#374056]"
                    />

                    <div className="mx-2 mb-2 min-h-0 flex-1 overflow-y-auto rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:mx-3 sm:mb-3 sm:px-4">
                        {activeProfileTabId === 'company-info' ? (
                            <div className="max-w-[980px] space-y-10">
                                <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
                                    {workspace.companyInfo.map((field) => (
                                        <div key={field.id} className="contents">
                                            <label className="text-[16px] text-[#1f2436]">{field.label}</label>
                                            <div>
                                                <PreferenceField field={field} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <PreferenceCompanyAddress address={workspace.companyAddress} />
                        )}
                    </div>
                </div>
            );
        }

        const currentItem = sideItems.find((item) => item.id === activeSideItemId);

        return (
            <div className="mx-2 mb-2 flex min-h-[320px] items-center justify-center rounded-[4px] border border-[#d3d9e5] bg-white px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:mx-3 sm:mb-3">
                <div className="max-w-[560px] space-y-3">
                    <h3 className="text-[22px] font-medium text-[#2b3449]">{currentItem?.label}</h3>
                    <p className="text-[16px] leading-7 text-[#687389]">
                        Halaman preferensi untuk {currentItem?.label?.toLowerCase()} belum dirender pada iterasi
                        ini. Struktur `Fitur` sudah dibuat reusable agar sub-halaman berikutnya bisa mengikuti pola
                        yang sama.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col overflow-hidden rounded-[4px] border border-[#cad1dd] bg-[#f7f7f8] shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-[#d7dde8] bg-[#f8f8f8] px-2 pt-1 md:flex-row">
                <div className="flex min-h-0 w-full shrink-0 flex-col md:w-[190px]">
                    <div className="min-h-0 flex-1 border border-[#cfd6e2] bg-[#efefef] px-3 pb-3 pt-2 md:rounded-l-sm md:border-r-0 md:pr-0">
                        <div className="space-y-2">
                            {sideItems.map((item) => (
                                <PreferenceSideItem
                                    key={item.id}
                                    item={item}
                                    active={activeSideItemId === item.id}
                                    onClick={setActiveSideItemId}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-sm border border-t-0 border-[#d3d9e5] bg-[#fbfbfc] md:rounded-r-[4px] md:rounded-bl-none md:border-t md:border-l-0">
                    {renderSidebarContent()}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#d5dbe6] bg-white px-4 py-4">
                <PanelActions actions={workspace.actions} />
            </div>
        </div>
    );
}
