import { useState, useEffect } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import { FormRow, SimpleTextField } from './itemsServicesViewShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';

export default function OpeningStockModal({
    open,
    onClose,
    onConfirm,
    onDelete,
    initialData = null,
    initialUnit = [],
    initialUnitCost = '',
}) {
    const [activeTab, setActiveTab] = useState('details');
    const [warehouse, setWarehouse] = useState([{ id: 1, name: 'Gudang Utama' }]);
    const [date, setDate] = useState(buildTodayDisplayDate());
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState(initialUnit);
    const [unitCost, setUnitCost] = useState(() => (initialUnitCost ? formatAmountInput(initialUnitCost) : '0'));
    const [totalCost, setTotalCost] = useState(0);

    const documentNumber = initialData?.document_number || null;
    const documentId = initialData?.document_id || null;

    useEffect(() => {
        if (!open) return;

        setActiveTab('details');

        if (initialData) {
            const wName = initialData.warehouse || 'Gudang Utama';
            const wId = initialData.warehouse_id || 1;
            setWarehouse([{ id: wId, name: wName }]);

            setDate(initialData.date || buildTodayDisplayDate());
            const qtyStr = formatAmountInput(initialData.quantity, { allowDecimal: false }) || '1';
            setQuantity(qtyStr);

            if (initialData.unit) {
                setUnit([{ id: initialData.unit_id || null, name: initialData.unit }]);
            } else {
                setUnit(initialUnit);
            }

            const costStr = formatAmountInput(initialData.unitCost ?? initialData.unit_cost ?? initialUnitCost ?? '0');
            setUnitCost(costStr);

            const q = parseFloat(String(qtyStr).replace(/\./g, '').replace(/,/g, '.')) || 0;
            const c = parseFloat(String(costStr).replace(/\./g, '').replace(/,/g, '.')) || 0;
            setTotalCost(q * c);
        } else {
            setDate(buildTodayDisplayDate());
            setQuantity('1');
            setUnit(initialUnit);
            const initialCost = initialUnitCost ? formatAmountInput(initialUnitCost) : '0';
            setUnitCost(initialCost);
            const q = 1;
            const c = parseFloat(String(initialCost).replace(/\./g, '').replace(/,/g, '.')) || 0;
            setTotalCost(q * c);

            listBackendResource('warehouses', { per_page: 10 })
                .then((res) => {
                    const rows = extractBackendRows(res);
                    const defaultWh = rows.find((r) => r.is_active !== false) || rows[0];
                    if (defaultWh) {
                        setWarehouse([{ id: defaultWh.id, name: defaultWh.name }]);
                    } else {
                        setWarehouse([{ id: 1, name: 'Gudang Utama' }]);
                    }
                })
                .catch(() => {
                    setWarehouse([{ id: 1, name: 'Gudang Utama' }]);
                });
        }
    }, [open, initialData, initialUnit, initialUnitCost]);

    const calculateTotalCost = (qStr = quantity, cStr = unitCost) => {
        const q = parseFloat(String(qStr).replace(/\./g, '').replace(/,/g, '.')) || 0;
        const c = parseFloat(String(cStr).replace(/\./g, '').replace(/,/g, '.')) || 0;
        setTotalCost(q * c);
    };

    const handleOpenAdjustment = () => {
        if (!documentId && !documentNumber) return;
        window.dispatchEvent(
            new CustomEvent('workspace:open-page', {
                detail: {
                    pageId: 'inventory-adjustment',
                    recordId: documentId ? String(documentId) : null,
                    label: documentNumber || `IA#${documentId}`,
                    tabLabel: documentNumber || `IA#${documentId}`,
                },
            }),
        );
    };

    function handleSave() {
        const qtyVal = parseFloat(String(quantity).replace(/\./g, '').replace(/,/g, '.')) || 0;
        const costVal = parseFloat(String(unitCost).replace(/\./g, '').replace(/,/g, '.')) || 0;

        if (!warehouse.length || !date || qtyVal <= 0 || costVal < 0) {
            onClose();
            return;
        }

        const selectedWarehouse = warehouse[0];
        const selectedUnit = unit[0];

        const data = {
            ...(initialData || {}),
            warehouse: selectedWarehouse?.name || selectedWarehouse?.label || '',
            warehouse_id: selectedWarehouse?.id ? Number(selectedWarehouse.id) : null,
            date,
            quantity: String(qtyVal),
            unit: selectedUnit?.name || selectedUnit?.label || '',
            unit_id: selectedUnit?.id ? Number(selectedUnit.id) : null,
            unitCost: String(costVal),
            serials: initialData?.serials || [],
        };

        onConfirm(data);
        onClose();
    }

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Stok Awal"
            maxWidthClassName="max-w-[500px]"
            contentClassName="bg-white px-5 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6 min-h-[460px] flex flex-col justify-start"
            footer={
                <div className={`flex items-center ${initialData ? 'justify-between' : 'justify-end'} w-full`}>
                    {initialData && (
                        <Button
                            type="button"
                            onClick={() => {
                                onDelete?.(initialData);
                                onClose();
                            }}
                            size="md"
                            variant="danger"
                            className="rounded-[4px] min-w-[80px] cursor-pointer"
                        >
                            Hapus
                        </Button>
                    )}
                    <Button
                        type="button"
                        onClick={handleSave}
                        size="md"
                        variant="brand-blue"
                        className="rounded-[4px] min-w-[80px] cursor-pointer"
                    >
                        Lanjut
                    </Button>
                </div>
            }
        >
            <div className="flex border-b border-slate-300 mb-5 -mt-2 sm:-mt-3">
                <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2.5 text-xs sm:text-sm border-b-2 transition-colors -mb-px outline-none ${
                        activeTab === 'details'
                            ? 'border-tab-active-border-t text-tab-active-border-t font-normal'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    Rincian Barang
                </button>
            </div>

            {activeTab === 'details' && (
                <div className="space-y-2">
                    <FormRow label="Gudang" required>
                        <BackendLookupField
                            resource="warehouses"
                            value={warehouse?.[0]?.name ?? (typeof warehouse?.[0] === 'string' ? warehouse[0] : (warehouse?.name ?? ''))}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari gudang"
                            onSelect={(option) => setWarehouse([option])}
                            onClear={() => setWarehouse([])}
                        />
                    </FormRow>

                    {Boolean(documentNumber || documentId) && (
                        <FormRow label="No Penyesuaian #">
                            <button
                                type="button"
                                onClick={handleOpenAdjustment}
                                className="flex items-center px-3 py-2 border border-emerald-400 rounded-[4px] w-full text-left transition duration-150 ease-in-out text-xs sm:text-sm font-semibold h-[38px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500 cursor-pointer"
                            >
                                {documentNumber || `IA#${documentId}`}
                            </button>
                        </FormRow>
                    )}

                    <FormRow label="Tanggal" required>
                        <div className="w-3/4">
                            <TransactionDateInput
                                value={date}
                                onChange={(val) => setDate(val)}
                                className="h-[40px] rounded-[4px] border-ui-border w-full"
                            />
                        </div>
                    </FormRow>

                    <FormRow label="Kuantitas" required>
                        <div className="w-3/4">
                            <SimpleTextField
                                value={quantity}
                                onChange={(e) => {
                                    const next = formatAmountInput(e.target.value, { allowDecimal: false });
                                    setQuantity(next);
                                    calculateTotalCost(next, unitCost);
                                }}
                                allowDecimal={false}
                                inputClassName="text-right"
                            />
                        </div>
                    </FormRow>

                    <FormRow label="Satuan">
                        <div className="w-3/4">
                            <BackendLookupField
                                resource="units"
                                value={unit?.[0]?.name ?? (typeof unit?.[0] === 'string' ? unit[0] : (unit?.name ?? ''))}
                                placeholder="Cari/Pilih..."
                                searchLabel="Cari satuan"
                                onSelect={(option) => setUnit([option])}
                                onClear={() => setUnit([])}
                            />
                        </div>
                    </FormRow>

                    <FormRow label="Biaya Satuan" required>
                        <div className="w-3/4">
                            <SimpleTextField
                                value={unitCost}
                                onChange={(e) => {
                                    const next = formatAmountInput(e.target.value);
                                    setUnitCost(next);
                                    calculateTotalCost(quantity, next);
                                }}
                                prefix="Rp"
                                inputClassName="text-right"
                            />
                        </div>
                    </FormRow>

                    <FormRow label="Total Biaya">
                        <div className="w-3/4">
                            <SimpleTextField
                                value={formatAmountInput(totalCost)}
                                prefix="Rp"
                                disabled={true}
                                inputClassName="text-right"
                            />
                        </div>
                    </FormRow>
                </div>
            )}
        </WorkspaceDialog>
    );
}
