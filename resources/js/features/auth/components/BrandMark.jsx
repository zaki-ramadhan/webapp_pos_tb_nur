import { memo, useEffect, useState } from 'react';

const BrandMark = memo(function BrandMark({
    className = '',
    variant = 'default',
    titleClassName = '',
    subtitleClassName = '',
    logoClassName = '',
}) {
    const logoHeight = variant === 'decorative' ? 'h-[36px]' : 'h-[38px]';
    const isDarkText = variant === 'decorative';
    const titleSize = variant === 'decorative'
        ? 'text-base sm:text-base md:text-lg'
        : 'text-base sm:text-lg md:text-xl';
    const gapClass = variant === 'decorative' ? 'gap-2' : 'gap-3';

    const [logoSrc, setLogoSrc] = useState(() => {
        if (typeof window === 'undefined') return '/logo_icon.png';
        try {
            return localStorage.getItem('logo_cache') || '/logo_icon.png';
        } catch {
            return '/logo_icon.png';
        }
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const cached = localStorage.getItem('logo_cache');
            if (cached) {
                setLogoSrc(cached);
                return;
            }
        } catch {}

        const img = new Image();
        img.src = '/logo_icon.png';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                localStorage.setItem('logo_cache', dataUrl);
                setLogoSrc(dataUrl);
            } catch (e) {
                // Ignore silent canvas failure
            }
        };
    }, []);

    return (
        <div className={`inline-flex items-center ${gapClass} select-none pointer-events-none ${className}`.trim()}>
            <img
                src={logoSrc}
                alt="TB Nur Logo"
                className={`${logoHeight} w-auto object-contain rounded-md select-none pointer-events-none ${logoClassName}`.trim()}
            />
            <div className="flex flex-col items-start text-left leading-tight select-none pointer-events-none">
                <span className={`${titleSize} font-bold tracking-tight select-none pointer-events-none ${isDarkText ? 'text-blue-900' : 'text-white'} ${titleClassName}`.trim()}>
                    TB Nur POS
                </span>
                <span className={`text-[9.5px] sm:text-xs md:text-[10.5px] font-medium tracking-normal select-none pointer-events-none ${isDarkText ? 'text-tab-primary-inactive-text' : 'text-white/75'} ${subtitleClassName}`.trim()}>
                    Toko Bangunan dan Material
                </span>
            </div>
        </div>
    );
});

export default BrandMark;
