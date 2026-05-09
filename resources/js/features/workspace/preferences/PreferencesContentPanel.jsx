export default function PreferencesContentPanel({ children, className = '' }) {
    return (
        <div className="mx-2 mb-2 min-h-0 flex-1 overflow-visible rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:mx-3 sm:mb-3 sm:px-4 sm:py-5">
            <div className={className}>{children}</div>
        </div>
    );
}
