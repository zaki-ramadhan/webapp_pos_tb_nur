export default function Divider({ label, className = '' }) {
    return (
        <div className={`flex items-center gap-3 text-sm text-slate-400 ${className}`.trim()}>
            <span className="h-px flex-1 bg-slate-200" />
            <span>{label}</span>
            <span className="h-px flex-1 bg-slate-200" />
        </div>
    );
}
