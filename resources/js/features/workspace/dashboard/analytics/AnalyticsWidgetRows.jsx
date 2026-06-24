export function AbcTopItemRow({ item }) {
    return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[7px] border border-abc-card-border bg-white px-3 py-2.5 shadow-abc-card sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
            <span
                className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-full px-2 text-sm font-semibold"
                style={{ backgroundColor: `${item.categoryColor}18`, color: item.categoryColor }}
            >
                {item.category}
            </span>
            <div className="min-w-0">
                <p className="break-words text-sm font-medium text-brand-darker sm:truncate">{item.name}</p>
                <p className="mt-1 text-sm text-blue-7c839b">
                    {item.code} • {item.unitsSold}
                </p>
            </div>
            <div className="col-start-2 text-left sm:col-start-auto sm:text-right">
                <p className="text-sm font-semibold text-brand-darker">{item.revenue}</p>
                <p className="mt-1 text-sm text-blue-7c839b">{item.share}</p>
            </div>
        </div>
    );
}

export function RuleSummaryRow({ rule }) {
    return (
        <div className="rounded-[7px] border border-abc-card-border bg-white px-3 py-2.5 shadow-abc-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ui-bg-panel pb-2 text-sm text-text-muted">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-ui-border-light bg-ui-bg-hover px-2 py-1">{rule.segment}</span>
                    <span>{rule.transactionBase}</span>
                </div>
                {rule.lift && (
                    <span className="text-sm font-medium text-blue-1e7ec1 bg-brand-blue-light px-2 py-0.5 rounded-full">
                        Lift: {rule.lift}
                    </span>
                )}
            </div>

            <div className="mt-2.5 text-sm leading-6 font-medium text-brand-darker">
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:flex-wrap">
                    <span className="text-slate-500">Jika membeli:</span>
                    <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-slate-50 border border-slate-100 px-2 py-1">
                        <span className="font-semibold text-slate-800">{rule.antecedent}</span>
                        {rule.antecedentAbc && (
                            <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-sm font-extrabold uppercase tracking-wider" style={{ backgroundColor: `${rule.antecedentColor}18`, color: rule.antecedentColor }}>
                                Kat {rule.antecedentAbc}
                            </span>
                        )}
                    </span>
                    <span className="text-slate-400 sm:mx-1">&rarr; Maka tawarkan:</span>
                    <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-slate-50 border border-slate-100 px-2 py-1">
                        <span className="font-semibold text-slate-800">{rule.consequent}</span>
                        {rule.consequentAbc && (
                            <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-sm font-extrabold uppercase tracking-wider" style={{ backgroundColor: `${rule.consequentColor}18`, color: rule.consequentColor }}>
                                Kat {rule.consequentAbc}
                            </span>
                        )}
                    </span>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-google-blue"></span>
                    Confidence: <span className="font-semibold text-slate-700">{rule.confidence}</span>
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-10b981"></span>
                    Support: <span className="font-semibold text-slate-700">{rule.support}</span>
                </span>
            </div>
        </div>
    );
}
