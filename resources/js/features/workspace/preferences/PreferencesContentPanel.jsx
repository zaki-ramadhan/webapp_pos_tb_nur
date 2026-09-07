export default function PreferencesContentPanel({ children, className = '' }) {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto -mt-px rounded-b-[4px] rounded-tr-[4px] border border-ui-border bg-white px-3.5 py-4 sm:px-5 sm:py-5">
            <div className={className}>{children}</div>
        </div>
    );
}
