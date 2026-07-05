import { useEffect, useState, memo } from 'react';

export function getUserInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

const UserAvatar = memo(function UserAvatar({
    name = '',
    initials,
    imageUrl = null,
    className = '',
    showStatusIndicator = true,
    statusClassName = 'bg-green-460',
}) {
    const [hasImageError, setHasImageError] = useState(false);
    const resolvedInitials = initials ?? getUserInitials(name);
    const shouldShowImage = Boolean(imageUrl) && !hasImageError;

    useEffect(() => {
        setHasImageError(false);
    }, [imageUrl]);

    return (
        <div
            className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-table-row-border text-sm font-semibold text-text-muted ${className}`.trim()}
        >
            {shouldShowImage ? (
                <img
                    src={imageUrl}
                    alt={name ? `Foto profil ${name}` : 'Foto profil pengguna'}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setHasImageError(true)}
                />
            ) : (
                resolvedInitials
            )}
            {showStatusIndicator ? (
                <span className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ${statusClassName}`} />
            ) : null}
        </div>
    );
});

export default UserAvatar;
