import { useEffect, useMemo, useState } from 'react';
import RadioField from '@/components/ui/RadioField';
import TextInput from '@/components/ui/TextInput';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';
import { listBackendResource, extractBackendRows } from '@/features/workspace/backend/workspaceBackendApi';

function ModalFieldRow({ label, required = false, alignTop = false, children }) {
    return (
        <div className={`grid gap-2 sm:grid-cols-[156px_minmax(0,1fr)] sm:gap-x-4 ${alignTop ? 'sm:items-start' : 'sm:items-center'}`}>
            <TransactionFieldLabel label={label} required={required} className={`text-xs sm:text-sm font-normal text-slate-700 ${alignTop ? 'pt-1.5 sm:pt-1' : ''}`} />
            <div>{children}</div>
        </div>
    );
}

export default function InventoryAdjustmentDetailTab({ values, setValues, onRecalculateTotal, modal, errors = {} }) {
    const [warehouseStocks, setWarehouseStocks] = useState([]);
    const [loadingStock, setLoadingStock] = useState(false);

    useEffect(() => {
        let ignore = false;
        const code = values.code || '';
        if (!code) {
            setWarehouseStocks([]);
            return undefined;
        }

        async function fetchStock() {
            setLoadingStock(true);
            try {
                const res = await listBackendResource('item-locations', { search: code });
                const rows = extractBackendRows(res);
                if (!ignore) {
                    setWarehouseStocks(rows);
                }
            } catch {
                // Abaikan error jaringan
            } finally {
                if (!ignore) setLoadingStock(false);
            }
        }

        fetchStock();
        return () => {
            ignore = true;
        };
    }, [values.code]);

    const selectedWarehouseName = values.warehouse?.[0] || '';
    const currentWarehouseStock = useMemo(() => {
        if (!warehouseStocks.length) return 0;
        const matched = warehouseStocks.find(
            (row) =>
                (selectedWarehouseName && row.warehouse === selectedWarehouseName) ||
                (values.__warehouseId && String(row.warehouse_id) === String(values.__warehouseId)),
        );
        return matched ? (parseFloat(matched.saleable_stock ?? matched.available_stock ?? 0) || 0) : 0;
    }, [selectedWarehouseName, values.__warehouseId, warehouseStocks]);

    const isAddition = values.adjustmentType === 'Penambahan';
    const adjustmentOptions = ['Penambahan', 'Pengurangan', 'Atur Stok'];

    return (
        <div className="space-y-4">
            <ModalFieldRow label="Kode Barang">
                <div className="flex h-[40px] items-center text-xs sm:text-sm font-medium text-document-code">{values.code || '—'}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Nama Barang" required>
                <TextInput
                    value={values.name}
                    readOnly
                    error={errors.name}
                    className="h-[40px] rounded-[4px] border-ui-border bg-slate-50"
                    inputClassName="text-xs sm:text-sm text-brand-dark cursor-not-allowed"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Tipe Penyesuaian" alignTop>
                <div className="flex flex-col gap-2 pt-0.5">
                    {adjustmentOptions.map((option) => (
                        <RadioField
                            key={option}
                            id={`adjustment-type-${option.toLowerCase().replace(/\s+/g, '-')}`}
                            name="adjustmentType"
                            label={option}
                            containerClassName="w-auto"
                            checked={values.adjustmentType === option}
                            onChange={() =>
                                setValues((current) => ({
                                    ...current,
                                    adjustmentType: option,
                                }))
                            }
                        />
                    ))}
                </div>
            </ModalFieldRow>

            <ModalFieldRow label="Kuantitas" required>
                <div className="grid grid-cols-5 gap-3 items-center">
                    <div className="col-span-2 min-w-0">
                        <FormattedAmountInput
                            id="quantity"
                            name="quantity"
                            isCurrency={true}
                            allowDecimal={false}
                            value={values.quantity}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    quantity: event.target.value,
                                }))
                            }
                            onBlur={onRecalculateTotal}
                            maxLength={8}
                            className="h-[40px] w-full rounded-[4px] border-ui-border"
                            inputClassName="text-right text-xs sm:text-sm text-brand-dark px-2.5"
                        />
                    </div>
                    <div className="col-span-3 min-w-0">
                        <BackendLookupField
                            resource="units"
                            values={values.unitLookup}
                            placeholder="Pilih satuan..."
                            searchLabel="Cari satuan"
                            getOptionLabel={(option) => (typeof option === 'string' ? option : (option?.name ?? option?.label ?? ''))}
                            onSelect={(option) => {
                                setValues((current) => ({
                                    ...current,
                                    unitLookup: [option.name],
                                    unit: option.name,
                                    __unitId: option.id,
                                }));
                            }}
                            onRemove={() => {
                                setValues((current) => ({
                                    ...current,
                                    unitLookup: [],
                                    unit: '',
                                    __unitId: null,
                                }));
                            }}
                        />
                    </div>
                </div>
            </ModalFieldRow>

            {isAddition ? (
                <>
                    <ModalFieldRow label="Biaya Satuan">
                        <FormattedAmountInput
                            value={values.unitCost}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    unitCost: event.target.value,
                                }))
                            }
                            onBlur={onRecalculateTotal}
                            prefix="Rp"
                            maxLength={18}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            prefixClassName="min-w-[40px] justify-center bg-input-prefix-bg-compact px-0 text-text-inactive text-xs"
                            inputClassName="text-right text-xs sm:text-sm text-brand-dark"
                            containerClassName="max-w-[220px]"
                        />
                    </ModalFieldRow>

                    <ModalFieldRow label="Total Biaya">
                        <TextInput
                            value={values.totalCost}
                            readOnly
                            className="h-[40px] rounded-[4px] border-ui-border bg-bg-workspace-input-panel"
                            inputClassName="text-right text-xs sm:text-sm font-medium text-tab-view-active-text"
                            containerClassName="max-w-[220px]"
                        />
                    </ModalFieldRow>
                </>
            ) : null}

            <ModalFieldRow label="Gudang" required>
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-[180px] sm:w-[200px] shrink-0">
                        <BackendLookupField
                            resource="warehouses"
                            values={values.warehouse}
                            placeholder="Pilih Gudang..."
                            searchLabel="Cari gudang"
                            getOptionLabel={(option) => (typeof option === 'string' ? option : (option?.name ?? option?.label ?? ''))}
                            onSelect={(option) => {
                                setValues((current) => ({
                                    ...current,
                                    warehouse: [option.name],
                                    __warehouseId: option.id,
                                }));
                            }}
                            onRemove={() => {
                                setValues((current) => ({
                                    ...current,
                                    warehouse: [],
                                    __warehouseId: null,
                                }));
                            }}
                            error={errors.warehouse}
                        />
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 min-w-[75px] shrink-0 whitespace-nowrap">
                        <span className="text-slate-500">Stok:</span>
                        <span className="font-semibold text-brand-dark tabular-nums">
                            {formatAmountInput(currentWarehouseStock ?? 0)}
                        </span>
                    </div>
                </div>
            </ModalFieldRow>
        </div>
    );
}
