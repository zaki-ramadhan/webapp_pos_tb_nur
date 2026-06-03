import { CloseIcon } from '@/features/workspace/shared/Icons';

export default function PreferenceAddressTokenField({ tokens = [] }) {
    return (
        <div className="flex min-h-[36px] w-full flex-wrap items-center gap-2 rounded-[3px] border border-[#d8dde7] bg-white px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            {tokens.map((token) => (
                <span
                    key={token.id}
                    className="inline-flex items-center gap-2 rounded-[4px] border border-[#7ea8e6] bg-[#eaf3ff] px-2 py-1 text-[14px] text-[#35507a]"
                >
                    <span>{token.label}</span>
                    <CloseIcon className="h-3.5 w-3.5" />
                </span>
            ))}
        </div>
    );
}
