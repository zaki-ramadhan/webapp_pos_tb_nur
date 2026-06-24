export default function CarouselProgressDots({ total, activeIndex, onSelect }) {
    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: total }).map((_, index) => {
                const isActive = index === activeIndex;

                return (
                    <button
                        key={index}
                        type="button"
                        aria-label={`Go to slide ${index + 1}`}
                        onClick={() => onSelect(index)}
                        className={`h-2.5 transition-all ${
                            isActive ? 'w-8 bg-brand-primary' : 'w-2.5 bg-slate-300/80'
                        } rounded-full`}
                    />
                );
            })}
        </div>
    );
}
