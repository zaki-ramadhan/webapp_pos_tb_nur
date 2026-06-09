export default function BrandMark({
    className = '',
    variant = 'default',
}) {
    const logoHeight = variant === 'decorative' ? 'h-[44px]' : 'h-[38px]';
    const isDarkText = variant === 'decorative';

    return (
        <div className={`inline-flex items-center gap-3 select-none pointer-events-none ${className}`.trim()}>
            <img
                src="/logo_icon.png"
                alt="TB Nur Logo"
                className={`${logoHeight} w-auto object-contain rounded-md select-none pointer-events-none`}
            />
            <div className="flex flex-col items-start text-left leading-tight select-none pointer-events-none">
                <span className={`text-[17px] sm:text-[19px] md:text-[20px] font-bold tracking-tight select-none pointer-events-none ${isDarkText ? 'text-[#1b315d]' : 'text-white'}`}>
                    TB Nur
                </span>
                <span className={`text-[9.5px] sm:text-[10px] md:text-[10.5px] font-medium tracking-normal select-none pointer-events-none ${isDarkText ? 'text-[#56607c]' : 'text-white/75'}`}>
                    toko bangunan dan material
                </span>
            </div>
        </div>
    );
}
