import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';

export function buildDepositFormState(source = {}) {
    return Object.fromEntries(
        Object.entries(source).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value]),
    );
}

export function ReadonlyTransactionTextarea({ value, rows = 3, className = '' }) {
    return (
        <textarea
            value={value}
            readOnly
            rows={rows}
            className={`w-full resize-y rounded-[4px] border border-ui-border px-4 py-3 text-xs sm:text-sm text-brand-dark outline-none ${className}`.trim()}
        />
    );
}

export function DepositStamp({ label, tone = 'blue', className = '' }) {
    const toneClassName =
        tone === 'gray'
            ? 'border-border-badge-neutral text-text-badge-neutral'
            : tone === 'green'
              ? 'border-status-success-badge-border text-status-success-badge-text'
              : 'border-blue-80 text-blue-80';

    return (
        <div
            className={`pointer-events-none absolute flex h-[98px] w-[144px] rotate-[-18deg] items-center justify-center opacity-55 ${className}`.trim()}
        >
            <div
                className={`relative flex h-[82px] w-[82px] items-center justify-center rounded-full border-[4px] ${toneClassName}`.trim()}
            >
                <div className={`absolute h-[96px] w-[96px] rounded-full border-[2px] ${toneClassName}`.trim()} />
            </div>
            <div
                className={`absolute whitespace-pre-line rounded-[3px] border-[3px] bg-white px-3 py-1 text-center text-sm font-bold leading-[1.05] tracking-[0.12em] ${toneClassName}`.trim()}
            >
                {label}
            </div>
        </div>
    );
}

export function DepositStatusPill({ value }) {
    const toneClassName =
        value === 'Lunas'
            ? 'border-green-140 bg-success-bg text-text-badge-success-alt'
            : 'border-status-warning-badge-border bg-bg-badge-warning-alt text-status-warning-badge-text';

    return (
        <span className={`inline-flex rounded-[4px] border px-3 py-1 text-base ${toneClassName}`.trim()}>
            {value}
        </span>
    );
}

export function DepositAmountField({ prefix = 'Rp', value, className = '' }) {
    return (
        <div className={`flex h-[34px] overflow-hidden rounded-[4px] border border-ui-border ${className}`.trim()}>
            <span className="inline-flex items-center border-r border-ui-border-medium bg-input-prefix-bg-compact px-3 text-base text-text-inactive">
                {prefix}
            </span>
            <span className="inline-flex flex-1 items-center justify-end px-3 text-lg font-semibold text-text-darkest">
                {value}
            </span>
            <span className="inline-flex w-10 items-center justify-center border-l border-ui-border-medium text-brand-dark">
                <NavigationIcon type="payment" className="h-4 w-4 text-current" />
            </span>
        </div>
    );
}

export function DepositFooterSummary({ items = [] }) {
    if (!items.length) {
        return null;
    }

    const gridTemplateClassName =
        items.length >= 4 ? 'md:grid-cols-4' : items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

    return (
        <div className="flex justify-end">
            <div
                className={`grid w-full max-w-[866px] overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium ${gridTemplateClassName}`.trim()}
            >
                {items.map((item, index) => (
                    <div
                        key={item.id ?? item.label}
                        className={`border-b border-ui-border-light px-4 py-3 last:border-b-0 md:border-b-0 md:px-5 ${
                            index < items.length - 1 ? 'md:border-r' : ''
                        }`.trim()}
                    >
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-brand-dark">
                            <span>{item.label}</span>
                            {item.badge ? (
                                <span className="inline-flex rounded-[4px] border border-brand-blue-border-light px-1.5 py-0.5 text-xs text-brand-blue-accent">
                                    {item.badge}
                                </span>
                            ) : null}
                        </div>
                        <div className="mt-2 text-right text-lg font-semibold text-text-darkest">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DepositLinkedRowsSection({ title, icon = 'payment', rows = [], emptyLabel = 'Belum ada data.' }) {
    return (
        <section>
            <div className="flex items-center gap-3 border-b border-ui-border-medium pb-3">
                <NavigationIcon type={icon} className="h-5 w-5 text-blue-440" />
                <h3 className="text-2xl font-normal text-input-brand">{title}</h3>
            </div>

            <div className="mt-4">
                {rows.length ? (
                    <div className="rounded-[4px] border border-ui-border-medium bg-white">
                        {rows.map((item, index) => (
                            <div
                                key={item.id}
                                className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 ${
                                    index > 0 ? 'border-t border-border-ui-border-lightest' : ''
                                }`.trim()}
                            >
                                <div>
                                    <div className="text-base font-semibold text-input-brand">{item.number}</div>
                                    <div className="mt-1 text-sm text-brand-dark">{item.date}</div>
                                </div>
                                <div className="text-right text-base font-semibold text-text-darkest">{item.amount}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[4px] border border-dashed border-ui-border-medium px-4 py-6 text-base text-text-placeholder">
                        {emptyLabel}
                    </div>
                )}
            </div>
        </section>
    );
}
