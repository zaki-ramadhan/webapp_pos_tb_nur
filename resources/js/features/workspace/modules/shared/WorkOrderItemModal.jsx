import { useEffect, useState, useCallback } from 'react';
import { showErrorToast } from '@/components/feedback/toast';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import WorkOrderDetailTab from './work-order-modal/WorkOrderDetailTab';
import WorkOrderSerialTab from './work-order-modal/WorkOrderSerialTab';
import WorkOrderInfoTab from './work-order-modal/WorkOrderInfoTab';

function cloneLookupValues(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function buildInitialValues(item = {}) {
    const source = item ?? {};

    return {
        code: source.code ?? '',
        name: source.name ?? '',
        quantity: source.quantity ?? '',
        unitLookup: cloneLookupValues(source.unitLookup ?? source.unit),
        warehouse: cloneLookupValues(source.warehouse),
        department: cloneLookupValues(source.department),
        notes: source.notes ?? '',
        serialNumbers: [...(source.serialNumbers ?? [])],
    };
}

export default function WorkOrderItemModal({ open, onClose, modal, item }) {
    const tabs = modal?.tabs ?? [];
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildInitialValues(item));
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setActiveTabId(tabs[0]?.id ?? 'details');
        setValues(buildInitialValues(item));
        setErrors({});
    }, [item, tabs]);

    const handleValuesChange = useCallback((updater) => {
        setValues(updater);
        setErrors({});
    }, []);

    if (!modal || !item) {
        return null;
    }

    const activeTabIdSafe = tabs.some((tab) => tab.id === activeTabId) ? activeTabId : tabs[0]?.id ?? 'details';

    function handleSubmit() {
        const newErrors = {};
        if (!String(values.name ?? '').trim()) {
            newErrors.name = 'Nama barang harus diisi.';
        }
        const qty = parseFloat(String(values.quantity).replace(/\./g, '').replace(/,/g, '.'));
        if (!qty || qty <= 0) {
            newErrors.quantity = 'Kuantitas harus lebih besar dari 0.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setActiveTabId(tabs[0]?.id ?? 'details');
            showErrorToast({ message: Object.values(newErrors)[0] });
            return;
        }

        onClose();
    }

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title={modal.title}
            tabs={tabs}
            activeTabId={activeTabIdSafe}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup rincian barang"
            panelClassName="max-w-[620px] overflow-hidden rounded-[4px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[340px] py-4"
            footer={
                <DocumentModalFooter
                    deleteLabel={modal.deleteLabel}
                    submitLabel={modal.submitLabel}
                    onDelete={onClose}
                    onSubmit={handleSubmit}
                />
            }
        >
            {activeTabIdSafe === 'info' ? (
                <WorkOrderInfoTab values={values} setValues={handleValuesChange} />
            ) : activeTabIdSafe === 'serials' ? (
                <WorkOrderSerialTab values={values} />
            ) : (
                <WorkOrderDetailTab values={values} setValues={handleValuesChange} errors={errors} />
            )}
        </DocumentModalLayout>
    );
}
