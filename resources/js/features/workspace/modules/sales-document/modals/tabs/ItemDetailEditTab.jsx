import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { DocumentModalCurrencyField } from '@/features/workspace/modules/shared/document-modal/DocumentModalFields';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import TextInput from '@/components/ui/TextInput';
import { CalcIcon } from '@/features/workspace/shared/Icons';
import { parseNumericInput, formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';

const FIELD_H = 'h-[38px]';
const FIELD_ROUNDED = 'rounded-[4px]';
const FIELD_BORDER = 'border-ui-border';
const FIELD_INPUT_CLS = 'text-xs sm:text-sm text-brand-dark';
const FIELD_INPUT_RIGHT_CLS = 'text-right text-xs sm:text-sm text-brand-dark';

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

export function ItemDetailEditTab({ form, onChange, errors = {} }) {
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
        const sanitized = val.replace(/[^0-9.,]/g, '');
        onChange({ discountPercent: sanitized });
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
            {/* Kode # */}
            <TransactionFieldLabel label="Kode #" />
            <div className="flex items-center justify-between h-[34px]">
                <span className="text-xs sm:text-sm font-medium text-document-code">{code ?? ''}</span>
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
        </div>
    );
}
