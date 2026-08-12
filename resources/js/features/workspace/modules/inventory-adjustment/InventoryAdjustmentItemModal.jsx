import { useEffect, useState, useCallback } from 'react';
import { showErrorToast } from '@/components/feedback/toast';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import InventoryAdjustmentDetailTab from './components/InventoryAdjustmentDetailTab';
import InventoryAdjustmentInfoTab from './components/InventoryAdjustmentInfoTab';

import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function buildInitialValues(item = {}) {
    const source = item ?? {};
    const defaultUnit = source.unit 
        || source.base_unit?.name 
        || source.baseUnit?.name 
        || (source.unitLookup && source.unitLookup[0]) 
        || 'PCS';

    return {
        __productId: source.__productId ?? null,
        __warehouseId: source.__warehouseId ?? null,
        __departmentId: source.__departmentId ?? null,
        __unitId: source.__unitId ?? null,
        code: source.code ?? '',
        name: source.name ?? '',
        adjustmentType: source.adjustmentType ?? 'Penambahan',
        quantity: formatAmountInput(source.quantity || '1', { allowDecimal: false }),
        unit: defaultUnit,
        unitLookup: cloneList(source.unitLookup?.length ? source.unitLookup : (defaultUnit ? [defaultUnit] : [])),
        unitCost: source.unitCost ?? '',
        totalCost: source.totalCost ?? '',
        warehouse: cloneList(source.warehouse),
        department: cloneList(source.department),
        notes: source.notes ?? '',
    };
}

export function recalculateItemTotalCost(current) {
    if (current.adjustmentType !== 'Penambahan') {
        return {
            ...current,
            unitCost: '0',
            totalCost: '0',
        };
    }
    const qtyNum = parseFloat(String(current.quantity ?? '0').replace(/\./g, '').replace(/,/g, '.')) || 0;
    const unitCostNum = parseFloat(String(current.unitCost ?? '0').replace(/\./g, '').replace(/,/g, '.')) || 0;
    const total = qtyNum * unitCostNum;
    return {
        ...current,
        totalCost: total ? total.toLocaleString('id-ID') : '0',
    };
}

export default function InventoryAdjustmentItemModal({ open, onClose, modal, item, onSave, onDelete }) {
    const tabs = modal?.tabs ?? [];
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'details');
    const [values, setValues] = useState(() => recalculateItemTotalCost(buildInitialValues(item)));
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setActiveTabId(tabs[0]?.id ?? 'details');
        setValues(recalculateItemTotalCost(buildInitialValues(item)));
        setErrors({});
    }, [item, tabs]);

    const handleValuesChange = useCallback((updater) => {
        setValues((current) => (typeof updater === 'function' ? updater(current) : updater));
        setErrors({});
    }, []);

    const handleRecalculateTotal = useCallback(() => {
        setValues((current) => recalculateItemTotalCost(current));
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

        const isAddition = values.adjustmentType === 'Penambahan';
        const unitCostNum = isAddition ? (parseFloat(String(values.unitCost ?? '0').replace(/\./g, '').replace(/,/g, '.')) || 0) : 0;
        const totalCostNum = isAddition ? (qty * unitCostNum) : 0;
        const unitName = values.unitLookup?.[0] || item.unit || 'PCS';

        const updatedItem = {
            ...item,
            ...values,
            quantity: String(qty),
            unit: unitName,
            unitLookup: values.unitLookup?.length ? values.unitLookup : [unitName],
            unitCost: isAddition ? (unitCostNum ? unitCostNum.toLocaleString('id-ID') : '0') : '0',
            totalCost: isAddition ? (totalCostNum ? totalCostNum.toLocaleString('id-ID') : '0') : '0',
        };

        onSave?.(updatedItem);
        onClose();
    }

    function handleDelete() {
        onDelete?.(item);
        onClose();
    }

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title={modal.title ?? 'Rincian Barang'}
            tabs={tabs}
            activeTabId={activeTabIdSafe}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup rincian barang"
            panelClassName="max-w-[540px] overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[360px] py-4"
            footer={
                <DocumentModalFooter
                    deleteLabel={modal.deleteLabel ?? 'Hapus'}
                    submitLabel={modal.submitLabel ?? 'Lanjut'}
                    onDelete={handleDelete}
                    onSubmit={handleSubmit}
                />
            }
        >
            {activeTabIdSafe === 'info' ? (
                <InventoryAdjustmentInfoTab values={values} setValues={handleValuesChange} />
            ) : (
                <InventoryAdjustmentDetailTab
                    values={values}
                    setValues={handleValuesChange}
                    onRecalculateTotal={handleRecalculateTotal}
                    modal={modal}
                    errors={errors}
                />
            )}
        </DocumentModalLayout>
    );
}
