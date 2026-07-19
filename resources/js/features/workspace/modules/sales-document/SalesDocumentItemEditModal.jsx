import { useState, useEffect, useCallback } from 'react';
import { showErrorToast } from '@/components/feedback/toast';
import { listBackendResource, extractBackendRows } from '@/features/workspace/backend/workspaceBackendApi';

import DocumentModalLayout, { DocumentModalFooter } from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import { DocumentModalCurrencyField } from '@/features/workspace/modules/shared/document-modal/DocumentModalFields';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TextInput from '@/components/ui/TextInput';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import TextareaField from '@/components/ui/TextareaField';
import { CalcIcon } from '@/features/workspace/shared/Icons';
import { parseNumericInput, formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';

const MODAL_TABS = [
    { id: 'details', label: 'Rincian Barang' },
    { id: 'info', label: 'Info lainnya' },
];

function computeFromPercent(qty, price, pct) {
    const qtyNum = parseNumericInput(qty);
    const priceNum = parseNumericInput(price);
    const subtotal = qtyNum * priceNum;
    const discVal = Math.max(0, subtotal * (parseNumericInput(pct) / 100));
    return formatCurrencyValue(discVal);
}

function computePercent(qty, price, discVal) {
    const qtyNum = parseNumericInput(qty);
    const priceNum = parseNumericInput(price);
    const subtotal = qtyNum * priceNum;
    if (subtotal === 0) return '0';
    const pct = (parseNumericInput(discVal) / subtotal) * 100;
    return formatCurrencyValue(pct);
}

function computeTotal(qty, price, discVal) {
    const qtyNum = parseNumericInput(qty);
    const priceNum = parseNumericInput(price);
    const discNum = parseNumericInput(discVal);
    const total = Math.max(0, qtyNum * priceNum - discNum);
    return `Rp ${formatCurrencyValue(total)}`;
}

const FIELD_H = 'h-[38px]';
const FIELD_ROUNDED = 'rounded-[4px]';
const FIELD_BORDER = 'border-ui-border';
const FIELD_INPUT_CLS = 'text-xs sm:text-sm text-brand-dark';
const FIELD_INPUT_RIGHT_CLS = 'text-right text-xs sm:text-sm text-brand-dark';

// ─── Tab: Rincian Barang ─────────────────────────────────────────────────────

function ItemDetailEditTab({ form, onChange, errors = {} }) {
    const { name, code, quantity, unit, price, discountPercent, discountValue, total } = form;

    const totalLabel = total ?? computeTotal(quantity, price, discountValue);

    function handleQtyChange(e) {
        const val = e.target.value;
        const numericStr = val.replace(/\./g, '').split(',')[0];
        if (numericStr.length > 7) {
            return;
        }
        onChange({ quantity: val });
    }

    function handleQtyBlur() {
        const discVal = computeFromPercent(form.quantity, form.price, form.discountPercent);
        const nextTotal = computeTotal(form.quantity, form.price, discVal);
        onChange({ discountValue: discVal, total: nextTotal });
    }

    function handlePriceChange(e) {
        onChange({ price: e.target.value });
    }

    function handlePriceBlur() {
        const discVal = computeFromPercent(form.quantity, form.price, form.discountPercent);
        const nextTotal = computeTotal(form.quantity, form.price, discVal);
        onChange({ discountValue: discVal, total: nextTotal });
    }

    function handleDiscountPercentChange(e) {
        const val = e.target.value;
        const cleanVal = val.replace(/[\.,]/g, '');
        if (cleanVal.length > 3) {
            return;
        }
        onChange({ discountPercent: val });
    }

    function handleDiscountPercentBlur() {
        const discVal = computeFromPercent(form.quantity, form.price, form.discountPercent);
        const nextTotal = computeTotal(form.quantity, form.price, discVal);
        onChange({ discountValue: discVal, total: nextTotal });
    }

    function handleDiscountValueChange(e) {
        onChange({ discountValue: e.target.value });
    }

    function handleDiscountValueBlur() {
        const pct = computePercent(form.quantity, form.price, form.discountValue);
        const nextTotal = computeTotal(form.quantity, form.price, form.discountValue);
        onChange({ discountPercent: pct, total: nextTotal });
    }

    return (
        <div className="grid gap-y-2.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-4 sm:items-center">
            {/* Kode # + Bisa dijual */}
            <TransactionFieldLabel label="Kode #" />
            <div className="flex items-center justify-between h-[34px]">
                <span className="text-xs sm:text-sm font-medium text-document-code">{code ?? ''}</span>
                 <span className="text-xs sm:text-sm text-text-darkest">
                    Bisa dijual : <span className={`font-medium ${parseFloat(form.canSell ?? 0) !== 0 ? 'text-green-700 font-semibold' : 'text-document-code'}`}>{form.canSell ?? 0}</span>
                </span>
            </div>

            {/* Nama Barang */}
            <TransactionFieldLabel label="Nama Barang" required />
            <TextInput
                value={name ?? ''}
                onChange={(e) => onChange({ name: e.target.value })}
                error={errors.name}
                className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER}`}
                inputClassName={FIELD_INPUT_CLS}
            />

            {/* Kuantitas */}
            <TransactionFieldLabel label="Kuantitas" required />
            <div className="grid grid-cols-2 gap-3">
                <FormattedAmountInput
                    value={quantity ?? ''}
                    onChange={handleQtyChange}
                    onBlur={handleQtyBlur}
                    allowDecimal
                    allowNegative={false}
                    trailing={<CalcIcon className="h-4 w-4 text-text-darkest" />}
                    error={errors.quantity}
                    className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER}`}
                    inputClassName={FIELD_INPUT_RIGHT_CLS}
                    trailingClassName="px-3"
                    containerClassName="w-full max-w-full"
                />
                <AccountLookupField
                    values={unit ? [unit] : []}
                    placeholder="Pilih Satuan..."
                    searchLabel="Cari satuan"
                    resource="units"
                    onSelectAccount={(record, label) => onChange({ unit: label, __unitId: record.id })}
                    onRemove={() => onChange({ unit: '', __unitId: null })}
                    error={errors.unit}
                    heightClassName={FIELD_H}
                />
            </div>

            {/* @Harga */}
            <TransactionFieldLabel label="@Harga" />
            <DocumentModalCurrencyField
                value={price}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                trailing={<CalcIcon className="h-4 w-4 text-text-darkest" />}
                trailingClassName="px-3"
            />

            {/* Diskon */}
            <TransactionFieldLabel label="Diskon" />
            <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-3">
                <FormattedAmountInput
                    value={discountPercent ?? ''}
                    onChange={handleDiscountPercentChange}
                    onBlur={handleDiscountPercentBlur}
                    allowDecimal
                    allowNegative={false}
                    prefix="%"
                    className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER}`}
                    prefixClassName="min-w-0 px-2 justify-center bg-input-prefix-bg-compact text-xs text-text-inactive"
                    inputClassName={FIELD_INPUT_RIGHT_CLS}
                    containerClassName="w-full max-w-full"
                />
                <DocumentModalCurrencyField
                    value={discountValue}
                    onChange={handleDiscountValueChange}
                    onBlur={handleDiscountValueBlur}
                    trailing={<CalcIcon className="h-4 w-4 text-text-darkest" />}
                    trailingClassName="px-3"
                />
            </div>

            {/* Total Harga */}
            <TransactionFieldLabel label="Total Harga" />
            <TextInput
                value={totalLabel}
                readOnly
                className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER} bg-bg-workspace-input-panel`}
                inputClassName="text-right text-xs sm:text-sm font-normal text-text-darkest"
            />

            {/* Gudang */}
            <TransactionFieldLabel label="Gudang" required />
            <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <AccountLookupField
                        values={form.warehouse ?? []}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari gudang"
                        resource="warehouses"
                        onRemove={() => onChange({ warehouse: [], __warehouseId: null })}
                        onSelectAccount={(rec) =>
                            onChange({ warehouse: [rec.name], __warehouseId: rec.id })
                        }
                        error={errors.warehouse}
                        heightClassName={FIELD_H}
                    />
                </div>
                 <span className="text-xs sm:text-sm text-text-darkest shrink-0">
                    Stok : <span className={`font-medium ${parseFloat(form.stock ?? 0) !== 0 ? 'text-green-700 font-semibold' : 'text-document-code'}`}>{form.stock ?? 0}</span>
                </span>
            </div>

            {/* Penjual */}
            <TransactionFieldLabel label="Penjual" />
            <AccountLookupField
                values={form.salesPerson ?? []}
                placeholder="Cari/Pilih..."
                searchLabel="Cari penjual"
                resource="employees"
                queryParams={{ is_salesperson: 1 }}
                onRemove={() => onChange({ salesPerson: [], __salesPersonId: null })}
                onSelectAccount={(rec) =>
                    onChange({ salesPerson: [rec.name], __salesPersonId: rec.id })
                }
                heightClassName={FIELD_H}
            />
        </div>
    );
}

