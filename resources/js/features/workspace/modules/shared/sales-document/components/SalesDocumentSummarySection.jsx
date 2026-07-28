import { TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

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

export default function SalesDocumentSummarySection({ config, values }) {
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
                                <div className="px-4 py-6 text-base text-tab-view-active-text">{config.processedByEmptyLabel ?? 'Tidak ada data.'}</div>
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
