import CarouselSlideFrame from '@/features/auth/components/CarouselSlideFrame';
import { useAutoCarousel } from '@/features/auth/hooks/use-auto-carousel';

export default function AuthCarouselPanel({ carousel }) {
    const { slides, autoplayMs } = carousel;
    const { activeIndex } = useAutoCarousel(slides.length, autoplayMs);

    return (
        <div className="flex h-full flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
            <div className="relative min-h-[320px] flex-1 sm:min-h-[420px] xl:min-h-[520px]">
                {slides.map((slide, index) => (
                    <CarouselSlideFrame
                        key={slide.id}
                        slide={slide}
                        isActive={index === activeIndex}
                    />
                ))}
            </div>
        </div>
    );
}
