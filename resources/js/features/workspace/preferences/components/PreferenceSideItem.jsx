export default function PreferenceSideItem({ item, active, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick(item.id)}
            className={`relative flex h-[36px] w-full items-center justify-center rounded-[3px] md:rounded-r-none md:rounded-l-[3px] px-4 text-center text-base sm:justify-end sm:text-right ${
                active
                    ? 'z-20 -mr-px border border-ui-border md:border-r-0 border-l-[3px] border-l-tab-active-border-t bg-white font-normal text-section-tab-neutral-text shadow-inset-light'
                    : 'z-10 -mr-px border border-ui-border bg-disabled-border font-normal text-tab-inactive-text hover:bg-brand-primary hover:text-white'
            }`.trim()}
        >
            {item.label}
        </button>
    );
}
