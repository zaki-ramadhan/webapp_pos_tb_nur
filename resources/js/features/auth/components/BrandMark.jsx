export default function BrandMark({
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

    return (
        <div className={`inline-flex items-center ${gapClass} select-none pointer-events-none ${className}`.trim()}>
            <img
                src="/logo_icon.png"
                alt="TB Nur Logo"
                className={`${logoHeight} w-auto object-contain rounded-md select-none pointer-events-none ${logoClassName}`.trim()}
            />
            <div className="flex flex-col items-start text-left leading-tight select-none pointer-events-none">
                <span className={`${titleSize} font-bold tracking-tight select-none pointer-events-none ${isDarkText ? 'text-blue-133663' : 'text-white'} ${titleClassName}`.trim()}>
                    TB Nur POS
                </span>
                <span className={`text-[9.5px] sm:text-xs md:text-[10.5px] font-medium tracking-normal select-none pointer-events-none ${isDarkText ? 'text-tab-primary-inactive-text' : 'text-white/75'} ${subtitleClassName}`.trim()}>
                    Toko Bangunan dan Material
                </span>
            </div>
        </div>
    );
}
