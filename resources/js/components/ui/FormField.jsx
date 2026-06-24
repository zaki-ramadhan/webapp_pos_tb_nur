export default function FormField({ label, htmlFor, children, hint = null, required = false, className = '' }) {
    return (
        <label className={`block ${className}`.trim()} htmlFor={htmlFor}>
            {label ? (
                <span className="mb-2 block text-xs sm:text-sm font-medium text-layout-text">
                    {label}
                    {required ? (
                        <span className="ml-0.5 text-tab-active-border-t" aria-hidden="true" title="Wajib diisi">*</span>
                    ) : null}
                </span>
            ) : null}
            {children}
            {hint ? <span className="mt-2 block text-[11px] sm:text-xs text-slate-400">{hint}</span> : null}
        </label>
    );
}
