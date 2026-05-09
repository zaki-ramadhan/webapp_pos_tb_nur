export default function Spinner({ className = '' }) {
    return (
        <span
            className={`inline-flex h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#f2356d] ${className}`.trim()}
            aria-hidden="true"
        />
    );
}