// ─── Tab: Info lainnya ───────────────────────────────────────────────────────

function ItemInfoEditTab({ form, onChange }) {
    return (
        <div className="grid gap-y-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-4 sm:items-start">
            <TransactionFieldLabel label="Keterangan" />
            <TextareaField
                value={form.notes ?? ''}
                onChange={(e) => onChange({ notes: e.target.value })}
                rows={4}
                className="min-h-[92px]"
            />
        </div>
    );
}

// ─── Modal Entry ─────────────────────────────────────────────────────────────

function resolvePriceFromProduct(product) {
    const prices = product.prices ?? [];
    if (prices.length > 0) {
        const salesPrice = prices.find(
            (p) => p.price_type?.toLowerCase().includes('jual') || p.price_type?.toLowerCase().includes('sales')
        ) ?? prices[0];
        return {
            amount: Number(salesPrice.price ?? 0),
            unitName: salesPrice.unit?.name ?? product.sales_unit?.name ?? product.base_unit?.name ?? 'PCS',
            unitId: salesPrice.unit_id ?? product.sales_unit_id ?? product.base_unit_id ?? null,
        };
    }
    return {
        amount: Number(product.default_sale_price ?? 0),
        unitName: product.sales_unit?.name ?? product.base_unit?.name ?? 'PCS',
        unitId: product.sales_unit_id ?? product.base_unit_id ?? null,
    };
}

