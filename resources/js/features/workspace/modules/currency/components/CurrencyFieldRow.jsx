export default function CurrencyFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[180px_1fr] lg:items-start">
            <label className="pt-2 text-xs sm:text-sm leading-6 text-brand-dark">
                {label}
                {required ? <span className="text-tab-active-border-t"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}
