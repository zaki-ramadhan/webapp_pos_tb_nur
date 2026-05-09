export function SectionCardGrid({ items }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
                <article
                    key={item.name}
                    className="rounded-xl border border-[color:var(--color-line)] bg-white/90 p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                >
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">{item.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{item.summary}</p>
                </article>
            ))}
        </div>
    );
}
