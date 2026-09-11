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
        <div className={`grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-x-4 ${alignTop ? 'sm:items-start' : 'sm:items-center'}`}>
            <TransactionFieldLabel label={label} required={required} className={`text-xs sm:text-sm font-normal text-table-row-text ${alignTop ? 'pt-1.5 sm:pt-1' : ''}`} />
            <div className="min-w-0">{children}</div>
        </div>
    );
}

export default function InventoryAdjustmentDetailTab({
    values,
    setValues,
    onRecalculateTotal,
    modal,
    errors = {},
    isExisting = false,
}) {
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
    const adjustmentOptions = modal?.adjustmentTypeOptions ?? ['Penambahan', 'Pengurangan', 'Atur Stok'];

    return (
        <div className="space-y-2.5">
            <div className="grid gap-1 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-x-4 sm:items-center">
                <TransactionFieldLabel label="Kode #" className="text-xs sm:text-sm font-normal text-table-row-text" />
                <div className="flex h-[26px] items-center text-xs sm:text-sm font-semibold text-blue-600">{values.code || '—'}</div>
            </div>

            <ModalFieldRow label="Nama Barang" required>
                <TextInput
                    value={values.name}
                    readOnly
                    error={errors.name}
                    className="h-[36px] sm:h-[38px] w-full rounded-[4px] border-ui-border bg-slate-50"
                    inputClassName="text-xs sm:text-sm !text-table-row-text cursor-default font-normal"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Tipe Penyesuaian" alignTop={!isExisting}>
                {isExisting ? (
                    <div className="grid grid-cols-5 gap-2.5">
                        <div className="col-span-3 min-w-0">
                            <TextInput
                                value={values.adjustmentType}
                                readOnly
                                className="h-[36px] sm:h-[38px] w-full rounded-[4px] border-ui-border bg-slate-50"
                                inputClassName="text-xs sm:text-sm !text-table-row-text cursor-default font-normal"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-2.5">
                        <div className="col-span-3 flex flex-col gap-2 pt-0.5">
                            {adjustmentOptions.map((option) => (
                                <RadioField
                                    key={option}
                                    id={`adjustment-type-${option.toLowerCase().replace(/\s+/g, '-')}`}
                                    name="adjustmentType"
                                    label={option}
                                    containerClassName="w-auto"
                                    labelClassName="!text-table-row-text font-normal"
                                    checked={values.adjustmentType === option}
                                    onChange={() =>
                                        setValues((current) => ({
                                            ...current,
                                            adjustmentType: option,
                                            unitCost: option === 'Penambahan' ? current.unitCost : '0',
                                            totalCost: option === 'Penambahan' ? current.totalCost : '0',
                                        }))
                                    }
                                />
                            ))}
                        </div>
                    </div>
                )}
            </ModalFieldRow>

            <ModalFieldRow label="Kuantitas" required>
                <div className="grid grid-cols-5 gap-2.5 items-center">
                    <div className="col-span-3 min-w-0">
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
                            className="h-[36px] sm:h-[38px] w-full rounded-[4px] border-ui-border"
                            inputClassName="text-right text-xs sm:text-sm text-table-row-text px-2.5"
                        />
                    </div>
                    <div className="col-span-2 min-w-0">
                        <BackendLookupField
                            resource="units"
                            value={Array.isArray(values.unitLookup) ? (values.unitLookup[0] || '') : (values.unitLookup || '')}
                            placeholder="Satuan..."
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
                            onClear={() => {
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
                        <div className="grid grid-cols-5 gap-2.5">
                            <div className="col-span-3 min-w-0">
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
                                    className="h-[36px] sm:h-[38px] w-full rounded-[4px] border-ui-border"
                                    prefixClassName="min-w-[36px] justify-center bg-input-prefix-bg-compact px-0 !text-table-row-text text-xs"
                                    inputClassName="text-right text-xs sm:text-sm text-table-row-text"
                                />
                            </div>
                        </div>
                    </ModalFieldRow>

                    <ModalFieldRow label="Total Biaya">
                        <div className="grid grid-cols-5 gap-2.5">
                            <div className="col-span-3 min-w-0">
                                <TextInput
                                    value={values.totalCost}
                                    readOnly
                                    className="h-[36px] sm:h-[38px] w-full rounded-[4px] border-ui-border bg-bg-workspace-input-panel"
                                    inputClassName="text-right text-xs sm:text-sm font-medium !text-table-row-text"
                                />
                            </div>
                        </div>
                    </ModalFieldRow>
                </>
            ) : null}

            <ModalFieldRow label="Gudang" required>
                <div className="grid grid-cols-5 gap-2.5 items-center">
                    <div className="col-span-3 min-w-0">
                        <BackendLookupField
                            resource="warehouses"
                            value={Array.isArray(values.warehouse) ? (values.warehouse[0] || '') : (values.warehouse || '')}
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
                            onClear={() => {
                                setValues((current) => ({
                                    ...current,
                                    warehouse: [],
                                    __warehouseId: null,
                                }));
                            }}
                            error={errors.warehouse}
                        />
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 text-xs sm:text-sm font-medium text-table-row-text min-w-0 truncate pl-0.5">
                        <span className="text-table-row-text font-normal shrink-0">Stok:</span>
                        <span className="font-semibold text-table-row-text tabular-nums truncate">
                            {formatAmountInput(currentWarehouseStock ?? 0)}
                        </span>
                    </div>
                </div>
            </ModalFieldRow>
        </div>
    );
}
