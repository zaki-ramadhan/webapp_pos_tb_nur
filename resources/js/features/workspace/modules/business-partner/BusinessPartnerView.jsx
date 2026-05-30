import { useEffect, useMemo, useState } from 'react';

import { buildBusinessPartnerConfig, buildBusinessPartnerRecord } from '@/features/workspace/modules/business-partner/businessPartnerConfig';
import {
    buildFormState,
    BusinessPartnerTableView,
    DockIcon,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import { renderPartnerTab } from '@/features/workspace/modules/business-partner/BusinessPartnerFormSections';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import useBackendResource from '@/features/workspace/backend/useBackendResource';
import { mapPartnerRow, toPartnerPayload } from '@/features/workspace/backend/workspaceBackendAdapters';

function BusinessPartnerFormView({ config, activeLevel2Tab, partnerType, onRefresh }) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const sourceRow = config.table.rows.find((row) => row.id === recordId) ?? {};
    const sourceRecord = useMemo(
        () => (isDetail ? buildBusinessPartnerRecord(partnerType, sourceRow, config) : config.formDefaults),
        [config, isDetail, partnerType, sourceRow],
    );
    const [activeTabId, setActiveTabId] = useState(config.tabs[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFormState(sourceRecord));

    useEffect(() => {
        setActiveTabId(config.tabs[0]?.id ?? 'general');
        setValues(buildFormState(sourceRecord));
    }, [sourceRecord]);

    const resourceName = partnerType === 'supplier' ? 'suppliers' : 'customers';
    const { processing, store, update, remove } = useBackendResource({
        resource: resourceName,
        onResolved: () => onRefresh?.(),
    });

    const handleSave = async () => {
        const payload = toPartnerPayload(values);
        if (isDetail) {
            await update(recordId, payload);
        } else {
            await store(payload);
        }
    };

    const handleDelete = async () => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            await remove(recordId);
        }
    };

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const dockActions = isDetail
        ? [
              {
                  id: 'save',
                  label: processing ? 'Menyimpan...' : 'Simpan',
                  tone: 'primary',
                  icon: 'save',
                  onClick: handleSave,
                  disabled: processing,
              },
              { id: 'attachment', label: 'Lampiran', tone: 'primary', icon: 'attachment' },
              {
                  id: 'delete',
                  label: 'Hapus',
                  tone: 'danger',
                  icon: 'trash',
                  onClick: handleDelete,
                  disabled: processing,
              },
          ]
        : [
              {
                  id: 'save',
                  label: processing ? 'Menyimpan...' : 'Simpan',
                  tone: 'primary',
                  icon: 'save',
                  onClick: handleSave,
                  disabled: processing,
              },
              { id: 'attachment', label: 'Lampiran', tone: 'primary', icon: 'attachment' },
          ];

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={config.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[700px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                <div className="order-2 min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-3 py-4 sm:px-4 lg:order-1">
                    {renderPartnerTab({
                        config,
                        values,
                        isDetail,
                        activeTabId,
                        onChange: handleChange,
                    })}
                </div>

                <div className="order-1 flex justify-end lg:order-2 lg:shrink-0">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        {dockActions.map((action) => (
                            <DockActionButton
                                key={action.id}
                                label={action.label}
                                tone={action.tone}
                                icon={<DockIcon icon={action.icon} />}
                                onClick={action.onClick}
                                disabled={action.disabled}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BusinessPartnerView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    partnerType = 'customer',
}) {
    const resourceName = partnerType === 'supplier' ? 'suppliers' : 'customers';
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: resourceName,
        filters: {
            per_page: 100,
        },
    });

    const pageConfig = partnerType === 'supplier' ? page.suppliers ?? {} : page.customers ?? {};
    const config = useMemo(() => {
        const baseConfig = buildBusinessPartnerConfig(partnerType, pageConfig);
        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: rows.map(mapPartnerRow),
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat...' : baseConfig.table.refreshLabel,
            },
        };
    }, [loading, pageConfig, partnerType, rows, total]);

    return mode === 'table' ? (
        <BusinessPartnerTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <BusinessPartnerFormView
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            partnerType={partnerType}
            onRefresh={reload}
        />
    );
}
