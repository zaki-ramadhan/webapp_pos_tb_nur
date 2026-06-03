export default function PreferenceSideItem({ item, active, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick(item.id)}
            className={`relative flex h-[36px] w-full items-center justify-center rounded-l-[3px] border border-r-0 px-4 text-center text-[15px] transition sm:justify-end sm:text-right ${
                active
                    ? 'z-10 -mr-px border-[#d3d9e5] border-l-[3px] border-l-[#ED3969] bg-white font-semibold text-[#333c52] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]'
                    : 'border-[#b5bcc8] bg-[#c8c8c8] font-normal text-[#5f6679] hover:bg-[#cfcfd1]'
            }`.trim()}
        >
            {item.label}
        </button>
    );
}
