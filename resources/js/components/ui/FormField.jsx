export default function FormField({ label, htmlFor, children, hint = null, required = false, className = '' }) {
    return (
        <label className={`block ${className}`.trim()} htmlFor={htmlFor}>
            {label ? (
                <span className="mb-2 block text-[15px] font-medium text-[#56527b]">
                    {label}
                    {required ? (
                        <span className="ml-0.5 text-[#ED3969]" aria-hidden="true" title="Wajib diisi">*</span>
                    ) : null}
                </span>
            ) : null}
            {children}
            {hint ? <span className="mt-2 block text-xs text-slate-400">{hint}</span> : null}
        </label>
    );
}
