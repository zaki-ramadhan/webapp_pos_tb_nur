import React from 'react';
import PreferencesAttachmentsView from '@/features/workspace/preferences/PreferencesAttachmentsView';
import PreferencesApprovalView from '@/features/workspace/preferences/PreferencesApprovalView';
import PreferencesFeatureView from '@/features/workspace/preferences/PreferencesFeatureView';
import PreferencesLimitationsView from '@/features/workspace/preferences/PreferencesLimitationsView';
import PreferencesOthersView from '@/features/workspace/preferences/PreferencesOthersView';
import PreferencesPurchaseView from '@/features/workspace/preferences/PreferencesPurchaseView';
import PreferencesSalesView from '@/features/workspace/preferences/PreferencesSalesView';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import PreferencesTaxView from '@/features/workspace/preferences/PreferencesTaxView';
import PreferenceField from './components/PreferenceField';
import PreferenceCompanyAddress from './components/PreferenceCompanyAddress';

export default function PreferencesSidebarContent({
    activeSideItemId,
    tabsData,
    workspace,
    values,
    handleTabsUpdate,
    handleValueChange,
    activeFeatureTabId,
    setActiveFeatureTabId,
    activeTaxTabId,
    setActiveTaxTabId,
    activeApprovalTabId,
    setActiveApprovalTabId,
    activeAttachmentsTabId,
    setActiveAttachmentsTabId,
    activeSalesTabId,
    setActiveSalesTabId,
    activePurchaseTabId,
    setActivePurchaseTabId,
    activeLimitationsTabId,
    setActiveLimitationsTabId,
    activeOthersTabId,
    setActiveOthersTabId,
    activeProfileTabId,
    setActiveProfileTabId,
    companyRootItem,
    sideItems,
}) {
    if (activeSideItemId === 'features' && tabsData.features?.length) {
        return (
            <PreferencesFeatureView
                tabs={tabsData.features}
                activeTabId={activeFeatureTabId}
                onSelectTab={setActiveFeatureTabId}
                onUpdate={(next) => handleTabsUpdate('features', next)}
            />
        );
    }

    if (activeSideItemId === 'tax' && tabsData.tax?.length) {
        return (
            <PreferencesTaxView
                tabs={tabsData.tax}
                activeTabId={activeTaxTabId}
                onSelectTab={setActiveTaxTabId}
                onUpdate={(next) => handleTabsUpdate('tax', next)}
            />
        );
    }

    if (activeSideItemId === 'approval' && tabsData.approval?.length) {
        return (
            <PreferencesApprovalView
                tabs={tabsData.approval}
                activeTabId={activeApprovalTabId}
                onSelectTab={setActiveApprovalTabId}
                onUpdate={(next) => handleTabsUpdate('approval', next)}
            />
        );
    }

    if (activeSideItemId === 'attachments' && tabsData.attachments?.length) {
        return (
            <PreferencesAttachmentsView
                tabs={tabsData.attachments}
                activeTabId={activeAttachmentsTabId}
                onSelectTab={setActiveAttachmentsTabId}
                onUpdate={(next) => handleTabsUpdate('attachments', next)}
            />
        );
    }

    if (activeSideItemId === 'sales' && tabsData.sales?.length) {
        return (
            <PreferencesSalesView
                tabs={tabsData.sales}
                activeTabId={activeSalesTabId}
                onSelectTab={setActiveSalesTabId}
                onUpdate={(next) => handleTabsUpdate('sales', next)}
            />
        );
    }

    if (activeSideItemId === 'purchase' && tabsData.purchase?.length) {
        return (
            <PreferencesPurchaseView
                tabs={tabsData.purchase}
                activeTabId={activePurchaseTabId}
                onSelectTab={setActivePurchaseTabId}
                onUpdate={(next) => handleTabsUpdate('purchase', next)}
            />
        );
    }

    if (activeSideItemId === 'limitations' && tabsData.limitations?.length) {
        return (
            <PreferencesLimitationsView
                tabs={tabsData.limitations}
                activeTabId={activeLimitationsTabId}
                onSelectTab={setActiveLimitationsTabId}
                onUpdate={(next) => handleTabsUpdate('limitations', next)}
            />
        );
    }

    if (activeSideItemId === 'others' && tabsData.others?.length) {
        return (
            <PreferencesOthersView
                tabs={tabsData.others}
                activeTabId={activeOthersTabId}
                onSelectTab={setActiveOthersTabId}
                onUpdate={(next) => handleTabsUpdate('others', next)}
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
                        <div className="max-w-[980px] space-y-4">
                            <div className="grid gap-x-6 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
                                {workspace.companyInfo.map((field) => (
                                    <div key={field.id} className="contents">
                                        <label className="text-xs sm:text-sm text-[#1f2436]">{field.label}</label>
                                        <div>
                                            <PreferenceField 
                                                field={field} 
                                                value={values[field.id]} 
                                                onChange={handleValueChange} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <PreferenceCompanyAddress 
                            address={workspace.companyAddress} 
                            values={values}
                            onChange={handleValueChange}
                        />
                    )}
                </div>
            </div>
        );
    }

    const currentItem = sideItems.find((item) => item.id === activeSideItemId);

    return (
        <div className="mx-2 mb-2 flex min-h-[320px] items-center justify-center rounded-[4px] border border-[#d3d9e5] bg-white px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:mx-3 sm:mb-3">
            <div className="max-w-[560px] space-y-3">
                <h3 className="text-2xl font-medium text-[#2b3449]">{currentItem?.label}</h3>
                <p className="text-xs sm:text-sm leading-6 text-[#687389]">
                    Halaman preferensi untuk {currentItem?.label?.toLowerCase()} belum dirender pada iterasi
                    ini. Struktur `Fitur` sudah dibuat reusable agar sub-halaman berikutnya bisa mengikuti pola
                    yang sama.
                </p>
            </div>
        </div>
    );
}
