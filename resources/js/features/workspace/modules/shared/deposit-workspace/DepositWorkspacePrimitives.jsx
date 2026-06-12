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
            className={`w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none ${className}`.trim()}
        />
    );
}

export function DepositStamp({ label, tone = 'blue', className = '' }) {
    const toneClassName =
        tone === 'gray'
            ? 'border-[#bebfc8] text-[#b8bac3]'
            : tone === 'green'
              ? 'border-[#8bd987] text-[#8ccc81]'
              : 'border-[#7fd1ff] text-[#7dcaf4]';

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
            ? 'border-[#bcebc1] bg-[#effcf0] text-[#2db757]'
            : 'border-[#ffd08c] bg-[#fff5e7] text-[#ff8d08]';

    return (
        <span className={`inline-flex rounded-[4px] border px-3 py-1 text-base ${toneClassName}`.trim()}>
            {value}
        </span>
    );
}

export function DepositAmountField({ prefix = 'Rp', value, className = '' }) {
    return (
        <div className={`flex h-[34px] overflow-hidden rounded-[4px] border border-[#cfd6e2] ${className}`.trim()}>
            <span className="inline-flex items-center border-r border-[#d8dde7] bg-[#f5f6f8] px-3 text-base text-[#9aa3b1]">
                {prefix}
            </span>
            <span className="inline-flex flex-1 items-center justify-end px-3 text-lg font-semibold text-[#111827]">
                {value}
            </span>
            <span className="inline-flex w-10 items-center justify-center border-l border-[#d8dde7] text-[#1f2436]">
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
                className={`grid w-full max-w-[866px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${gridTemplateClassName}`.trim()}
            >
                {items.map((item, index) => (
                    <div
                        key={item.id ?? item.label}
                        className={`border-b border-[#e4e8f0] px-4 py-3 last:border-b-0 md:border-b-0 md:px-5 ${
                            index < items.length - 1 ? 'md:border-r' : ''
                        }`.trim()}
                    >
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#1f2436]">
                            <span>{item.label}</span>
                            {item.badge ? (
                                <span className="inline-flex rounded-[4px] border border-[#8ab2ea] px-1.5 py-0.5 text-xs text-[#21539b]">
                                    {item.badge}
                                </span>
                            ) : null}
                        </div>
                        <div className="mt-2 text-right text-lg font-semibold text-[#111827]">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DepositLinkedRowsSection({ title, icon = 'payment', rows = [], emptyLabel = 'Belum ada data.' }) {
    return (
        <section>
            <div className="flex items-center gap-3 border-b border-[#d8dde7] pb-3">
                <NavigationIcon type={icon} className="h-5 w-5 text-[#2f78e5]" />
                <h3 className="text-2xl font-normal text-[#1564d7]">{title}</h3>
            </div>

            <div className="mt-4">
                {rows.length ? (
                    <div className="rounded-[4px] border border-[#d8dde7] bg-white">
                        {rows.map((item, index) => (
                            <div
                                key={item.id}
                                className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 ${
                                    index > 0 ? 'border-t border-[#e6ebf2]' : ''
                                }`.trim()}
                            >
                                <div>
                                    <div className="text-base font-semibold text-[#1661d8]">{item.number}</div>
                                    <div className="mt-1 text-sm text-[#1f2436]">{item.date}</div>
                                </div>
                                <div className="text-right text-base font-semibold text-[#111827]">{item.amount}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[4px] border border-dashed border-[#d8dde7] px-4 py-6 text-base text-[#7d879a]">
                        {emptyLabel}
                    </div>
                )}
            </div>
        </section>
    );
}
