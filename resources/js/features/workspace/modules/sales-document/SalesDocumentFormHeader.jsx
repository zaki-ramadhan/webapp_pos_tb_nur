import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    SalesDocumentHeaderButtons,
} from '@/features/workspace/modules/sales-document/salesDocumentViewShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { applyComputedTotals } from '@/features/workspace/modules/sales-document/salesDocumentFormShared';
import { showSuccessToast } from '@/components/feedback/toast';
import { formatCurrencyValue } from '@/features/workspace/shared/amountFormatting';

export default function SalesDocumentFormHeader({
    pageId,
    config,
    values,
    setValues,
    isDetail,
    backendConfig,
    handlers,
}) {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            {/* Left Column */}
            <div className={`flex flex-col gap-y-2 w-full ${config.headerSelectLookupField ? 'md:max-w-[960px] lg:max-w-[1120px] xl:max-w-[1280px] 2xl:max-w-full' : 'md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]'}`}>
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.customer} required />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupTextInput
                            id="customer"
                            resource={backendConfig?.partnerResource ?? 'customers'}
                            value={Array.isArray(values.customer) ? (values.customer[0] ?? '') : String(values.customer ?? '')}
                            placeholder={config.customerPlaceholder ?? 'Cari/Pilih Pelanggan...'}
                            searchLabel={config.customerSearchLabel ?? 'Cari pelanggan'}
                            onSelectAccount={(record, label) => {
                                setValues((current) => ({
                                    ...current,
                                    __partnerId: record ? record.id : null,
                                    customer: label ? [label] : [],
                                    address: record ? (record.shipping_address ?? record.billing_address ?? current.address) : '',
                                }));
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required />
                    <TransactionDateInput
                        value={values.entryDate}
                        onChange={(nextDisplayValue) =>
                            setValues((current) => ({
                                ...current,
                                entryDate: nextDisplayValue,
                            }))
                        }
                    />
                </div>

                {config.headerSelectLookupField ? (() => {
                    const isPurchase = String(pageId).toLowerCase().includes('purchase');
                    const selectedSource = values[config.headerSelectLookupField.selectValueKey] ?? 'Faktur';
                    const isWithoutInvoice = selectedSource === 'Tanpa Faktur';
                    
                    const resolvedResource = selectedSource === 'Uang Muka'
                        ? (isPurchase ? 'purchase-deposits' : 'sales-deposits')
                        : (isPurchase ? 'purchase-invoices' : 'sales-invoices');
                    
                    const resolvedPlaceholder = isWithoutInvoice
                        ? 'Tidak memerlukan dokumen...'
                        : selectedSource === 'Uang Muka'
                            ? (isPurchase ? 'Cari/Pilih Uang Muka Pembelian...' : 'Cari/Pilih Uang Muka Penjualan...')
                            : (config.headerSelectLookupField.placeholder ?? 'Cari/Pilih Faktur...');
                    
                    const resolvedSearchLabel = selectedSource === 'Uang Muka'
                        ? (isPurchase ? 'Cari uang muka pembelian' : 'Cari uang muka penjualan')
                        : (config.headerSelectLookupField.searchLabel ?? 'Cari faktur');

                    const showDropdown = (config.headerSelectLookupField.options ?? []).length > 1;

                    return (
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                            <TransactionFieldLabel label={config.headerSelectLookupField.label} required={config.headerSelectLookupField.required} />
                            <div className={showDropdown ? "w-full flex items-center gap-x-2" : "max-w-[320px] w-full"}>
                                {showDropdown && (
                                    <div className="w-auto min-w-[138px] shrink-0">
                                        <SelectField
                                            value={selectedSource}
                                            onChange={(event) => {
                                                const nextSource = event.target.value;
                                                setValues((current) => ({
                                                    ...current,
                                                    [config.headerSelectLookupField.selectValueKey]: nextSource,
                                                    __relatedDocumentId: null,
                                                    [config.headerSelectLookupField.valueKey]: [],
                                                }));
                                            }}
                                            className="h-[40px] rounded-[4px] border-ui-border w-full"
                                            selectClassName="text-xs sm:text-sm text-brand-dark"
                                        >
                                            {config.headerSelectLookupField.options.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </SelectField>
                                    </div>
                                )}
                                {!isWithoutInvoice && (
                                    <div className={showDropdown ? "flex-1 min-w-0 w-full" : "w-full"}>
                                        <AccountLookupTextInput
                                            id={config.headerSelectLookupField.valueKey}
                                            resource={resolvedResource}
                                            value={values[config.headerSelectLookupField.valueKey]?.[0] ?? ''}
                                            placeholder={resolvedPlaceholder}
                                            searchLabel={resolvedSearchLabel}
                                            queryParams={values.__partnerId ? { [isPurchase ? 'supplier_id' : 'customer_id']: values.__partnerId } : {}}
                                             onBeforeOpen={() => {
                                                if (!values.__partnerId) {
                                                    const partnerLabel = config.labels?.customer || 'Pelanggan';
                                                    const msg = `${partnerLabel} harus diisi.`;
                                                    showSystemErrorModal({
                                                        title: 'Terjadi Permasalahan pada Pemrosesan',
                                                        description: 'Silakan perbaiki permasalahan berikut ini:',
                                                        message: msg,
                                                        confirmLabel: 'OK',
                                                    });
                                                    window.dispatchEvent(
                                                        new CustomEvent('form-validation-error', {
                                                            detail: {
                                                                customer: msg,
                                                                __partnerId: msg,
                                                            },
                                                        })
                                                    );
                                                    return false;
                                                }
                                                return true;
                                            }}
                                            onSelectAccount={async (record, label) => {
                                                let populatedItems = [];
                                                if (record) {
                                                    try {
                                                        let doc = record;
                                                        if ((!doc.lines || doc.lines.length === 0) && (!doc.items || doc.items.length === 0) && record.id) {
                                                            const isPurchase = String(pageId || '').toLowerCase().includes('purchase');
                                                            const resourceName = isPurchase ? 'purchase-invoices' : 'sales-invoices';
                                                            const fetched = await getBackendResource(resourceName, record.id);
                                                            if (fetched) {
                                                                doc = fetched;
                                                            }
                                                        }
                                                        const rawLines = doc?.lines ?? doc?.items ?? doc?.details ?? doc?.attributes?.items ?? [];
                                                        if (Array.isArray(rawLines) && rawLines.length > 0) {
                                                            populatedItems = rawLines.map((line, idx) => {
                                                                const qty = parseFloat(line.quantity ?? line.qty ?? 1) || 1;
                                                                const price = parseFloat(String(line.unit_price ?? line.price ?? 0).replace(/[^\d.-]/g, '')) || 0;
                                                                const discount = parseFloat(String(line.discount_amount ?? line.discount ?? 0).replace(/[^\d.-]/g, '')) || 0;
                                                                const total = Math.max(0, qty * price - discount);
                                                                const prodName = line.description ?? line.product?.name ?? line.name ?? line.item_name ?? line.product_name ?? 'Barang';
                                                                const prodCode = line.reference_code ?? line.product?.code ?? line.code ?? line.item_code ?? line.product_code ?? '';
                                                                const unitName = typeof line.unit === 'object' ? (line.unit?.name ?? line.unit?.code ?? '') : (line.unit ?? line.unit_name ?? line.product?.base_unit?.name ?? '');
                                                                const prodId = line.product_id ?? line.productId ?? line.product?.id ?? null;

                                                                return {
                                                                    id: `return-item-${Date.now()}-${idx}-${Math.random()}`,
                                                                    name: prodName,
                                                                    item: prodName,
                                                                    code: prodCode,
                                                                    itemCode: prodCode,
                                                                    quantity: qty,
                                                                    unit: unitName,
                                                                    price: formatCurrencyValue(price),
                                                                    discount: formatCurrencyValue(discount),
                                                                    discountValue: formatCurrencyValue(discount),
                                                                    total: formatCurrencyValue(total),
                                                                    productId: prodId,
                                                                    __productId: prodId ? Number(prodId) : null,
                                                                    __unitId: line.unit_id ?? null,
                                                                };
                                                            });
                                                        }
                                                    } catch (err) {
                                                        console.error('Failed to load related invoice items:', err);
                                                    }
                                                }

                                                setValues((current) => {
                                                    const nextState = {
                                                        ...current,
                                                        __relatedDocumentId: record ? record.id : null,
                                                        __relatedDocumentRecord: record,
                                                        [config.headerSelectLookupField.valueKey]: label ? [label] : [],
                                                    };
                                                    if (populatedItems.length > 0) {
                                                        return applyComputedTotals(nextState, populatedItems);
                                                    }
                                                    return nextState;
                                                });

                                                if (populatedItems.length > 0) {
                                                    showSuccessToast({ message: `${populatedItems.length} barang dari faktur [${label}] berhasil dimuat.` });
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })() : null}

                {config.headerTextField ? (
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.headerTextField.label} required={config.headerTextField.required} />
                        <div className="max-w-[320px] w-full">
                            <TextInput
                                value={values[config.headerTextField.valueKey] ?? ''}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        [config.headerTextField.valueKey]: event.target.value,
                                    }))
                                }
                                trailing={
                                    values[config.headerTextField.valueKey] ? (
                                        <button
                                            type="button"
                                            className="text-lg font-semibold text-brand-dark"
                                            onClick={() =>
                                                setValues((current) => ({
                                                    ...current,
                                                    [config.headerTextField.valueKey]: '',
                                                }))
                                            }
                                        >
                                            ×
                                        </button>
                                    ) : null
                                }
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                trailingClassName="px-3"
                            />
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px] md:pl-12 lg:pl-16 xl:pl-20 2xl:pl-28">
                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required />
                    </div>

                    <div className="max-w-[282px] w-full justify-self-end">
                        {!isDetail && values.autoNumber ? (
                            <SelectField
                                value={values.numberingType}
                                onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                                className="h-[40px] rounded-[4px] border-ui-border w-full"
                                selectClassName="text-xs sm:text-sm text-brand-dark"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        ) : (
                            <TextInput
                                value={values.documentNumber}
                                onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value, autoNumber: false }))}
                                onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                maxLength={120}
                                readOnly={isDetail}
                                trailing={isDetail ? null : <span className="text-lg font-semibold text-brand-dark">×</span>}
                                className="h-[40px] rounded-[4px] border-ui-border w-full"
                                inputClassName="text-xs sm:text-sm text-brand-dark font-normal"
                                trailingClassName="px-3"
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div />
                    <div className="flex justify-end relative justify-self-end">
                        <SalesDocumentHeaderButtons config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} pageId={pageId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
