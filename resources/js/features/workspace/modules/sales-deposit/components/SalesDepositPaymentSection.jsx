import { useEffect, useMemo, useState } from 'react';
import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function SalesDepositPaymentSection({
    config,
    values,
    setValues,
    isDetail = false,
}) {
    const { items: taxRecords = [] } = useBackendIndexResource('taxes', { per_page: 50 });
    const [localDepositAmount, setLocalDepositAmount] = useState(values.depositAmount ?? '0');

    useEffect(() => {
        setLocalDepositAmount(values.depositAmount ?? '0');
    }, [values.depositAmount]);

    const handleDepositBlur = (eventOrVal) => {
        const rawVal = typeof eventOrVal === 'object' && eventOrVal !== null
            ? (eventOrVal.target ? eventOrVal.target.value : (eventOrVal.value ?? ''))
            : (eventOrVal ?? localDepositAmount);
        const formatted = formatAmountInput(rawVal || '0', { allowDecimal: true, isInput: false });
        setLocalDepositAmount(formatted);
        setValues((current) => ({ ...current, depositAmount: formatted }));
    };

    const ppnOptions = useMemo(() => {
        const fromApi = taxRecords.filter((t) => t.code?.startsWith('PPN') || t.name?.toUpperCase().startsWith('PPN'));
        const defaults = [
            { id: 10, code: 'PPN-10', name: 'PPN 10%', rate: 10 },
            { id: 1, code: 'PPN-11', name: 'PPN 11%', rate: 11 },
            { id: 2, code: 'PPN-12', name: 'PPN 12%', rate: 12 },
        ];
        if (fromApi.length > 0) {
            const existingCodes = new Set(fromApi.map((t) => t.code));
            const missing = defaults.filter((d) => !existingCodes.has(d.code));
            return [...fromApi, ...missing];
        }
        return defaults;
    }, [taxRecords]);

    const pphOptions = useMemo(() => {
        const fromApi = taxRecords.filter((t) => t.code?.startsWith('PPH') || t.name?.toUpperCase().startsWith('PPH'));
        const defaults = [
            { id: 4, code: 'PPH-23', name: 'PPh 23 (2%)', rate: 2 },
            { id: 5, code: 'PPH-23-4', name: 'PPh 23 (4%)', rate: 4 },
            { id: 3, code: 'PPH-21', name: 'PPh 21 (5%)', rate: 5 },
        ];
        if (fromApi.length > 0) {
            const existingCodes = new Set(fromApi.map((t) => t.code));
            const missing = defaults.filter((d) => !existingCodes.has(d.code));
            return [...fromApi, ...missing];
        }
        return defaults;
    }, [taxRecords]);

    return (
        <div className={`w-full ${values.taxEnabled ? 'flex flex-col lg:flex-row gap-x-8 items-start' : 'max-w-[540px]'}`}>
            {/* Left Column: Uang Muka */}
            <section className={values.taxEnabled ? 'flex-1 w-full lg:max-w-[50%]' : 'w-full'}>
                <TransactionSectionHeading title={config.depositTitle} icon="payment" />
                <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                    {values.__customerId && (
                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                            <TransactionFieldLabel label="No. SO" />
                            <div className="max-w-[320px] w-full">
                                <AccountLookupTextInput
                                    id="salesOrder"
                                    resource="sales-orders"
                                    value={values.salesOrderNumber || ''}
                                    placeholder="Cari/Pilih Pesanan..."
                                    searchLabel="Cari Pesanan Penjualan"
                                    queryParams={{ customer_id: values.__customerId }}
                                    onSelectAccount={(record, label) => {
                                        setValues((current) => ({
                                            ...current,
                                            __salesOrderId: record ? record.id : null,
                                            salesOrderNumber: label || '',
                                        }));
                                    }}
                                    disabled={!values.__customerId}
                                    className="h-[34px] rounded-[4px] border-ui-border bg-slate-50"
                                    inputClassName="text-xs sm:text-sm text-brand-dark bg-transparent"
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.depositAmount} required />
                        <div className="max-w-[320px] w-full">
                            <FormattedAmountInput
                                value={localDepositAmount}
                                onChange={(eventOrVal) => {
                                    const nextVal = typeof eventOrVal === 'object' && eventOrVal !== null
                                        ? (eventOrVal.target ? eventOrVal.target.value : (eventOrVal.value ?? ''))
                                        : eventOrVal;
                                    setLocalDepositAmount(nextVal);
                                }}
                                onBlur={handleDepositBlur}
                                prefix="Rp"
                                prefixClassName="min-w-[32px] bg-input-prefix-bg px-3 text-xs sm:text-sm text-table-row-text"
                                placeholder="0"
                                className="h-[40px] rounded-[4px] border-[#BBBBBB] bg-slate-50"
                                inputClassName="text-right text-xs sm:text-sm text-brand-dark"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.purchaseOrderNumber} />
                        <div className="max-w-[320px] w-full">
                            <TextInput
                                id="purchaseOrderNumber"
                                name="purchaseOrderNumber"
                                value={values.purchaseOrderNumber}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        purchaseOrderNumber: event.target.value,
                                    }))
                                }
                                className="h-[34px] rounded-[4px] border-ui-border bg-slate-50"
                                inputClassName="text-xs sm:text-sm text-brand-dark bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-start gap-x-4">
                        <TransactionFieldLabel label={config.labels.tax} className="pt-2" />
                        <div className="flex flex-col gap-y-2.5">
                            <div className="flex flex-nowrap items-center gap-x-3.5 sm:gap-x-4 text-xs sm:text-sm text-brand-dark pt-1.5 whitespace-nowrap">
                                <CheckboxField
                                    label="Kena Pajak"
                                    checked={values.taxEnabled}
                                    onChange={(event) => {
                                        const checked = event.target.checked;
                                        const defaultTax = ppnOptions[0] || { id: 1, name: 'PPN 11%', rate: 11 };
                                        setValues((current) => ({
                                            ...current,
                                            taxEnabled: checked,
                                            ...(!checked
                                                ? { taxIncluded: false, __taxId: null, taxName: '', taxRate: 0, dppPercent: 100, dppFactor: 1.0, __pphId: null, pphName: '', pphRate: 0, pphAmount: 0, pphAmountFormatted: 'Rp 0' }
                                                : {
                                                    __taxId: current.__taxId || defaultTax.id,
                                                    taxName: current.taxName || defaultTax.name,
                                                    taxRate: current.taxRate || defaultTax.rate,
                                                    dppPercent: current.dppPercent || 100,
                                                    dppFactor: current.dppFactor || 1.0,
                                                    taxTransactionType: current.taxTransactionType || 'Faktur Pajak',
                                                }),
                                        }));
                                    }}
                                    align="center"
                                    inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                    containerClassName="w-auto inline-flex shrink-0"
                                    labelClassName="whitespace-nowrap"
                                />
                                <CheckboxField
                                    label="Total termasuk Pajak"
                                    checked={values.taxIncluded}
                                    onChange={(event) => {
                                        const checked = event.target.checked;
                                        const defaultTax = ppnOptions[0] || { id: 1, name: 'PPN 11%', rate: 11 };
                                        setValues((current) => ({
                                            ...current,
                                            taxIncluded: checked,
                                            ...(checked && !current.taxEnabled
                                                ? {
                                                    taxEnabled: true,
                                                    __taxId: current.__taxId || defaultTax.id,
                                                    taxName: current.taxName || defaultTax.name,
                                                    taxRate: current.taxRate || defaultTax.rate,
                                                    dppPercent: current.dppPercent || 100,
                                                    dppFactor: current.dppFactor || 1.0,
                                                    taxTransactionType: current.taxTransactionType || 'Faktur Pajak',
                                                }
                                                : {}),
                                        }));
                                    }}
                                    align="center"
                                    inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                    containerClassName="w-auto inline-flex shrink-0"
                                    labelClassName="whitespace-nowrap"
                                />
                            </div>

                            {values.taxEnabled && (
                                <>
                                    <div className="flex items-center gap-x-3 max-w-[320px] w-full pt-1">
                                        <TransactionFieldLabel label="PPN" required className="w-10 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <SelectField
                                                id="tax"
                                                value={values.__taxId || ppnOptions[0]?.id || ''}
                                                onChange={(event) => {
                                                    const selectedId = Number(event.target.value);
                                                    const tax = ppnOptions.find((t) => Number(t.id) === selectedId) || ppnOptions[0];
                                                    setValues((current) => ({
                                                        ...current,
                                                        __taxId: tax ? tax.id : null,
                                                        taxName: tax ? tax.name : '',
                                                        taxRate: tax ? parseFloat(tax.rate) : 0,
                                                    }));
                                                }}
                                                className="h-[40px] rounded-[4px] border-[#BBBBBB] bg-slate-50 w-full"
                                                selectClassName="text-xs sm:text-sm text-brand-dark"
                                            >
                                                {ppnOptions.map((opt) => (
                                                    <option key={opt.id} value={opt.id}>
                                                        {opt.name?.includes('%') ? opt.name : `${opt.name} (${opt.rate}%)`}
                                                    </option>
                                                ))}
                                            </SelectField>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-x-3 max-w-[320px] w-full pt-0.5">
                                        <TransactionFieldLabel label="PPh" className="w-10 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <SelectField
                                                id="pph"
                                                value={values.__pphId || ''}
                                                onChange={(event) => {
                                                    const val = event.target.value;
                                                    if (!val) {
                                                        setValues((current) => ({
                                                            ...current,
                                                            __pphId: null,
                                                            pphCode: '',
                                                            pphName: '',
                                                            pphRate: 0,
                                                            pphAmount: 0,
                                                            pphAmountFormatted: 'Rp 0',
                                                        }));
                                                    } else {
                                                        const selectedId = Number(val);
                                                        const pph = pphOptions.find((t) => Number(t.id) === selectedId);
                                                        setValues((current) => ({
                                                            ...current,
                                                            __pphId: pph ? pph.id : null,
                                                            pphCode: pph?.code ?? '',
                                                            pphName: pph ? pph.name : '',
                                                            pphRate: pph ? parseFloat(pph.rate) : 0,
                                                        }));
                                                    }
                                                }}
                                                className="h-[40px] rounded-[4px] border-[#BBBBBB] bg-slate-50 w-full"
                                                selectClassName="text-xs sm:text-sm text-brand-dark"
                                            >
                                                <option value="">Tanpa PPh</option>
                                                {pphOptions.map((opt) => (
                                                    <option key={opt.id} value={opt.id}>
                                                        {opt.name?.includes('%') ? opt.name : `${opt.name} (${opt.rate}%)`}
                                                    </option>
                                                ))}
                                            </SelectField>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Right Column: Info Pajak */}
            {values.taxEnabled && (
                <section className="flex-1 w-full lg:max-w-[50%] mt-8 lg:mt-0">
                    <TransactionSectionHeading title="Info Pajak" icon="tax" />
                    <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                            <TransactionFieldLabel label="Tgl Faktur Pajak" required />
                            <div className="max-w-[160px] w-full">
                                <TransactionDateInput
                                    value={values.taxInvoiceDate}
                                    onChange={(nextValue) => setValues((current) => ({ ...current, taxInvoiceDate: nextValue }))}
                                    className="bg-slate-50"
                                    inputClassName="bg-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                            <TransactionFieldLabel label="Tipe Transaksi" required />
                            <div className="max-w-[320px] w-full">
                                <SelectField
                                    value={values.taxTransactionType}
                                    onChange={(event) => setValues((current) => ({ ...current, taxTransactionType: event.target.value }))}
                                    className="h-[40px] rounded-[4px] border-ui-border w-full bg-slate-50"
                                    selectClassName="text-xs sm:text-sm text-brand-dark"
                                >
                                    <option value="Faktur Pajak">Faktur Pajak</option>
                                    <option value="Digunggung">Digunggung</option>
                                </SelectField>
                            </div>
                        </div>

                        {values.taxTransactionType === 'Faktur Pajak' && (
                            <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                <TransactionFieldLabel label="No. Faktur Pajak" />
                                <div className="max-w-[320px] w-full">
                                    <TextInput
                                        id="taxInvoiceNumber"
                                        name="taxInvoiceNumber"
                                        value={values.taxInvoiceNumber}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                taxInvoiceNumber: event.target.value,
                                            }))
                                        }
                                        maxLength={20}
                                        className="h-[34px] rounded-[4px] border-ui-border bg-slate-50"
                                        inputClassName="text-slate-700 text-sm bg-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
