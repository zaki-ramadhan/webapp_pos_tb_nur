export function AbcTopItemRow({ item }) {
    return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[7px] border border-[#dce3ed] bg-white px-3 py-2.5 shadow-[0_6px_14px_rgba(15,23,42,0.04)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
            <span
                className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-full px-2 text-[12px] font-semibold"
                style={{ backgroundColor: `${item.categoryColor}18`, color: item.categoryColor }}
            >
                {item.category}
            </span>
            <div className="min-w-0">
                <p className="break-words text-[13px] font-medium text-[#1f2536] md:text-[14px] sm:truncate">{item.name}</p>
                <p className="mt-1 text-[11px] text-[#7c839b] md:text-[12px]">
                    {item.code} • {item.unitsSold}
                </p>
            </div>
            <div className="col-start-2 text-left sm:col-start-auto sm:text-right">
                <p className="text-[13px] font-semibold text-[#1f2536] md:text-[14px]">{item.revenue}</p>
                <p className="mt-1 text-[11px] text-[#7c839b] md:text-[12px]">{item.share}</p>
            </div>
        </div>
    );
}

export function RuleSummaryRow({ rule }) {
    return (
        <div className="rounded-[7px] border border-[#dce3ed] bg-white px-3 py-2.5 shadow-[0_6px_14px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6e7691]">
                <span className="rounded-full border border-[#e1e7f0] bg-[#fafcff] px-2 py-1">{rule.segment}</span>
                <span>{rule.transactionBase}</span>
            </div>

            <p className="mt-2 text-[12px] font-medium text-[#1f2536] md:text-[13px]">
                Jika beli {rule.antecedent}, tawarkan {rule.consequent}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#68728c]">
                <span>Confidence {rule.confidence}</span>
                <span>Support {rule.support}</span>
                <span>Lift {rule.lift}</span>
            </div>
        </div>
    );
}
