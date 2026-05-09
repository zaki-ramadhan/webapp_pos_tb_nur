const TONE_CLASS_NAMES = {
    accent: 'border-t-[#ED3969] text-[#21283b]',
    neutral: 'border-t-[#c4cbd7] text-[#31394e]',
};

export default function SectionTab({
    label,
    tone = 'neutral',
    className = '',
    textClassName = 'text-[16px] font-medium',
}) {
    const toneClassName = TONE_CLASS_NAMES[tone] ?? TONE_CLASS_NAMES.neutral;

    return (
        <div
            className={`relative z-10 -mb-px inline-flex h-[36px] items-center rounded-t-[5px] border-x border-t-[2px] border-b-0 border-l-[#bcc3cf] border-r-[#bcc3cf] bg-white px-3.5 ${textClassName} ${toneClassName} ${className}`.trim()}
        >
            {label}
        </div>
    );
}
