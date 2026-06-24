export function EmployeeFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-2.5 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
            <label className="text-xs sm:text-sm text-brand-dark">
                {label}
                {required ? <span className="text-tab-active-border-t"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}
