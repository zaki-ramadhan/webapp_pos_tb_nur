export default function BrandMark({
    className = '',
    variant = 'default',
}) {
    const logoHeight = variant === 'decorative' ? 'h-[44px]' : 'h-[38px]';

    return (
        <div className={`inline-flex items-center justify-center ${className}`.trim()}>
            <img
                src="/logo_icon.png"
                alt="TB Nur Logo"
                className={`${logoHeight} w-auto object-contain rounded-md`}
            />
        </div>
    );
}