function buildInitialForm(product, existingItem) {
    if (existingItem) {
        const qtyNum = parseNumericInput(existingItem.quantity);
        const priceNum = parseNumericInput(existingItem.price);
        const discNum = parseNumericInput(existingItem.discountValue ?? existingItem.discount);
        const totalAmount = Math.max(0, qtyNum * priceNum - discNum);
        return {
            name: existingItem.name ?? '',
            code: existingItem.code ?? '',
            canSell: existingItem.canSell ?? 0,
            quantity: existingItem.quantity ?? '1',
            unit: existingItem.unit ?? 'PCS',
            __unitId: existingItem.__unitId ?? existingItem.unit_id ?? null,
            __productId: existingItem.__productId ?? existingItem.product_id ?? null,
            price: existingItem.price ?? '0',
            discountPercent: existingItem.discountPercent ?? '0',
            discountValue: existingItem.discountValue ?? existingItem.discount ?? '0',
            total: `Rp ${formatCurrencyValue(totalAmount)}`,
            warehouse: existingItem.warehouse ?? [],
            __warehouseId: existingItem.__warehouseId ?? null,
            salesPerson: existingItem.salesPerson ?? [],
            __salesPersonId: existingItem.__salesPersonId ?? null,
            stock: existingItem.stock ?? 0,
            notes: existingItem.notes ?? '',
        };
    }

    if (product) {
        const { amount: unitPriceAmount, unitName, unitId } = resolvePriceFromProduct(product);
        return {
            name: product.name ?? '',
            code: product.code ?? '',
            canSell: product.can_be_sold ?? 0,
            quantity: '1',
            unit: unitName,
            __unitId: unitId,
            __productId: product.id ?? null,
            price: formatCurrencyValue(unitPriceAmount),
            discountPercent: '0',
            discountValue: '0',
            total: `Rp ${formatCurrencyValue(unitPriceAmount)}`,
            warehouse: [],
            __warehouseId: null,
            salesPerson: [],
            __salesPersonId: null,
            stock: 0,
            notes: '',
        };
    }

    return {
        name: '',
        code: '',
        canSell: 0,
        quantity: '1',
        unit: 'PCS',
        __unitId: null,
        __productId: null,
        price: '0',
        discountPercent: '0',
        discountValue: '0',
        total: 'Rp 0',
        warehouse: [],
        __warehouseId: null,
        salesPerson: [],
        __salesPersonId: null,
        stock: 0,
        notes: '',
    };
}

