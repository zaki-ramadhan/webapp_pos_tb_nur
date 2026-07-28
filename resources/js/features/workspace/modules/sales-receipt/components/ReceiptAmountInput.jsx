export default function ReceiptAmountInput({ value, isDetail }) {
    const displayValue = !isDetail && String(value ?? '0') === '0' ? '' : String(value ?? '');

    return (
        <div className="flex h-[34px] overflow-hidden rounded-[4px] border border-ui-border bg-white">
            {isDetail ? (
                <span className="inline-flex items-center border-r border-ui-border-medium bg-input-prefix-bg-compact px-3 text-base text-text-inactive">
                    Rp
                </span>
            ) : null}
            <span className={`inline-flex flex-1 items-center px-3 text-base text-text-darkest ${isDetail ? 'justify-end font-semibold' : ''}`.trim()}>
                {displayValue}
            </span>
        </div>
    );
}
