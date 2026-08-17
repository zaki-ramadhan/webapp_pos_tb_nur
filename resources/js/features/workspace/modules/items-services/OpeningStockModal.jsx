import { useState, useEffect } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import { FormRow, SimpleTextField } from './itemsServicesViewShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { CalendarIcon, CalculatorIcon } from '@/features/workspace/shared/Icons';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';

export default function OpeningStockModal({ open, onClose, onConfirm, initialUnit = [], initialUnitCost = '' }) {
    const [activeTab, setActiveTab] = useState('details');
    const [warehouse, setWarehouse] = useState([{ id: 1, name: 'Gudang Utama' }]);
    const [date, setDate] = useState(buildTodayDisplayDate());
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState(initialUnit);
    const [unitCost, setUnitCost] = useState(() => (initialUnitCost ? formatAmountInput(initialUnitCost) : '0'));
    const [totalCost, setTotalCost] = useState(() => {
        const q = parseFloat(String('1').replace(/\./g, '').replace(/,/g, '.')) || 0;
        const c = parseFloat(String(initialUnitCost || '0').replace(/\./g, '').replace(/,/g, '.')) || 0;
        return q * c;
    });

    useEffect(() => {
        if (open) {
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

            setDate(buildTodayDisplayDate());
            setQuantity('1');
            setUnit(initialUnit);
            const initialCost = initialUnitCost ? formatAmountInput(initialUnitCost) : '0';
            setUnitCost(initialCost);
            const q = 1;
            const c = parseFloat(String(initialCost).replace(/\./g, '').replace(/,/g, '.')) || 0;
            setTotalCost(q * c);
            setActiveTab('details');
        }
    }, [open, initialUnit, initialUnitCost]);

    const calculateTotalCost = (qStr = quantity, cStr = unitCost) => {
        const q = parseFloat(String(qStr).replace(/\./g, '').replace(/,/g, '.')) || 0;
        const c = parseFloat(String(cStr).replace(/\./g, '').replace(/,/g, '.')) || 0;
        setTotalCost(q * c);
    };

    const formattedTotalCost = `Rp ${Number(totalCost).toLocaleString('id-ID')}`;

    function handleSave() {
        const qtyVal = parseFloat(String(quantity).replace(/\./g, '').replace(/,/g, '.')) || 0;
        const costVal = parseFloat(String(unitCost).replace(/\./g, '').replace(/,/g, '.')) || 0;

        if (!warehouse.length || !date || qtyVal <= 0 || costVal <= 0) {
            onClose();
            return;
        }

        const selectedWarehouse = warehouse[0];
        const selectedUnit = unit[0];

        const data = {
            warehouse: selectedWarehouse?.name || selectedWarehouse?.label || '',
            warehouse_id: selectedWarehouse?.id ? Number(selectedWarehouse.id) : null,
            date,
            quantity: String(qtyVal),
            unit: selectedUnit?.name || selectedUnit?.label || '',
            unit_id: selectedUnit?.id ? Number(selectedUnit.id) : null,
            unitCost: String(costVal),
            serials: [],
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
            footer={
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        size="sm"
                        variant="primary"
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
                            values={warehouse}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari gudang"
                            onSelect={(option) => setWarehouse([option])}
                            onRemove={() => setWarehouse([])}
                        />
                    </FormRow>

                    <FormRow label="Tanggal" required>
                        <SimpleTextField
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            trailing={<CalendarIcon className="h-4.5 w-4.5 text-slate-500" />}
                        />
                    </FormRow>

                    <FormRow label="Kuantitas" required>
                        <SimpleTextField
                            value={quantity}
                            onChange={(e) => setQuantity(formatAmountInput(e.target.value, { allowDecimal: false }))}
                            onBlur={(e) => calculateTotalCost(e.target.value, unitCost)}
                            allowDecimal={false}
                            trailing={<CalculatorIcon className="h-4.5 w-4.5 text-slate-500" />}
                        />
                    </FormRow>

                    <FormRow label="Satuan">
                        <BackendLookupField
                            resource="units"
                            values={unit}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari satuan"
                            onSelect={(option) => setUnit([option])}
                            onRemove={() => setUnit([])}
                        />
                    </FormRow>

                    <FormRow label="Biaya Satuan" required>
                        <SimpleTextField
                            value={unitCost}
                            onChange={(e) => setUnitCost(formatAmountInput(e.target.value))}
                            onBlur={(e) => calculateTotalCost(quantity, e.target.value)}
                            prefix="Rp"
                            trailing={<CalculatorIcon className="h-4.5 w-4.5 text-slate-500" />}
                        />
                    </FormRow>

                    <FormRow label="Total Biaya">
                        <SimpleTextField
                            value={formattedTotalCost}
                            disabled={true}
                        />
                    </FormRow>
                </div>
            )}
        </WorkspaceDialog>
    );
}
