import { useEffect, useState, useCallback } from 'react';
import { showErrorToast } from '@/components/feedback/toast';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import InventoryAdjustmentDetailTab from './components/InventoryAdjustmentDetailTab';
import InventoryAdjustmentInfoTab from './components/InventoryAdjustmentInfoTab';

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function buildInitialValues(item = {}) {
    const source = item ?? {};

    return {
        __productId: source.__productId ?? null,
        code: source.code ?? '',
        name: source.name ?? '',
        adjustmentType: source.adjustmentType ?? 'Penambahan',
        quantity: source.quantity ?? '',
        unitLookup: cloneList(source.unitLookup),
        unitCost: source.unitCost ?? '',
        totalCost: source.totalCost ?? '',
        warehouse: cloneList(source.warehouse),
        department: cloneList(source.department),
        notes: source.notes ?? '',
    };
}

export default function InventoryAdjustmentItemModal({ open, onClose, modal, item }) {
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
        if (!values.warehouse?.length) {
            newErrors.warehouse = 'Gudang harus diisi.';
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
            panelClassName="max-w-[540px] overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[360px] py-4"
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
                <InventoryAdjustmentInfoTab values={values} setValues={handleValuesChange} />
            ) : (
                <InventoryAdjustmentDetailTab values={values} setValues={handleValuesChange} modal={modal} errors={errors} />
            )}
        </DocumentModalLayout>
    );
}
