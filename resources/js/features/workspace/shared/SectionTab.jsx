const TONE_CLASS_NAMES = {
    accent: 'border-t-brand-primary text-section-tab-accent-text',
    neutral: 'border-t-section-tab-neutral-border text-section-tab-neutral-text',
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
            className={`relative z-10 -mb-px inline-flex h-[36px] items-center rounded-t-[5px] border-x border-t-[2px] border-b-0 border-l-section-tab-border-x border-r-section-tab-border-x bg-white px-3.5 ${textClassName} ${toneClassName} ${className}`.trim()}
        >
            {label}
        </div>
    );
}