export default function SalesDocumentItemEditModal({
    open,
    onClose,
    product = null,
    item = null,
    onSubmit,
    onDelete,
}) {
    const isEdit = Boolean(item);
    const [activeTabId, setActiveTabId] = useState('details');
    const [form, setForm] = useState(() => buildInitialForm(product, item));
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setForm(buildInitialForm(product, item));
            setActiveTabId('details');
            setErrors({});
        }
    }, [open, product, item]);

    useEffect(() => {
        const productId = form.__productId;
        const warehouseId = form.__warehouseId;

        if (!productId) {
            setForm((prev) => ({ ...prev, canSell: 0, stock: 0 }));
            return;
        }

        let active = true;

        async function fetchStock() {
            try {
                const queryParams = {
                    product_id: productId,
                };
                if (warehouseId) {
                    queryParams.warehouse_id = warehouseId;
                }

                const response = await listBackendResource('item-locations', queryParams);
                if (!active) return;

                const rows = extractBackendRows(response);

                if (warehouseId) {
                    const matched = rows.find(r => Number(r.warehouse_id) === Number(warehouseId));
                    const saleableStock = matched ? parseFloat(matched.saleable_stock || 0) : 0;
                    setForm((prev) => ({
                        ...prev,
                        canSell: saleableStock,
                        stock: saleableStock,
                    }));
                } else {
                    const totalSaleable = rows.reduce((sum, r) => sum + parseFloat(r.saleable_stock || 0), 0);
                    setForm((prev) => ({
                        ...prev,
                        canSell: totalSaleable,
                        stock: 0,
                    }));
                }
            } catch (err) {
                console.error('Error fetching stock:', err);
                if (active) {
                    setForm((prev) => ({ ...prev, canSell: 0, stock: 0 }));
                }
            }
        }

        fetchStock();

        return () => {
            active = false;
        };
    }, [form.__productId, form.__warehouseId]);

    const handleChange = useCallback((patch) => {
        setForm((prev) => ({ ...prev, ...patch }));
        setErrors((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(patch)) {
                delete next[key];
            }
            return next;
        });
    }, []);

    function handleSubmit() {
        const newErrors = {};
        if (!String(form.name ?? '').trim()) {
            newErrors.name = 'Nama barang harus diisi.';
        }
        const qtyNum = parseNumericInput(form.quantity);
        if (qtyNum <= 0) {
            newErrors.quantity = 'Kuantitas barang harus lebih besar dari 0.';
        }
        if (!String(form.unit ?? '').trim()) {
            newErrors.unit = 'Satuan barang harus diisi.';
        }
        if (!form.__warehouseId) {
            newErrors.warehouse = 'Gudang harus diisi.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setActiveTabId('details');
            const firstErrorMsg = Object.values(newErrors)[0];
            showErrorToast({ message: firstErrorMsg });
            return;
        }

        const priceNum = parseNumericInput(form.price);
        const discNum = parseNumericInput(form.discountValue);
        const totalAmount = Math.max(0, qtyNum * priceNum - discNum);

        const nextItem = {
            ...(item ?? {}),
            id: item?.id ?? `product-item-${Date.now()}-${Math.random()}`,
            __lineId: item?.__lineId ?? null,
            __productId: form.__productId ?? item?.__productId ?? product?.id ?? null,
            name: form.name,
            code: form.code,
            quantity: String(qtyNum || 0),
            unit: form.unit,
            __unitId: form.__unitId,
            price: form.price,
            discountPercent: form.discountPercent,
            discount: form.discountValue,
            discountValue: form.discountValue,
            total: formatCurrencyValue(totalAmount),
            warehouse: form.warehouse,
            __warehouseId: form.__warehouseId,
            salesPerson: form.salesPerson,
            __salesPersonId: form.__salesPersonId,
            stock: form.stock,
            notes: form.notes,
        };

        onSubmit?.(nextItem);
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
            title="Rincian Barang"
            tabs={MODAL_TABS}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup rincian barang"
            panelClassName="max-w-[540px] overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[362px] py-2"
            footer={
                <DocumentModalFooter
                    deleteLabel={isEdit ? 'Hapus' : 'Batal'}
                    submitLabel="Lanjut"
                    onDelete={isEdit ? handleDelete : onClose}
                    onSubmit={handleSubmit}
                />
            }
        >
            {activeTabId === 'info' ? (
                <ItemInfoEditTab form={form} onChange={handleChange} />
            ) : (
                <ItemDetailEditTab form={form} onChange={handleChange} errors={errors} />
            )}
        </DocumentModalLayout>
    );
}
