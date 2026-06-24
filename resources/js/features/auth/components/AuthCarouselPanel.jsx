export default function AuthCarouselPanel({ carousel }) {
    return (
        <div className="flex h-full flex-col">
            <div className="relative flex min-h-[320px] flex-1 overflow-hidden bg-ui-bg-panel sm:min-h-[420px] xl:min-h-[520px]">
                <img
                    src={carousel.imageSrc}
                    alt={carousel.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-carousel-overlay-gradient" />
            </div>
        </div>
    );
}
