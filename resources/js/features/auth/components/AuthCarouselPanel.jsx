export default function AuthCarouselPanel({ carousel }) {
    return (
        <div className="flex h-full flex-col">
            <div className="relative flex min-h-[320px] flex-1 overflow-hidden bg-[#f1f4fa] sm:min-h-[420px] xl:min-h-[520px]">
                <img
                    src={carousel.imageSrc}
                    alt={carousel.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.32)_50%,rgba(0,0,0,0.58)_100%)]" />
            </div>
        </div>
    );
}
