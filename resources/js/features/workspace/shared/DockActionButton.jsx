export default function DockActionButton({
    label,
    icon,
    tone = 'primary',
    className = '',
    onClick,
}) {
    const toneClassName =
        tone === 'danger'
            ? 'border-[#f08c8c] bg-[#f8b0b0] text-[#ff2d55] hover:bg-[#f59d9d]'
            : tone === 'muted'
              ? 'border-[#c8ccd4] bg-[#ececec] text-[#9aa0aa] hover:bg-[#e3e3e3]'
              : 'border-[#214d8d] bg-[#2d61ab] text-white hover:bg-[#27579c]';

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`inline-flex h-12 w-[84px] shrink-0 items-center justify-center rounded-[8px] border shadow-[0_5px_10px_rgba(24,53,97,0.18)] transition sm:h-[54px] sm:w-[92px] md:h-[60px] md:w-[104px] ${toneClassName} ${className}`.trim()}
        >
            {icon}
        </button>
    );
}
