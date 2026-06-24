import { buildCurrencyValue, TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { TableActionIcon } from '@/features/workspace/shared/Icons';

function SummaryValue({ label, value, highlight = false }) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border-ui-border-lightest px-4 py-2.5 last:border-b-0">
            <span className="text-xs sm:text-sm text-brand-dark">{label}</span>
            <span className={`text-right text-base ${highlight ? 'font-semibold text-text-darkest' : 'text-text-darkest'}`.trim()}>
                {value}
            </span>
        </div>
    );
}

function StatusPill({ value, tone = 'success' }) {
    const toneClassName =
        tone === 'warning'
            ? 'border-status-warning-badge-border bg-bg-badge-warning-alt text-status-warning-badge-text'
            : 'border-green-140 bg-success-bg text-text-badge-success-alt';

    return (
        <span className={`inline-flex rounded-[4px] border px-3 py-1 text-base ${toneClassName}`.trim()}>
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
            <section className="space-y-4">
                <div>
                    <TransactionSectionHeading title={config.orderInfoTitle} icon="receipt" />

                    <div className="mt-4 rounded-[6px] border border-ui-border-medium bg-white">
                        {values.summary?.map(([label, value], index) => (
                            <SummaryValue key={`${label}-${index}`} label={label} value={value} highlight={index === 0} />
                        ))}
                    </div>
                </div>

                {showSecondarySection ? (
                    <div>
                        <TransactionSectionHeading title={config.processedByTitle} icon="document" />

                        <div className="mt-4 rounded-[6px] border border-ui-border-medium bg-white">
                            {processedItems.length ? (
                                processedItems.map((item, index) => (
                                    <div key={`${item.number ?? 'processed'}-${index}`} className="grid grid-cols-[minmax(0,1fr)_140px] gap-3 border-b border-border-ui-border-lightest px-4 py-2.5 last:border-b-0">
                                        <div className="min-w-0">
                                            <div className="truncate text-xs sm:text-sm text-brand-dark">{item.number ?? '-'}</div>
                                        </div>
                                        <div className="text-right text-xs sm:text-sm text-brand-dark">{item.date ?? '-'}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-base text-tab-view-active-text">{config.processedByEmptyLabel ?? 'Belum ada data.'}</div>
                            )}
                        </div>
                    </div>
                ) : null}
            </section>

            <section>
                <TransactionSectionHeading title="Status Dokumen" icon="check" />

                <div className="mt-4 rounded-[6px] border border-ui-border-medium bg-white p-4">
                    <div className="flex flex-col gap-4">
                        {values.approvalStamp ? (
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs sm:text-sm text-brand-dark">Approval</span>
                                <StatusPill value={values.approvalStamp} />
                            </div>
                        ) : null}

                        {values.processStamp ? (
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs sm:text-sm text-brand-dark">Proses</span>
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
        <div className="rounded-[6px] border border-ui-border-medium bg-white p-5">
            <TransactionSectionHeading title="SmartLink" icon="smartlink" />
            <p className="mt-4 max-w-[760px] text-base leading-7 text-text-workspace-muted">
                Dokumen ini belum memiliki SmartLink aktif. Hubungkan dokumen lain atau aktifkan integrasi
                untuk menampilkan referensi otomatis di area ini.
            </p>
        </div>
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
            <div className={`grid w-full max-w-[1220px] overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium ${gridClassName}`.trim()}>
                {footerParts.map((part) => (
                    <div key={part.id} className="border-b border-ui-border-light px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 md:px-5">
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-xs sm:text-sm text-brand-dark">
                                {part.label}
                                {(part.id === 'discount' || part.id === 'tax') ? (
                                    <span className="ml-1 inline-flex rounded-[4px] border border-brand-blue-border-light px-1.5 py-0.5 text-xs text-brand-blue-accent">
                                        %
                                    </span>
                                ) : null}
                            </span>
                        </div>

                        {part.isInput ? (
                            <div className="mt-2 flex h-[34px] overflow-hidden rounded-[4px] border border-ui-border">
                                {part.prefix ? (
                                    <span className="inline-flex items-center border-r border-ui-border-medium bg-input-prefix-bg-compact px-3 text-base text-text-inactive">
                                        {part.prefix}
                                    </span>
                                ) : null}
                                <span className="inline-flex flex-1 items-center justify-end px-3 text-lg font-semibold text-text-darkest">
                                    {part.value}
                                </span>
                                <span className="inline-flex w-10 items-center justify-center border-l border-ui-border-medium text-brand-dark">
                                    <TableActionIcon className="h-4 w-4" />
                                </span>
                            </div>
                        ) : (
                            <div className={`mt-2 text-lg font-semibold text-text-darkest ${part.align === 'right' ? 'text-right' : (part.align === 'center' ? 'text-center' : 'text-left')}`.trim()}>
                                {part.value}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
