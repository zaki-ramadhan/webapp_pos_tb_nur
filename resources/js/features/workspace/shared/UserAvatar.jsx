export function getUserInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

export default function UserAvatar({
    name = '',
    initials,
    className = '',
    statusClassName = 'bg-[#41c776]',
}) {
    const resolvedInitials = initials ?? getUserInitials(name);

    return (
        <div
            className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-[#eceff5] text-sm font-semibold text-[#67708b] ${className}`.trim()}
        >
            {resolvedInitials}
            <span className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ${statusClassName}`} />
        </div>
    );
}
