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

    const [cachedUrl, setCachedUrl] = useState(() => {
        if (typeof window === 'undefined' || !imageUrl) return imageUrl;
        try {
            return localStorage.getItem(`avatar_cache_${imageUrl}`) || imageUrl;
        } catch {
            return imageUrl;
        }
    });

    const shouldShowImage = Boolean(cachedUrl) && !hasImageError;

    useEffect(() => {
        setHasImageError(false);
        if (!imageUrl) {
            setCachedUrl(null);
            return;
        }

        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem(`avatar_cache_${imageUrl}`);
                if (cached) {
                    setCachedUrl(cached);
                    return;
                }
            } catch {}
        }

        setCachedUrl(imageUrl);

        let active = true;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        img.onload = () => {
            if (!active) return;
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                localStorage.setItem(`avatar_cache_${imageUrl}`, dataUrl);
                setCachedUrl(dataUrl);
            } catch (e) {
                // Ignore canvas security errors for external CDNs (CORS)
            }
        };

        return () => {
            active = false;
        };
    }, [imageUrl]);

    return (
        <div
            className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-table-row-border text-sm font-semibold text-text-muted ${className}`.trim()}
        >
            {shouldShowImage ? (
                <img
                    src={cachedUrl}
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
