export default function PreferenceSideItem({ item, active, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick(item.id)}
            className={`relative flex h-[36px] w-full items-center justify-center rounded-l-[3px] border border-r-0 px-4 text-center text-base transition sm:justify-end sm:text-right ${
                active
                    ? 'z-10 -mr-px border-tab-overflow-panel-border border-l-[3px] border-l-tab-active-border-t bg-ui-bg-hover font-normal text-section-tab-neutral-text shadow-inset-light'
                    : 'border-tab-active-border-x bg-disabled-border font-normal text-tab-inactive-text hover:bg-tab-primary-inactive-hover-bg'
            }`.trim()}
        >
            {item.label}
        </button>
    );
}
