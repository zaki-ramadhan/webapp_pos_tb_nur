export { parsePercentValue, formatCompactLabel, getMetric, getProductImageUrl } from './analyticsUtils';

export function WidgetSection({ title, caption = null, collapsible = false, expanded = true, onToggle = null, children }) {
    return (
        <section className="min-w-0 rounded-[8px] border border-[#e0e6ef] bg-white px-3 py-3 shadow-[0_4px_12px_rgba(15,23,42,0.03)]">
            <div 
                className={`border-b border-[#e6ebf2] pb-2.5 ${collapsible ? 'cursor-pointer select-none hover:bg-slate-50/50 transition-colors' : ''}`}
                onClick={collapsible && onToggle ? onToggle : undefined}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 border-l-[3px] border-l-[#5f8fd5] pl-3 pr-2">
                        <h4 className="text-base font-semibold leading-tight text-[#1f2536] md:text-base">{title}</h4>
                        {caption ? (
                            <p className="mt-1.5 break-words text-sm leading-5 text-[#7c839b]">{caption}</p>
                        ) : null}
                    </div>
                    {collapsible && (
                        <button
                            type="button"
                            className="shrink-0 rounded-md p-1.5 hover:bg-slate-100 transition-colors text-[#61718f] mr-1.5 sm:mr-3"
                            aria-label={expanded ? "Sembunyikan detail" : "Tampilkan detail"}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            {(!collapsible || expanded) && (
                <div className="pt-3">{children}</div>
            )}
        </section>
    );
}

export function InsightCallout({ children, tone = 'blue' }) {
    const toneConfig =
        tone === 'amber'
            ? {
                  wrapper: 'border-[#ead7b2] bg-[linear-gradient(180deg,#fffaf1_0%,#fff5e6_100%)] text-[#6d5831]',
                  accent: 'bg-[#d6a54a]',
                  icon: 'text-[#b7791f]',
                  label: 'Perlu perhatian',
               }
            : {
                  wrapper: 'border-[#d8e5f3] bg-[linear-gradient(180deg,#f6faff_0%,#edf4fb_100%)] text-[#435b78]',
                  accent: 'bg-[#6f97c5]',
                  icon: 'text-[#4f78a7]',
                  label: 'Catatan singkat',
               };

    return (
        <div className={`relative overflow-hidden rounded-[8px] border px-3 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)] ${toneConfig.wrapper}`.trim()}>
            <span className={`absolute inset-y-0 left-0 w-[4px] ${toneConfig.accent}`.trim()} aria-hidden="true" />
            <div className="flex items-start gap-2.5 pl-1">
                <span className={`mt-0.5 shrink-0 ${toneConfig.icon}`.trim()} aria-hidden="true">
                    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                        <path d="M10 2.25a7.75 7.75 0 1 0 7.75 7.75A7.76 7.76 0 0 0 10 2.25Zm0 10.94a1.03 1.03 0 1 1 1.03-1.03A1.03 1.03 0 0 1 10 13.19Zm.94-4.53-.2 2.22H9.26l-.2-2.22V5.91h1.88Z" />
                    </svg>
                </span>

                <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] opacity-80">{toneConfig.label}</p>
                    <p className="mt-1.5 text-sm leading-5">{children}</p>
                </div>
            </div>
        </div>
    );
}

export function SummaryStrip({ items }) {
    return (
        <div className="rounded-[8px] bg-[linear-gradient(180deg,#f7fafd_0%,#f1f5fa_100%)] p-2">
            <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
                {items.map((item) => (
                    <div key={item.label} title="" className="rounded-[7px] border border-[#dce3ed] bg-white px-3 py-3 shadow-[0_6px_14px_rgba(15,23,42,0.04)]">
                        <p title="" className="text-sm font-medium text-[#7d88a2]">
                            {item.label}
                        </p>
                        <p title="" className="mt-2 text-xl font-semibold leading-none text-[#1f2536] md:text-2xl 2xl:text-3xl">
                            {item.value}
                        </p>
                        {item.helper ? (
                            <p title="" className="mt-2 text-sm leading-5 text-[#66718c]">
                                {item.helper}
                            </p>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ActionList({ items }) {
    return (
        <div className="space-y-2.5">
            {items.map((item, index) => (
                <div
                    key={`${item.title}-${index}`}
                    className="rounded-[7px] border border-[#dce3ed] bg-white px-3 py-2.5 shadow-[0_6px_14px_rgba(15,23,42,0.04)]"
                >
                    <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#4f80c4]" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1f2536]">{item.title}</p>
                            <p className="mt-1 text-sm leading-5 text-[#68728c]">{item.detail}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
