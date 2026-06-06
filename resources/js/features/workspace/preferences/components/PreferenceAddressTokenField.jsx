import { CloseIcon } from '@/features/workspace/shared/Icons';

export default function PreferenceAddressTokenField({ field, tokens = [], onClear }) {
    if (tokens.length === 0) return null;
    return (
        <div className="group flex h-[34px] w-full items-center overflow-hidden rounded-[3px] border border-[#d8dde7] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            {field?.label ? (
                <span className="flex h-full min-w-[62px] items-center border-r border-[#d8dde7] px-3 text-[14px] md:text-[15px] text-[#7b8597] select-none bg-[#fcfdfe]">
                    {field.label}
                </span>
            ) : null}
            <div className="flex h-full flex-1 items-center gap-2 px-3">
                {tokens.map((token) => (
                    <span
                        key={token.id}
                        className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#7ea8e6] bg-[#eaf3ff] px-2 py-0.5 text-[13px] md:text-[14px] text-[#35507a]"
                    >
                        <span>{token.label}</span>
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-[#35507a] hover:text-[#ef4444] transition-colors focus:outline-none"
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
