export function PurchasePaymentHeaderIconButton({ label, icon, onClick = null }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className="inline-flex h-[36px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue"
        >
            {icon}
        </button>
    );
}
