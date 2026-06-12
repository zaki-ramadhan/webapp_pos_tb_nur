import { Fragment } from 'react';

import TextInput from '@/components/ui/TextInput';
import Tooltip from '@/components/ui/Tooltip';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { InfoIcon, PinIcon } from '@/features/workspace/shared/Icons';
import { TransactionFieldLabel, TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { ReadonlyDocumentTextarea } from '@/features/workspace/modules/shared/sales-document/SalesDocumentPrimitives';

function getSalesReturnInfo(value, label) {
    const map = {
        'returned': 'Semua barang yang diretur akan masuk kembali ke persediaan gudang.',
        'not-returned': 'Barang tidak dikembalikan fisik ke gudang (misalnya barang rusak/dibuang), namun nilai piutang tetap disesuaikan.',
        'partial-returned': 'Hanya sebagian barang yang diretur masuk kembali ke gudang fisik.',
    };
    return map[value] || `Informasi tentang ${label}`;
}

export default function SalesDocumentAdditionalInfoColumn({ config, values, setValues, isDetail, handlers }) {
    const additionalInfoLeadingFields = config.additionalInfoLeadingFields ?? [];
    const additionalLookupFields = config.additionalInfoLookupFields ?? [];
    const additionalTrailingFields = config.additionalInfoTrailingFields ?? [];

    function renderAdditionalField(field, key) {
        if (field.detailOnly && !isDetail) {
            return null;
        }

        if (field.createOnly && isDetail) {
            return null;
        }

        if (field.type === 'radio-group') {
            return (
                <Fragment key={key}>
                    <TransactionFieldLabel label={field.label} required={field.required} />
                    <div className={`space-y-3 ${field.className ?? ''}`.trim()}>
                        {(field.options ?? []).map((option) => {
                            const checked = (values[field.valueKey] ?? '') === option.value;

                            return (
                                <label key={option.value} className="flex items-center gap-3 text-xs sm:text-sm text-[#1f2436]">
                                    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#c8ccd4]">
                                        {checked ? <span className="h-[10px] w-[10px] rounded-full bg-[#a7a7a8]" /> : null}
                                    </span>
                                    <span>{option.label}</span>
                                    {option.showInfoIcon ? (
                                        <Tooltip content={getSalesReturnInfo(option.value, option.label)} portal>
                                            <InfoIcon className="h-4.5 w-4.5 text-[#1f2436] cursor-help" />
                                        </Tooltip>
                                    ) : null}
                                </label>
                            );
                        })}
                    </div>
                </Fragment>
            );
        }


        if (field.type === 'lookup') {
            return (
                <Fragment key={key}>
                    <TransactionFieldLabel label={field.label} required={field.required} />
                    <ChipLookupField
                        values={values[field.valueKey] ?? []}
                        placeholder={field.placeholder ?? 'Cari/Pilih...'}
                        onRemove={() => {}}
                        searchLabel={field.searchLabel ?? field.label}
                        heightClassName={field.heightClassName ?? 'h-[34px]'}
                    />
                </Fragment>
            );
        }

        if (field.type === 'textarea') {
            return (
                <Fragment key={key}>
                    <TransactionFieldLabel label={field.label} required={field.required} />
                    <ReadonlyDocumentTextarea value={values[field.valueKey] ?? ''} className={field.className ?? 'min-h-[72px]'} />
                </Fragment>
            );
        }

        return (
            <Fragment key={key}>
                <TransactionFieldLabel label={field.label} required={field.required} />
                <TextInput
                    value={values[field.valueKey] ?? ''}
                    readOnly
                    className={field.className ?? 'h-[34px] rounded-[4px] border-[#cfd6e2]'}
                    inputClassName={field.inputClassName ?? 'text-xs sm:text-sm text-[#5f6779]'}
                />
            </Fragment>
        );
    }

    return (
        <section>
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="document" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                {additionalInfoLeadingFields.map((field, index) =>
                    renderAdditionalField(field, `${field.valueKey ?? field.label}-leading-${index}`),
                )}

                {config.showPreInvoiceOption ? (
                    <>
                        <TransactionFieldLabel label={config.labels.preInvoice ?? 'Faktur Dimuka'} />
                        <label className="inline-flex h-[34px] items-center gap-3 text-xs sm:text-sm text-[#1f2436]">
                            <input type="checkbox" checked={values.preInvoice} readOnly className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                            <span>{config.preInvoiceOptionLabel ?? 'Ya (Mendahului Pengiriman)'}</span>
                        </label>
                    </>
                ) : null}

                {config.showPaymentTerms !== false ? (
                    <>
                        <TransactionFieldLabel label={config.labels.paymentTerms} />
                        <ChipLookupField
                            values={values.paymentTerms}
                            placeholder="Cari/Pilih..."
                            onRemove={(value) =>
                                setValues?.((current) => ({
                                    ...current,
                                    paymentTerms: current.paymentTerms.filter((item) => item !== value),
                                    __paymentTermId: current.paymentTerms.filter((item) => item !== value).length ? current.__paymentTermId : null,
                                }))
                            }
                            onSearch={handlers?.onSelectPaymentTerm}
                            searchLabel="Cari syarat pembayaran"
                            heightClassName="h-[34px]"
                        />
                    </>
                ) : null}

                {additionalLookupFields.map((field, index) => renderAdditionalField(field, `${field.valueKey ?? field.label}-${index}`))}

                {config.showPurchaseOrderNumber !== false ? (
                    <>
                        <TransactionFieldLabel label={config.labels.purchaseOrderNumber} />
                        <TextInput
                            value={values.purchaseOrderNumber}
                            onChange={(event) =>
                                setValues?.((current) => ({
                                    ...current,
                                    purchaseOrderNumber: event.target.value,
                                }))
                            }
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    </>
                ) : null}

                <TransactionFieldLabel label={config.labels.address} />
                {config.showAddressPinButton ? (
                    <div className="flex items-start gap-4">
                        <button
                            type="button"
                            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#21539b]"
                            aria-label="Lihat alamat"
                        >
                            <PinIcon className="h-[18px] w-[18px] text-[#21539b]" />
                        </button>
                        <textarea
                            value={values.address}
                            onChange={(event) =>
                                setValues?.((current) => ({
                                    ...current,
                                    address: event.target.value,
                                }))
                            }
                            rows={4}
                            className="min-h-[86px] flex-1 resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none"
                        />
                    </div>
                ) : (
                    <textarea
                        value={values.address}
                        onChange={(event) =>
                            setValues?.((current) => ({
                                ...current,
                                address: event.target.value,
                            }))
                        }
                        rows={4}
                        className="min-h-[84px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none"
                    />
                )}

                <TransactionFieldLabel label={config.labels.branch} required />
                <ChipLookupField
                    values={values.branches}
                    placeholder="Cari/Pilih..."
                    onRemove={(value) =>
                        setValues?.((current) => ({
                            ...current,
                            branches: current.branches.filter((item) => item !== value),
                            __branchId: current.branches.filter((item) => item !== value).length ? current.__branchId : null,
                        }))
                    }
                    onSearch={handlers?.onSelectBranch}
                    searchLabel="Cari cabang"
                    heightClassName="h-[34px]"
                />

                <TransactionFieldLabel label={config.labels.notes} />
                <textarea
                    value={values.notes}
                    onChange={(event) =>
                        setValues?.((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={4}
                    className="min-h-[72px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none"
                />

                {additionalTrailingFields.map((field, index) => renderAdditionalField(field, `${field.valueKey ?? field.label}-trailing-${index}`))}

                {config.showContactField ? (
                    <>
                        <TransactionFieldLabel label={config.labels.contact ?? 'Kontak'} />
                        <ChipLookupField values={values.contacts} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari kontak" heightClassName="h-[34px]" />
                    </>
                ) : null}
            </div>
        </section>
    );
}
