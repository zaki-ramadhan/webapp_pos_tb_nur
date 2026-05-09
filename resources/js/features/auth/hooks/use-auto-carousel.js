import { useEffect, useState } from 'react';

export function useAutoCarousel(totalSlides, duration = 5000) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (totalSlides <= 1) {
            return undefined;
        }

        const interval = setInterval(() => {
            setActiveIndex((currentIndex) => (currentIndex + 1) % totalSlides);
        }, duration);

        return () => clearInterval(interval);
    }, [duration, totalSlides]);

    return {
        activeIndex,
        setActiveIndex,
    };
}
