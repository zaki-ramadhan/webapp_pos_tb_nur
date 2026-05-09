const toneClasses = {
    info: 'border-[#c8ddff] bg-[#eef5ff] text-[#45608f]',
    success: 'border-[#cfe8da] bg-[#edf9f2] text-[#3e7454]',
    warning: 'border-[#f7e0b8] bg-[#fff7e8] text-[#8b6533]',
    danger: 'border-[#f7c6d2] bg-[#fff1f5] text-[#9a4f66]',
};

export default function Notice({ children, tone = 'info', className = '' }) {
    return (
        <div
            className={`rounded-[10px] border px-4 py-3 text-[14px] leading-6 ${toneClasses[tone]} ${className}`.trim()}
        >
            {children}
        </div>
    );
}
