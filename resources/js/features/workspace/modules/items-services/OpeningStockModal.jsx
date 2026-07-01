import { useState, useEffect } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { FormRow, SimpleTextField } from './itemsServicesViewShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { CalendarIcon, CalculatorIcon, DownloadIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHeader,
    DataTableHead,
    DataTableRow,
} from '@/components/ui/DataTable';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';

export default function OpeningStockModal({ open, onClose, onConfirm, initialUnit = [] }) {
    const [activeTab, setActiveTab] = useState('details');

    // Tab 1 state
    const [warehouse, setWarehouse] = useState([{ name: 'Utama' }]);
    const [date, setDate] = useState(buildTodayDisplayDate());
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState(initialUnit);
    const [unitCost, setUnitCost] = useState('0');

    // Tab 2 state
    const [serialInput, setSerialInput] = useState('');
    const [serials, setSerials] = useState([]);

    useEffect(() => {
        if (open) {
            setWarehouse([{ name: 'Utama' }]);
            setDate(buildTodayDisplayDate());
            setQuantity('1');
            setUnit(initialUnit);
            setUnitCost('0');
            setSerialInput('');
            setSerials([]);
            setActiveTab('details');
        }
    }, [open, initialUnit]);

    const qtyVal = parseFloat(String(quantity).replace(/\./g, '').replace(/,/g, '.')) || 0;
    const costVal = parseFloat(String(unitCost).replace(/\./g, '').replace(/,/g, '.')) || 0;
    const totalCost = qtyVal * costVal;
    const formattedTotalCost = `Rp ${Number(totalCost).toLocaleString('id-ID')}`;

    const serialCount = serials.length;
    const neededSerials = Math.max(0, qtyVal - serialCount);

    function handleSerialKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const val = serialInput.trim();
            if (val) {
                // Tambah nomor seri jika belum ada
                if (!serials.some((s) => s.number === val)) {
                    setSerials((curr) => [...curr, { id: Date.now(), number: val, expiryDate: '' }]);
                }
                setSerialInput('');
            }
        }
    }

    function handleSave() {
        // Validasi basic
        if (!warehouse.length || !date || qtyVal <= 0 || costVal <= 0) {
            return;
        }

        const data = {
            warehouse: warehouse[0]?.name || '',
            date,
            quantity: String(qtyVal),
            unit: unit[0]?.name || '',
            unitCost: String(costVal),
            serials: serials.map((s) => s.number),
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
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={qtyVal <= 0 || costVal <= 0 || !warehouse.length}
                        className="inline-flex h-[38px] items-center justify-center rounded-[4px] bg-blue-900 px-6 text-base font-normal text-white hover:bg-blue-950 transition disabled:opacity-50 disabled:cursor-default"
                    >
                        Lanjut
                    </button>
                </div>
            }
        >
            <div className="flex border-b border-slate-300 mb-5">
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
                <button
                    type="button"
                    onClick={() => setActiveTab('serials')}
                    className={`px-4 py-2.5 text-xs sm:text-sm border-b-2 transition-colors -mb-px outline-none ${
                        activeTab === 'serials'
                            ? 'border-tab-active-border-t text-tab-active-border-t font-normal'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    No Seri/Produksi
                </button>
            </div>

            {activeTab === 'details' ? (
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
            ) : (
                <div className="space-y-2">
                    <FormRow label="Nomor #">
                        <div className="flex gap-2.5 items-center">
                            <div className="flex-1 min-w-0">
                                <SimpleTextField
                                    value={serialInput}
                                    onChange={(e) => setSerialInput(e.target.value)}
                                    onKeyDown={handleSerialKeyDown}
                                    placeholder="Scan Barcode / Ketik lalu [Ent"
                                    className="w-full"
                                />
                            </div>
                            <button
                                type="button"
                                className="inline-flex h-[40px] items-center gap-1 rounded-[4px] bg-blue-900 px-3 text-sm text-white hover:bg-blue-950 transition"
                            >
                                <DownloadIcon className="h-4.5 w-4.5 text-white" />
                                <ChevronDownIcon className="h-3 w-3 text-white" />
                            </button>
                        </div>
                    </FormRow>

                    <DataTable wrapperClassName="border-table-wrapper-border mt-3 max-h-[220px] overflow-y-auto">
                        <DataTableHeader className="bg-table-header-bg">
                            <tr>
                                <DataTableHead className="w-[50px] text-center text-white px-3 py-2">
                                    No.
                                </DataTableHead>
                                <SortableTableHeaderCell
                                    label="Nomor #"
                                    align="left"
                                    sortable={false}
                                />
                                <SortableTableHeaderCell
                                    label="Kadaluarsa"
                                    align="left"
                                    sortable={false}
                                />
                            </tr>
                        </DataTableHeader>
                        <DataTableBody>
                            {serials.length > 0 ? (
                                serials.map((ser, index) => (
                                    <DataTableRow key={ser.id} className="bg-white border-b border-slate-200">
                                        <DataTableCell className="text-center px-3 py-2 text-sm text-text-workspace-dark">
                                            {index + 1}
                                        </DataTableCell>
                                        <DataTableCell className="px-3 py-2 text-sm text-brand-dark">
                                            {ser.number}
                                        </DataTableCell>
                                        <DataTableCell className="px-3 py-2 text-sm text-brand-dark">
                                            {ser.expiryDate || '-'}
                                        </DataTableCell>
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell colSpan={3} className="text-center py-6 text-sm text-slate-400">
                                        Belum ada data
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </DataTableBody>
                    </DataTable>

                    <div className="text-sm text-slate-600 mt-2">
                        {neededSerials > 0
                            ? `${serialCount} No Seri/Produksi. Isikan ${neededSerials} lagi`
                            : `${serialCount} No Seri/Produksi. Kuantitas terpenuhi`}
                    </div>
                </div>
            )}
        </WorkspaceDialog>
    );
}
