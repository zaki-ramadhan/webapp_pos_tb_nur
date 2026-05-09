const flagMap = {
    ID: {
        title: 'Bendera Indonesia',
        stripes: ['#e71d2b', '#ffffff'],
    },
};

export default function FlagIcon({ code = 'ID', className = '' }) {
    const flag = flagMap[code] ?? flagMap.ID;

    return (
        <svg
            viewBox="0 0 20 14"
            className={`h-[14px] w-5 overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] ${className}`.trim()}
            aria-label={flag.title}
            role="img"
        >
            <title>{flag.title}</title>
            <rect width="20" height="7" fill={flag.stripes[0]} />
            <rect y="7" width="20" height="7" fill={flag.stripes[1]} />
        </svg>
    );
}
