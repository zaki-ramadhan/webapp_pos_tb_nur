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
                            inputClassName="h-[20px] w-[20px] rounded"
                            containerClassName="w-auto inline-flex items-center"
                        />
                        <CheckboxField
                            id="taxIncluded"
                            label="Total termasuk Pajak"
                            checked={values.taxIncluded}
                            onChange={(event) => values.setValues?.((current) => ({ ...current, taxIncluded: event.target.checked }))}
                            inputClassName="h-[20px] w-[20px] rounded"
                            containerClassName="w-auto inline-flex items-center"
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
                    <TransactionFieldLabel label="Pengiriman" />
                    <ChipLookupField values={values.shippingMethod} placeholder="Cari/Pilih..." onRemove={(value) => values.setValues?.((current) => ({ ...current, shippingMethod: current.shippingMethod.filter((item) => item !== value), __shippingMethodId: current.shippingMethod.filter((item) => item !== value).length ? current.__shippingMethodId : null }))} onSearch={values.handlers?.onSelectShippingMethod} searchLabel="Cari pengiriman" heightClassName="h-[34px]" />
                    <TransactionFieldLabel label="FOB" />
                    <ChipLookupField values={values.fob} placeholder="Cari/Pilih..." onRemove={(value) => values.setValues?.((current) => ({ ...current, fob: current.fob.filter((item) => item !== value), __fobId: current.fob.filter((item) => item !== value).length ? current.__fobId : null }))} onSearch={values.handlers?.onSelectFob} searchLabel="Cari FOB" heightClassName="h-[34px]" />
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
                            <label className="inline-flex items-center gap-3">
                                <input type="checkbox" checked={values.taxEnabled} onChange={(event) => setValues?.((current) => ({ ...current, taxEnabled: event.target.checked }))} className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                                <span>Kena Pajak</span>
                            </label>
                            <label className="inline-flex items-center gap-3">
                                <input type="checkbox" checked={values.taxIncluded} onChange={(event) => setValues?.((current) => ({ ...current, taxIncluded: event.target.checked }))} className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
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
                        <TransactionFieldLabel label={config.labels.shippingMethod} />
                        <ChipLookupField values={values.shippingMethod} placeholder="Cari/Pilih..." onRemove={(value) => setValues?.((current) => ({ ...current, shippingMethod: current.shippingMethod.filter((item) => item !== value), __shippingMethodId: current.shippingMethod.filter((item) => item !== value).length ? current.__shippingMethodId : null }))} onSearch={handlers?.onSelectShippingMethod} searchLabel="Cari pengiriman" heightClassName="h-[34px]" />
                        {config.showFobInShippingInfo ? (
                            <>
                                <TransactionFieldLabel label={config.labels.fob} />
                                <ChipLookupField values={values.fob} placeholder="Cari/Pilih..." onRemove={(value) => setValues?.((current) => ({ ...current, fob: current.fob.filter((item) => item !== value), __fobId: current.fob.filter((item) => item !== value).length ? current.__fobId : null }))} onSearch={handlers?.onSelectFob} searchLabel="Cari FOB" heightClassName="h-[34px]" />
                            </>
                        ) : null}
                    </div>
                </div>
            ) : null}
            {config.showExtraInfo !== false && !config.showFobInShippingInfo && config.taxInfoMode !== 'invoice' ? (
                <div className={config.showTaxInfo === false && config.showShippingInfo === false ? '' : 'mt-7'}>
                    <TransactionSectionHeading title={config.extraInfoTitle} icon="payment" />
                    <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.fob} />
                        <ChipLookupField values={values.fob} placeholder="Cari/Pilih..." onRemove={(value) => setValues?.((current) => ({ ...current, fob: current.fob.filter((item) => item !== value), __fobId: current.fob.filter((item) => item !== value).length ? current.__fobId : null }))} onSearch={handlers?.onSelectFob} searchLabel="Cari FOB" heightClassName="h-[34px]" />
                    </div>
                </div>
            ) : null}
        </section>
    );
}
