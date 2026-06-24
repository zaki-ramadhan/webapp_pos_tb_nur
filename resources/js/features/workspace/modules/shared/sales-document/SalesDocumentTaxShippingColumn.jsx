import TextInput from '@/components/ui/TextInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { TransactionDateInput, TransactionFieldLabel, TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CheckboxField from '@/components/ui/CheckboxField';

function SalesDocumentInvoiceTaxSection({ values }) {
    return (
        <div>
            <TransactionSectionHeading title="Info Pajak" icon="tax" />
            <div className="mt-4 rounded-[6px] border border-[#d6dce8] bg-white p-4">
                <div className="grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label="Pajak" />
                    <div className="flex flex-wrap gap-8 text-xs sm:text-sm text-[#1f2436]">
                        <CheckboxField
                            id="taxEnabled"
                            label="Kena Pajak"
                            checked={values.taxEnabled}
                            onChange={(event) => values.setValues?.((current) => ({ ...current, taxEnabled: event.target.checked }))}
                            align="center"
                            inputClassName="h-3.5 w-3.5 rounded-[3px]"
                            containerClassName="w-auto inline-flex"
                        />
                        <CheckboxField
                            id="taxIncluded"
                            label="Total termasuk Pajak"
                            checked={values.taxIncluded}
                            onChange={(event) => values.setValues?.((current) => ({ ...current, taxIncluded: event.target.checked }))}
                            align="center"
                            inputClassName="h-3.5 w-3.5 rounded-[3px]"
                            containerClassName="w-auto inline-flex"
                        />
                    </div>
                    <TransactionFieldLabel label="Tipe ID" />
                    <TextInput value={values.taxIdType ?? ''} readOnly className="h-[34px] max-w-[272px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                    <TransactionFieldLabel label="Negara" />
                    <TextInput value={values.taxCountryName ?? ''} readOnly className="h-[34px] max-w-[272px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                    <TransactionFieldLabel label="ID Pajak" />
                    <TextInput value={values.taxNumber ?? ''} readOnly className="h-[34px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                    <TransactionFieldLabel label="Nama Pajak" />
                    <TextInput value={values.taxName ?? ''} readOnly className="h-[34px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                    <TransactionFieldLabel label="ID TKU" />
                    <TextInput value={values.taxIdTku ?? ''} readOnly className="h-[34px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                    <TransactionFieldLabel label="No. Faktur Pajak" />
                    <TextInput value={values.taxInvoiceNumber ?? ''} readOnly trailing={<span className="text-lg font-semibold text-[#1f2436]">×</span>} className="h-[34px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" trailingClassName="px-3" />
                </div>
            </div>
            <div className="mt-7">
                <TransactionSectionHeading title="Info Pengiriman" icon="truck" />
                <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label="Tgl Pengiriman" />
                    <TransactionDateInput value={values.shippingDate} onChange={(nextDisplayValue) => values.setValues?.((current) => ({ ...current, shippingDate: nextDisplayValue }))} className="max-w-[272px]" />
                </div>
            </div>
            <div className="mt-7">
                <TransactionSectionHeading title="Info Tambahan" icon="payment" />
            </div>
        </div>
    );
}

export default function SalesDocumentTaxShippingColumn({ config, values, setValues, handlers }) {
    return (
        <section>
            {config.taxInfoMode === 'invoice' ? <SalesDocumentInvoiceTaxSection values={{ ...values, setValues, handlers }} /> : null}
            {config.showTaxInfo !== false && config.taxInfoMode !== 'invoice' ? (
                <>
                    <TransactionSectionHeading title={config.taxInfoTitle} icon="tax" />
                    <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.tax} />
                        <div className="flex flex-wrap gap-8 text-xs sm:text-sm text-[#1f2436]">
                            <label className="inline-flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={values.taxEnabled} onChange={(event) => setValues?.((current) => ({ ...current, taxEnabled: event.target.checked }))} className="h-3.5 w-3.5 rounded-[3px] border border-slate-400 text-input-brand focus:ring-2 focus:ring-input-focus/30" />
                                <span>Kena Pajak</span>
                            </label>
                            <label className="inline-flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={values.taxIncluded} onChange={(event) => setValues?.((current) => ({ ...current, taxIncluded: event.target.checked }))} className="h-3.5 w-3.5 rounded-[3px] border border-slate-400 text-input-brand focus:ring-2 focus:ring-input-focus/30" />
                                <span>Total termasuk Pajak</span>
                            </label>
                        </div>
                    </div>
                </>
            ) : null}
            {config.showShippingInfo !== false && config.taxInfoMode !== 'invoice' ? (
                <div className={config.showTaxInfo === false ? '' : 'mt-7'}>
                    <TransactionSectionHeading title={config.shippingInfoTitle} icon="truck" />
                    <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.shippingDate} />
                        <TransactionDateInput value={values.shippingDate} onChange={(nextDisplayValue) => setValues?.((current) => ({ ...current, shippingDate: nextDisplayValue }))} className="max-w-[272px]" />
                    </div>
                </div>
            ) : null}
        </section>
    );
}
