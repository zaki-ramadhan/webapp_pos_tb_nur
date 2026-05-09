export default function FormField({ label, htmlFor, children, hint = null, className = '' }) {
    return (
        <label className={`block ${className}`.trim()} htmlFor={htmlFor}>
            {label ? (
                <span className="mb-2 block text-[15px] font-medium text-[#56527b]">{label}</span>
            ) : null}
            {children}
            {hint ? <span className="mt-2 block text-xs text-slate-400">{hint}</span> : null}
        </label>
    );
}
