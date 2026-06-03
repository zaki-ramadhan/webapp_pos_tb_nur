import { useEffect, useState } from 'react';

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
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { createBackendResource, getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import { extractPreferencesFromTabs } from './preferenceMapping';
import { dismissToast, showErrorToast, showLoadingToast, showSuccessToast } from '@/components/feedback/toast';

import PreferenceSideItem from './components/PreferenceSideItem';
import PreferenceField from './components/PreferenceField';
import PreferenceCompanyAddress from './components/PreferenceCompanyAddress';

export default function PreferencesView({ page }) {
    const workspace = page.workspace;
    const { rows: backendRows } = useBackendIndexResource({
        resource: 'preferences',
        filters: { per_page: 500 },
    });

    const [values, setValues] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (backendRows.length > 0) {
            const initialValues = {};
            backendRows.forEach(row => {
                initialValues[row.setting_key] = row.value;
            });
            setValues(initialValues);
        }
    }, [backendRows]);

    const handleValueChange = (key, value) => {
        setValues(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
    };

    const companyRootItem = { id: 'company-root', label: workspace.topTab };
    const sideItems = [companyRootItem, ...workspace.sidebarItems];
    const [tabsData, setTabsData] = useState({
        features: workspace.featureTabs,
        tax: workspace.taxTabs,
        approval: workspace.approvalTabs,
        attachments: workspace.attachmentsTabs,
        sales: workspace.salesTabs,
        purchase: workspace.purchaseTabs,
        limitations: workspace.limitationsTabs,
        others: workspace.othersTabs,
    });

    const [activeAttachmentsTabId, setActiveAttachmentsTabId] = useState(workspace.attachmentsTabs?.[0]?.id ?? '');
    const [activeProfileTabId, setActiveProfileTabId] = useState(workspace.companyTabs[0]?.id ?? '');
    const [activeApprovalTabId, setActiveApprovalTabId] = useState(workspace.approvalTabs?.[0]?.id ?? '');
    const [activeFeatureTabId, setActiveFeatureTabId] = useState(workspace.featureTabs?.[0]?.id ?? '');
    const [activeLimitationsTabId, setActiveLimitationsTabId] = useState(workspace.limitationsTabs?.[0]?.id ?? '');
    const [activeOthersTabId, setActiveOthersTabId] = useState(workspace.othersTabs?.[0]?.id ?? '');
    const [activePurchaseTabId, setActivePurchaseTabId] = useState(workspace.purchaseTabs?.[0]?.id ?? '');
    const [activeSalesTabId, setActiveSalesTabId] = useState(workspace.salesTabs?.[0]?.id ?? '');
    const [activeTaxTabId, setActiveTaxTabId] = useState(workspace.taxTabs?.[0]?.id ?? '');
    const [activeSideItemId, setActiveSideItemId] = useState(workspace.defaultSidebarItemId ?? companyRootItem.id);
    const [saving, setSaving] = useState(false);

    const handleTabsUpdate = (key, nextTabs) => {
        setTabsData(prev => ({ ...prev, [key]: nextTabs }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const loadingToastId = showLoadingToast({
            title: 'Memproses',
            message: 'Sedang menyimpan preferensi.',
        });
        try {
            const payload = {
                company_info: values,
                settings: {
                    ...values,
                    ...extractPreferencesFromTabs(Object.values(tabsData).flat())
                }
            };

            await createBackendResource('preferences', payload);
            setIsDirty(false);
            dismissToast(loadingToastId);
            showSuccessToast({
                title: 'Berhasil',
                message: 'Preferensi berhasil disimpan.',
            });
        } catch (error) {
            console.error('Save failed:', error);
            dismissToast(loadingToastId);
            showErrorToast({
                title: 'Gagal menyimpan',
                message: getBackendErrorMessage(error),
            });
        } finally {
            setSaving(false);
        }
    };

    const resolvedActions = (workspace.actions ?? []).map(action => 
        action.id === 'save' 
            ? { ...action, onClick: handleSave, loading: saving, disabled: (saving || !isDirty) && action.tone === 'primary' }
            : action
    );

    function renderSidebarContent() {
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
                            <div className="max-w-[980px] space-y-10">
                                <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
                                    {workspace.companyInfo.map((field) => (
                                        <div key={field.id} className="contents">
                                            <label className="text-[16px] text-[#1f2436]">{field.label}</label>
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

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-sm border border-[#d3d9e5] bg-[#fbfbfc] md:rounded-r-[4px] md:rounded-bl-none md:border-t md:border-l-0">
                    {renderSidebarContent()}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#d5dbe6] bg-white px-4 py-4">
                <PanelActions actions={resolvedActions} />
            </div>
        </div>
    );
}
