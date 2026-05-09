export default function ModalBase({
    open = false,
    children,
    className = '',
    panelClassName = '',
    onBackdropClick = null,
}) {
    if (!open) {
        return null;
    }

    return (
        <div
            onClick={onBackdropClick ?? undefined}
            className={`fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/55 px-3 py-3 sm:items-center sm:px-4 sm:py-6 ${className}`.trim()}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                className={`w-full max-w-lg max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[16px] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] sm:max-h-[calc(100vh-3rem)] sm:rounded-[12px] ${panelClassName}`.trim()}
            >
                {children}
            </div>
        </div>
    );
}
