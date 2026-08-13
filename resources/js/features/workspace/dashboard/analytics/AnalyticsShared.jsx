export { parsePercentValue, formatCompactLabel, getMetric, getProductImageUrl, getBuildingStoreLayoutRecommendation } from './analyticsUtils';

export function HighlightProductText({ text, itemA, itemAId, itemB, itemBId }) {
    if (!text) return null;
    if (!itemA && !itemB) return <span>{text}</span>;

    const handleOpenProduct = (e, productId, productName) => {
        e.preventDefault();
        e.stopPropagation();

        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent('workspace:open-page', {
                    detail: {
                        pageId: 'items-services',
                        recordId: productId ?? undefined,
                        label: productName,
                        tabLabel: productName,
                        openForm: Boolean(productId),
                    },
                })
            );
        }
    };

    const escapeRegex = (str) => (str ? str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '');
    const patterns = [itemA, itemB].filter(Boolean).map(escapeRegex);
    if (!patterns.length) return <span>{text}</span>;

    const regex = new RegExp(`(${patterns.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, index) => {
                const lowerPart = part.toLowerCase();
                const isItemA = itemA && lowerPart === itemA.toLowerCase();
                const isItemB = itemB && lowerPart === itemB.toLowerCase();

                if (isItemA) {
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={(e) => handleOpenProduct(e, itemAId, itemA)}
                            className="font-medium underline text-blue-700 hover:text-blue-900 cursor-pointer underline-offset-2 transition-colors mx-0.5 inline-baseline focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-sm"
                            title={`Klik untuk membuka halaman & detail data ${itemA}`}
                        >
                            {part}
                        </button>
                    );
                }

                if (isItemB) {
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={(e) => handleOpenProduct(e, itemBId, itemB)}
                            className="font-medium underline text-blue-700 hover:text-blue-900 cursor-pointer underline-offset-2 transition-colors mx-0.5 inline-baseline focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-sm"
                            title={`Klik untuk membuka halaman & detail data ${itemB}`}
                        >
                            {part}
                        </button>
                    );
                }

                return <span key={index}>{part}</span>;
            })}
        </span>
    );
}

export function AbcCategoryLegend() {
    return (
        <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50/20 p-3 shadow-widget-tiny select-none">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">Petunjuk Kategori Prioritas Barang (Analisis ABC):</h5>
            <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-md border border-tab-active-border-x bg-white p-2.5 shadow-widget-small">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0 bg-badge-group-a">
                            Kat. A
                        </span>
                        <span className="text-xs font-semibold text-brand-darker">(Utama)</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">80% omzet</span> toko. Prioritas utama, stok wajib dijaga ketat.</p>
                </div>
                <div className="rounded-md border border-emerald-100 bg-white p-2.5 shadow-widget-small">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0 bg-green-410">
                            Kat. B
                        </span>
                        <span className="text-xs font-semibold text-brand-darker">(Stabil)</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">15% omzet</span> toko. Penjualan stabil untuk kebutuhan rutin.</p>
                </div>
                <div className="rounded-md border border-amber-100 bg-white p-2.5 shadow-widget-small">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold text-white shrink-0 bg-warning">
                            Kat. C
                        </span>
                        <span className="text-xs font-semibold text-brand-darker">(Tambahan)</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Menyumbang <span className="font-semibold text-slate-700">5% omzet</span> toko. Produk pelengkap/aksesoris penunjang.</p>
                </div>
            </div>
        </div>
    );
}

export function WidgetSection({ title, caption = null, collapsible = false, expanded = true, onToggle = null, children }) {
    return (
        <section className="min-w-0 rounded-[8px] border border-ui-border-light bg-white px-3 py-3 shadow-analytics-light">
            <div 
                className={`border-b border-ui-border-light pb-2.5 ${collapsible ? 'cursor-pointer select-none hover:bg-slate-50/50 transition-colors' : ''}`}
                onClick={collapsible && onToggle ? onToggle : undefined}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 border-l-[3px] border-blue-light-50 pl-3 pr-2">
                        <h4 className="text-sm font-medium leading-tight text-brand-darker">{title}</h4>
                        {caption ? (
                            <p className="mt-1 break-words text-sm leading-normal text-text-light">{caption}</p>
                        ) : null}
                    </div>
                    {collapsible && (
                        <button
                            type="button"
                            className="shrink-0 rounded-md p-1.5 hover:bg-slate-100 transition-colors text-chart-text mr-1.5 sm:mr-3"
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
                  wrapper: 'border-warning-border bg-[linear-gradient(180deg,#fffaf1_0%,#fff5e6_100%)] text-orange-950',
                  accent: 'bg-orange-430',
                  icon: 'text-orange-820',
                  label: 'Perlu perhatian',
               }
            : {
                  wrapper: 'border-abc-card-border bg-[linear-gradient(180deg,#f6faff_0%,#edf4fb_100%)] text-text-medium',
                  accent: 'bg-brand-blue-border',
                  icon: 'text-blue-520',
                  label: 'Catatan singkat',
               };

    return (
        <div className={`relative overflow-hidden rounded-[8px] border px-3 py-3 shadow-analytics-card ${toneConfig.wrapper}`.trim()}>
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
                    <div key={item.label} title="" className="rounded-[7px] border border-abc-card-border bg-white px-3 py-3 shadow-abc-card">
                        <p title="" className="text-sm font-medium text-text-light">
                            {item.label}
                        </p>
                        <p title="" className="mt-2 text-xl font-semibold leading-none text-brand-darker md:text-2xl 2xl:text-3xl">
                            {item.value}
                        </p>
                        {item.helper ? (
                            <p title="" className="mt-2 text-sm leading-5 text-text-muted">
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
                    className="rounded-[7px] border border-abc-card-border bg-white px-3 py-2.5 shadow-abc-card"
                >
                    <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-470" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-brand-darker">{item.title}</p>
                            <p className="mt-1 text-sm leading-5 text-text-muted">{item.detail}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
