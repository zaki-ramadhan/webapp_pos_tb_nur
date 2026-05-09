import { Fragment } from 'react';

import TextInput from '@/components/ui/TextInput';
import {
    buildCurrencyValue,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { InfoIcon, PinIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

import {
    ReadonlyDocumentTextarea,
    SearchableTableSection,
} from '@/features/workspace/modules/shared/sales-document/SalesDocumentPrimitives';

function SummaryValue({ label, value, highlight = false }) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e6ebf2] px-4 py-2.5 last:border-b-0">
            <span className="text-[17px] text-[#1f2436]">{label}</span>
            <span className={`text-right text-[17px] ${highlight ? 'font-semibold text-[#111827]' : 'text-[#111827]'}`.trim()}>
                {value}
            </span>
        </div>
    );
}

function StatusPill({ value, tone = 'success' }) {
    const toneClassName =
        tone === 'warning'
            ? 'border-[#ffd08c] bg-[#fff5e7] text-[#ff8d08]'
            : 'border-[#bcebc1] bg-[#effcf0] text-[#2db757]';

    return (
        <span className={`inline-flex rounded-[4px] border px-3 py-1 text-[15px] ${toneClassName}`.trim()}>
            {value}
        </span>
    );
}

export function SalesDocumentSummarySection({ config, values }) {
    const processedItems = Array.isArray(values.processedBy)
        ? values.processedBy
        : values.processedBy
          ? [values.processedBy]
          : [];
    const showSecondarySection = config.showSummarySecondarySection !== false;

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <section className="space-y-5">
                <div>
                    <TransactionSectionHeading title={config.orderInfoTitle} icon="receipt" />

                    <div className="mt-4 rounded-[6px] border border-[#d6dce8] bg-white">
                        {values.summary?.map(([label, value], index) => (
                            <SummaryValue key={`${label}-${index}`} label={label} value={value} highlight={index === 0} />
                        ))}
                    </div>
                </div>

                {showSecondarySection ? (
                    <div>
                        <TransactionSectionHeading title={config.processedByTitle} icon="document" />

                        <div className="mt-4 rounded-[6px] border border-[#d6dce8] bg-white">
                            {processedItems.length ? (
                                processedItems.map((item, index) => (
                                    <div key={`${item.number ?? 'processed'}-${index}`} className="grid grid-cols-[minmax(0,1fr)_140px] gap-3 border-b border-[#e6ebf2] px-4 py-2.5 last:border-b-0">
                                        <div className="min-w-0">
                                            <div className="truncate text-[17px] text-[#1f2436]">{item.number ?? '-'}</div>
                                        </div>
                                        <div className="text-right text-[17px] text-[#1f2436]">{item.date ?? '-'}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-[16px] text-[#6b7280]">{config.processedByEmptyLabel ?? 'Belum ada data.'}</div>
                            )}
                        </div>
                    </div>
                ) : null}
            </section>

            <section>
                <TransactionSectionHeading title="Status Dokumen" icon="check" />

                <div className="mt-4 rounded-[6px] border border-[#d6dce8] bg-white p-4">
                    <div className="flex flex-col gap-4">
                        {values.approvalStamp ? (
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[17px] text-[#1f2436]">Approval</span>
                                <StatusPill value={values.approvalStamp} />
                            </div>
                        ) : null}

                        {values.processStamp ? (
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[17px] text-[#1f2436]">Proses</span>
                                <StatusPill
                                    value={values.processStamp}
                                    tone={String(values.processStamp).toLowerCase().includes('belum') ? 'warning' : 'success'}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>
        </div>
    );
}

export function SalesDocumentSmartlinkSection() {
    return (
        <div className="rounded-[6px] border border-[#d6dce8] bg-white p-5">
            <TransactionSectionHeading title="SmartLink" icon="smartlink" />
            <p className="mt-4 max-w-[760px] text-[16px] leading-7 text-[#5f6779]">
                Dokumen ini belum memiliki SmartLink aktif. Hubungkan dokumen lain atau aktifkan integrasi
                untuk menampilkan referensi otomatis di area ini.
            </p>
        </div>
    );
}

function SalesDocumentInvoiceTaxSection({ values }) {
    return (
        <div>
            <TransactionSectionHeading title="Info Pajak" icon="tax" />

            <div className="mt-4 rounded-[6px] border border-[#d6dce8] bg-white p-4">
                <div className="grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label="Pajak" />
                    <div className="flex flex-wrap gap-8 text-[17px] text-[#1f2436]">
                        <label className="inline-flex items-center gap-3">
                            <input type="checkbox" checked={values.taxEnabled} readOnly className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                            <span>Kena Pajak</span>
                        </label>
                        <label className="inline-flex items-center gap-3">
                            <input type="checkbox" checked={values.taxIncluded} readOnly className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                            <span>Total termasuk Pajak</span>
                        </label>
                    </div>

                    <TransactionFieldLabel label="Tipe ID" />
                    <TextInput value={values.taxIdType ?? ''} readOnly className="h-[34px] max-w-[272px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />

                    <TransactionFieldLabel label="Negara" />
                    <TextInput value={values.taxCountryName ?? ''} readOnly className="h-[34px] max-w-[272px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />

                    <TransactionFieldLabel label="ID Pajak" />
                    <TextInput value={values.taxNumber ?? ''} readOnly className="h-[34px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />

                    <TransactionFieldLabel label="Nama Pajak" />
                    <TextInput value={values.taxName ?? ''} readOnly className="h-[34px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />

                    <TransactionFieldLabel label="ID TKU" />
                    <TextInput value={values.taxIdTku ?? ''} readOnly className="h-[34px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />

                    <TransactionFieldLabel label="No. Faktur Pajak" />
                    <TextInput
                        value={values.taxInvoiceNumber ?? ''}
                        readOnly
                        trailing={<span className="text-[18px] font-semibold text-[#1f2436]">×</span>}
                        className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                        trailingClassName="px-3"
                    />
                </div>
            </div>

            <div className="mt-7">
                <TransactionSectionHeading title="Info Pengiriman" icon="truck" />
                <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label="Tgl Pengiriman" />
                    <TransactionDateInput value={values.shippingDate} className="max-w-[272px]" />

                    <TransactionFieldLabel label="Pengiriman" />
                    <ChipLookupField values={values.shippingMethod} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari pengiriman" heightClassName="h-[34px]" />

                    <TransactionFieldLabel label="FOB" />
                    <ChipLookupField values={values.fob} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari FOB" heightClassName="h-[34px]" />
                </div>
            </div>

            <div className="mt-7">
                <TransactionSectionHeading title="Info Tambahan" icon="payment" />
            </div>
        </div>
    );
}

export function SalesDocumentItemsSection({ config, values, isDetail }) {
    const itemTitle = values.itemCountLabel || config.itemSectionTitle;
    const canOpenItemModal = isDetail && config.itemModal?.enabled && Boolean(values.itemModal);
    const itemLeadingAction =
        config.itemSectionLeadingActionDetailOnly && !isDetail
            ? null
            : config.itemSectionLeadingActionCreateOnly && isDetail
              ? null
              : config.itemSectionLeadingAction;

    return (
        <SearchableTableSection
            searchValue={values.itemSearch}
            searchPlaceholder={config.itemSearchPlaceholder}
            title={itemTitle}
            columns={config.itemTable.columns}
            rows={values.items}
            emptyLabel={config.itemTable.emptyLabel}
            minWidthClassName={config.itemTable.minWidthClassName ?? 'min-w-[1000px]'}
            showTitleSearchButton={config.showItemTitleSearchButton ?? isDetail}
            hideSearchField={config.hideItemSearchField}
            leadingAction={itemLeadingAction}
            onTitleClick={canOpenItemModal ? config.onOpenItemModal : undefined}
            onRowClick={canOpenItemModal ? config.onOpenItemModal : undefined}
        />
    );
}

export function SalesDocumentAdditionalInfoSection({ config, values, isDetail }) {
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
                                <label key={option.value} className="flex items-center gap-3 text-[17px] text-[#1f2436]">
                                    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#c8ccd4]">
                                        {checked ? <span className="h-[10px] w-[10px] rounded-full bg-[#a7a7a8]" /> : null}
                                    </span>
                                    <span>{option.label}</span>
                                    {option.showInfoIcon ? <InfoIcon className="h-4.5 w-4.5 text-[#1f2436]" /> : null}
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
                    inputClassName={field.inputClassName ?? 'text-[15px] text-[#5f6779]'}
                />
            </Fragment>
        );
    }

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section>
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="document" />

                <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    {additionalInfoLeadingFields.map((field, index) =>
                        renderAdditionalField(field, `${field.valueKey ?? field.label}-leading-${index}`),
                    )}

                    {config.showPreInvoiceOption ? (
                        <>
                            <TransactionFieldLabel label={config.labels.preInvoice ?? 'Faktur Dimuka'} />
                            <label className="inline-flex h-[34px] items-center gap-3 text-[17px] text-[#1f2436]">
                                <input type="checkbox" checked={values.preInvoice} readOnly className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                                <span>{config.preInvoiceOptionLabel ?? 'Ya (Mendahului Pengiriman)'}</span>
                            </label>
                        </>
                    ) : null}

                    {config.showPaymentTerms !== false ? (
                        <>
                            <TransactionFieldLabel label={config.labels.paymentTerms} />
                            <ChipLookupField values={values.paymentTerms} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari syarat pembayaran" heightClassName="h-[34px]" />
                        </>
                    ) : null}

                    {additionalLookupFields.map((field, index) => renderAdditionalField(field, `${field.valueKey ?? field.label}-${index}`))}

                    {config.showPurchaseOrderNumber !== false ? (
                        <>
                            <TransactionFieldLabel label={config.labels.purchaseOrderNumber} />
                            <TextInput value={values.purchaseOrderNumber} readOnly className="h-[34px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />
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
                            <ReadonlyDocumentTextarea value={values.address} className="min-h-[86px] flex-1" />
                        </div>
                    ) : (
                        <ReadonlyDocumentTextarea value={values.address} className="min-h-[84px]" />
                    )}

                    <TransactionFieldLabel label={config.labels.branch} required />
                    <ChipLookupField values={values.branches} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari cabang" heightClassName="h-[34px]" />

                    <TransactionFieldLabel label={config.labels.notes} />
                    <ReadonlyDocumentTextarea value={values.notes} className="min-h-[72px]" />

                    {additionalTrailingFields.map((field, index) => renderAdditionalField(field, `${field.valueKey ?? field.label}-trailing-${index}`))}

                    {config.showContactField ? (
                        <>
                            <TransactionFieldLabel label={config.labels.contact ?? 'Kontak'} />
                            <ChipLookupField values={values.contacts} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari kontak" heightClassName="h-[34px]" />
                        </>
                    ) : null}
                </div>
            </section>

            <section>
                {config.taxInfoMode === 'invoice' ? <SalesDocumentInvoiceTaxSection values={values} /> : null}

                {config.showTaxInfo !== false && config.taxInfoMode !== 'invoice' ? (
                    <>
                        <TransactionSectionHeading title={config.taxInfoTitle} icon="tax" />

                        <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.tax} />
                            <div className="flex flex-wrap gap-8 text-[17px] text-[#1f2436]">
                                <label className="inline-flex items-center gap-3">
                                    <input type="checkbox" checked={values.taxEnabled} readOnly className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                                    <span>Kena Pajak</span>
                                </label>
                                <label className="inline-flex items-center gap-3">
                                    <input type="checkbox" checked={values.taxIncluded} readOnly className="h-[20px] w-[20px] rounded border border-[#cfd6e2]" />
                                    <span>Total termasuk Pajak</span>
                                </label>
                            </div>
                        </div>
                    </>
                ) : null}

                {config.showShippingInfo !== false && config.taxInfoMode !== 'invoice' ? (
                    <div className={config.showTaxInfo === false ? '' : 'mt-7'}>
                        <TransactionSectionHeading title={config.shippingInfoTitle} icon="truck" />
                        <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.shippingDate} />
                            <TransactionDateInput value={values.shippingDate} className="max-w-[272px]" />

                            <TransactionFieldLabel label={config.labels.shippingMethod} />
                            <ChipLookupField values={values.shippingMethod} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari pengiriman" heightClassName="h-[34px]" />

                            {config.showFobInShippingInfo ? (
                                <>
                                    <TransactionFieldLabel label={config.labels.fob} />
                                    <ChipLookupField values={values.fob} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari FOB" heightClassName="h-[34px]" />
                                </>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {config.showExtraInfo !== false && !config.showFobInShippingInfo && config.taxInfoMode !== 'invoice' ? (
                    <div className={config.showTaxInfo === false && config.showShippingInfo === false ? '' : 'mt-7'}>
                        <TransactionSectionHeading title={config.extraInfoTitle} icon="payment" />
                        <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.fob} />
                            <ChipLookupField values={values.fob} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari FOB" heightClassName="h-[34px]" />
                        </div>
                    </div>
                ) : null}
            </section>
        </div>
    );
}

export function SalesDocumentAdditionalCostSection({ config, values }) {
    const costLeadingAction =
        config.costSectionLeadingActionDetailOnly && !values.documentNumber
            ? null
            : config.costSectionLeadingActionCreateOnly && values.documentNumber
              ? null
              : config.costSectionLeadingAction;

    return (
        <SearchableTableSection
            searchValue={values.costSearch}
            searchPlaceholder={config.costSearchPlaceholder}
            title={config.additionalCostsTitle}
            columns={config.costTable.columns}
            rows={values.additionalCosts}
            emptyLabel={config.costTable.emptyLabel}
            hideSearchField={config.hideCostSearchField}
            leadingAction={costLeadingAction}
            showTitleSearchButton={config.showCostTitleSearchButton}
            minWidthClassName={config.costTable.minWidthClassName ?? 'min-w-[900px]'}
        />
    );
}

export function SalesDocumentAdvancePaymentsSection({ config, values }) {
    return (
        <SearchableTableSection
            searchValue={values.advancePaymentSearch ?? ''}
            searchPlaceholder={config.advancePaymentSearchPlaceholder ?? 'Cari/Pilih...'}
            title={config.advancePaymentTitle ?? 'Uang Muka'}
            columns={config.advancePaymentTable?.columns ?? []}
            rows={values.advancePayments ?? []}
            emptyLabel={config.advancePaymentTable?.emptyLabel ?? 'Belum ada data'}
            minWidthClassName={config.advancePaymentTable?.minWidthClassName ?? 'min-w-[760px]'}
        />
    );
}

export function SalesDocumentFooter({ values }) {
    const footerParts = [
        { id: 'subtotal', label: 'Sub Total', value: buildCurrencyValue(values.subtotal), align: 'right' },
        { id: 'discount', label: 'Diskon', value: values.discountValue, isInput: true, prefix: values.discountPrefix },
        ...(values.taxLabel ? [{ id: 'tax', label: values.taxLabel, value: buildCurrencyValue(values.taxValue), align: 'right' }] : []),
        { id: 'total', label: 'Total', value: buildCurrencyValue(values.total), align: 'right' },
    ];
    const gridClassName =
        footerParts.length === 4
            ? 'md:grid-cols-4'
            : footerParts.length === 3
              ? 'md:grid-cols-3'
              : footerParts.length === 2
                ? 'md:grid-cols-2'
                : 'md:grid-cols-1';

    return (
        <div className="flex justify-end">
            <div className={`grid w-full max-w-[1220px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${gridClassName}`.trim()}>
                {footerParts.map((part) => (
                    <div key={part.id} className="border-b border-[#e4e8f0] px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 md:px-5">
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-[17px] text-[#1f2436]">
                                {part.label}
                                {(part.id === 'discount' || part.id === 'tax') ? (
                                    <span className="ml-1 inline-flex rounded-[4px] border border-[#78a6e8] px-1.5 py-0.5 text-[12px] text-[#21539b]">
                                        %
                                    </span>
                                ) : null}
                            </span>
                        </div>

                        {part.isInput ? (
                            <div className="mt-2 flex h-[34px] overflow-hidden rounded-[4px] border border-[#cfd6e2]">
                                {part.prefix ? (
                                    <span className="inline-flex items-center border-r border-[#d8dde7] bg-[#f5f6f8] px-3 text-[15px] text-[#9aa3b1]">
                                        {part.prefix}
                                    </span>
                                ) : null}
                                <span className="inline-flex flex-1 items-center justify-end px-3 text-[18px] font-semibold text-[#111827]">
                                    {part.value}
                                </span>
                                <span className="inline-flex w-10 items-center justify-center border-l border-[#d8dde7] text-[#1f2436]">
                                    <TableActionIcon className="h-4 w-4" />
                                </span>
                            </div>
                        ) : (
                            <div className={`mt-2 text-[18px] font-semibold text-[#111827] ${part.align === 'right' ? 'text-right' : 'text-left'}`.trim()}>
                                {part.value}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
