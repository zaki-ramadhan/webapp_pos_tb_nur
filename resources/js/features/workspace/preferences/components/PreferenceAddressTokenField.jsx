import { CloseIcon } from '@/features/workspace/shared/Icons';

export default function PreferenceAddressTokenField({ field, tokens = [], onClear }) {
    if (tokens.length === 0) return null;
    return (
        <div className="group flex h-[34px] w-full items-center overflow-hidden rounded-[3px] border border-ui-border-medium bg-white shadow-inset-light">
            {field?.label ? (
                <span className="flex h-full min-w-[62px] items-center border-r border-ui-border-medium px-3 text-xs sm:text-sm text-text-light select-none bg-tab-view-inactive-text">
                    {field.label}
                </span>
            ) : null}
            <div className="flex h-full flex-1 items-center gap-2 px-3">
                {tokens.map((token) => (
                    <span
                        key={token.id}
                        className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-chip-blue bg-bg-chip-blue px-2 py-0.5 text-sm md:text-sm text-text-chip-blue"
                    >
                        <span>{token.label}</span>
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-text-chip-blue hover:text-text-danger-hover-alt transition-colors focus:outline-none"
                            aria-label={`Hapus ${token.label}`}
                        >
                            <CloseIcon className="h-3.5 w-3.5" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
