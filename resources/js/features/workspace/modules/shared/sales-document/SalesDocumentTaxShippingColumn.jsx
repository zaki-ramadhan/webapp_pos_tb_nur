import TextInput from '@/components/ui/TextInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { TransactionDateInput, TransactionFieldLabel, TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CheckboxField from '@/components/ui/CheckboxField';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { applyComputedTotals } from '@/features/workspace/modules/sales-document/salesDocumentFormShared';

function SalesDocumentInvoiceTaxSection({ config, values, setValues }) {
    const activeSetValues = setValues || values.setValues;
    return (
        <div>
            <TransactionSectionHeading title="Info Pajak" icon="tax" />
            <div className="mt-4 pl-3 sm:pl-5">
                <div className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                    <TransactionFieldLabel label="Pajak" />
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-brand-dark whitespace-nowrap">
                        <CheckboxField
                            label="Kena Pajak"
                            checked={Boolean(values.taxEnabled)}
                            onChange={(event) => {
                                const checked = event.target.checked;
                                activeSetValues?.((current) => applyComputedTotals({ ...current, taxEnabled: checked }, current.items ?? []));
                            }}
                            align="center"
                            inputClassName="h-3.5 w-3.5 rounded-[3px]"
                            containerClassName="w-auto inline-flex"
                        />
                        <CheckboxField
                            label="Total termasuk Pajak"
                            checked={Boolean(values.taxIncluded)}
                            onChange={(event) => {
                                const checked = event.target.checked;
                                activeSetValues?.((current) => applyComputedTotals({ ...current, taxIncluded: checked }, current.items ?? []));
                            }}
                            align="center"
                            inputClassName="h-3.5 w-3.5 rounded-[3px]"
                            containerClassName="w-auto inline-flex"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-7">
                <TransactionSectionHeading title="Info Pengiriman" icon="truck" />
                <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                    <div className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label="Tgl Pengiriman" />
                        <TransactionDateInput
                            value={values.shippingDate}
                            onChange={(nextDisplayValue) => activeSetValues?.((current) => ({ ...current, shippingDate: nextDisplayValue }))}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SalesDocumentTaxShippingColumn({ config, values, setValues, handlers }) {
    return (
        <section className="pb-6">
            {config.taxInfoMode === 'invoice' ? <SalesDocumentInvoiceTaxSection config={config} values={values} setValues={setValues} /> : null}
            {config.showTaxInfo !== false && config.taxInfoMode !== 'invoice' ? (
                <>
                    <TransactionSectionHeading title={config.taxInfoTitle} icon="tax" />
                    <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                        <div className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.tax} />
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-brand-dark whitespace-nowrap">
                                <CheckboxField
                                    label="Kena Pajak"
                                    checked={Boolean(values.taxEnabled)}
                                    onChange={(event) => {
                                        const checked = event.target.checked;
                                        setValues?.((current) => applyComputedTotals({ ...current, taxEnabled: checked }, current.items ?? []));
                                    }}
                                    align="center"
                                    inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                    containerClassName="w-auto inline-flex"
                                />
                                <CheckboxField
                                    label="Total termasuk Pajak"
                                    checked={Boolean(values.taxIncluded)}
                                    onChange={(event) => {
                                        const checked = event.target.checked;
                                        setValues?.((current) => applyComputedTotals({ ...current, taxIncluded: checked }, current.items ?? []));
                                    }}
                                    align="center"
                                    inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                    containerClassName="w-auto inline-flex"
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
            {config.showShippingInfo !== false && config.taxInfoMode !== 'invoice' ? (
                <div className={config.showTaxInfo === false ? '' : 'mt-7'}>
                    <TransactionSectionHeading title={config.shippingInfoTitle} icon="truck" />
                    <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                        <div className="grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.shippingDate} />
                            <TransactionDateInput
                                value={values.shippingDate}
                                onChange={(nextDisplayValue) => setValues?.((current) => ({ ...current, shippingDate: nextDisplayValue }))}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
