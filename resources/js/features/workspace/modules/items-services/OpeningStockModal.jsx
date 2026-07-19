import { useState, useEffect } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import { FormRow, SimpleTextField } from './itemsServicesViewShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { CalendarIcon, CalculatorIcon } from '@/features/workspace/shared/Icons';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

export default function OpeningStockModal({ open, onClose, onConfirm, initialUnit = [] }) {
    const [activeTab, setActiveTab] = useState('details');
    const [warehouse, setWarehouse] = useState([{ name: 'Utama' }]);
    const [date, setDate] = useState(buildTodayDisplayDate());
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState(initialUnit);
    const [unitCost, setUnitCost] = useState('0');

    useEffect(() => {
        if (open) {
            setWarehouse([{ name: 'Utama' }]);
            setDate(buildTodayDisplayDate());
            setQuantity('1');
            setUnit(initialUnit);
            setUnitCost('0');
            setActiveTab('details');
        }
    }, [open, initialUnit]);

    const qtyVal = parseFloat(String(quantity).replace(/\./g, '').replace(/,/g, '.')) || 0;
    const costVal = parseFloat(String(unitCost).replace(/\./g, '').replace(/,/g, '.')) || 0;
    const totalCost = qtyVal * costVal;
    const formattedTotalCost = `Rp ${Number(totalCost).toLocaleString('id-ID')}`;

    function handleSave() {
        if (!warehouse.length || !date || qtyVal <= 0 || costVal <= 0) {
            return;
        }

        const data = {
            warehouse: warehouse[0]?.name || '',
            date,
            quantity: String(qtyVal),
            unit: unit[0]?.name || '',
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
            title="Saldo Awal"
            maxWidthClassName="max-w-[500px]"
            footer={
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={qtyVal <= 0 || costVal <= 0 || !warehouse.length}
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
