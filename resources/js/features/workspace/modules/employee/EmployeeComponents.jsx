export function EmployeeFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-2.5 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
            <label className="text-xs sm:text-sm text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}
