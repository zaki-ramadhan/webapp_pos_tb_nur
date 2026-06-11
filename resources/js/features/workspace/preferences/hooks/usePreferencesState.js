import { useState, useEffect } from 'react';
import { mergeValuesIntoTabs } from '../preferenceMapping';

export default function usePreferencesState(workspace, backendRows) {
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
    const getInitialSideItemId = () => {
        if (typeof window !== 'undefined' && window.__nextPreferencesTab) {
            const tabId = window.__nextPreferencesTab;
            window.__nextPreferencesTab = null;
            return tabId;
        }
        return workspace.defaultSidebarItemId ?? 'company-root';
    };

    const [activeSideItemId, setActiveSideItemId] = useState(getInitialSideItemId);
    const [saving, setSaving] = useState(false);

    const handleTabsUpdate = (key, nextTabs) => {
        setTabsData(prev => ({ ...prev, [key]: nextTabs }));
        setIsDirty(true);
    };

    useEffect(() => {
        if (Object.keys(values).length > 0) {
            setTabsData(prev => mergeValuesIntoTabs(prev, values));
        }
    }, [values]);

    useEffect(() => {
        function handleOpenTab(e) {
            const { sideItemId } = e.detail || {};
            if (sideItemId) {
                setActiveSideItemId(sideItemId);
            }
        }
        window.addEventListener('workspace:open-preferences-tab', handleOpenTab);
        return () => window.removeEventListener('workspace:open-preferences-tab', handleOpenTab);
    }, []);

    return {
        values,
        setValues,
        isDirty,
        setIsDirty,
        tabsData,
        setTabsData,
        handleValueChange,
        handleTabsUpdate,
        activeAttachmentsTabId,
        setActiveAttachmentsTabId,
        activeProfileTabId,
        setActiveProfileTabId,
        activeApprovalTabId,
        setActiveApprovalTabId,
        activeFeatureTabId,
        setActiveFeatureTabId,
        activeLimitationsTabId,
        setActiveLimitationsTabId,
        activeOthersTabId,
        setActiveOthersTabId,
        activePurchaseTabId,
        setActivePurchaseTabId,
        activeSalesTabId,
        setActiveSalesTabId,
        activeTaxTabId,
        setActiveTaxTabId,
        activeSideItemId,
        setActiveSideItemId,
        saving,
        setSaving,
    };
}
