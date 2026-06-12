import Spinner from '@/components/ui/Spinner';

export default function DockActionButton({
    label,
    icon,
    tone = 'primary',
    className = '',
    onClick,
    disabled = false,
    loading = false,
}) {
    const isDisabled = disabled || loading;
    const isSaveButton = typeof label === 'string' && label.toLowerCase().includes('simpan');
    const resolvedTone = isSaveButton ? 'primary' : tone;

    let toneClassName = '';
    if (isDisabled) {
        // Disabled state: static gray border/background, no hover/active effects, pointer-events-none blocks all cursor triggers
        toneClassName = 'border-[#c8ccd4] bg-[#ececec] text-[#9aa0aa] cursor-default opacity-55 shadow-none pointer-events-none';
    } else {
        if (resolvedTone === 'danger') {
            toneClassName = 'border-[#f08c8c] bg-[#f8b0b0] text-[#ff2d55] hover:bg-[#f59d9d] active:bg-[#e88b8b] cursor-pointer';
        } else if (resolvedTone === 'muted') {
            toneClassName = 'border-[#c8ccd4] bg-[#ececec] text-[#9aa0aa] hover:bg-[#e3e3e3] active:bg-[#d5d5d5] cursor-pointer';
        } else {
            toneClassName = 'border-[#214d8d] bg-[#2d61ab] text-white hover:bg-[#27579c] active:bg-[#1d447d] cursor-pointer';
        }
    }

    return (
        <button
            type="button"
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-label={label}
            title={label}
            className={`inline-flex h-12 w-[84px] shrink-0 items-center justify-center rounded-[8px] border transition sm:h-[54px] sm:w-[92px] md:h-[60px] md:w-[104px] shadow-[0_5px_10px_rgba(24,53,97,0.18)] ${toneClassName} ${className}`.trim()}
        >
            {loading ? (
                <Spinner className="h-8 w-8 text-current animate-spin" />
            ) : (
                icon
            )}
        </button>
    );
}
