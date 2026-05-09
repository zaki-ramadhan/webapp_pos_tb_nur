import { authUi } from '@/features/auth/lib/auth-ui';

function PlaceholderImage({ accent, badge }) {
    const accentStyles = {
        coral: 'from-[#ff8ba6] via-[#ffd2dc] to-[#fff7e7]',
        blue: 'from-[#85bbff] via-[#cfe3ff] to-[#f7fbff]',
        teal: 'from-[#8be0d1] via-[#d1f8f2] to-[#f7fffd]',
    };

    return (
        <div className={`${authUi.placeholderFrame} bg-gradient-to-br ${accentStyles[accent]}`}>
            <div className="relative w-full max-w-[420px] px-6 py-8">
                <div className="absolute left-8 top-0 h-14 w-14 rounded-[10px] bg-white/45" />
                <div className="absolute right-10 top-10 h-20 w-20 rounded-[12px] bg-white/40" />
                <div className="absolute bottom-6 left-10 h-16 w-16 rounded-[10px] bg-white/35" />

                <div className="relative overflow-hidden rounded-[12px] border border-white/70 bg-white/52 p-4 backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div className="rounded-md bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {badge}
                        </div>
                        <div className="rounded-md bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                            Image Slot
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-[1.15fr_0.85fr] gap-3">
                        <div className="rounded-[10px] bg-white/80 p-3">
                            <div className="h-28 rounded-[8px] bg-white/90" />
                            <div className="mt-3 h-2.5 w-24 rounded-sm bg-slate-200" />
                            <div className="mt-2 h-2.5 w-36 rounded-sm bg-slate-200/80" />
                            <div className="mt-2 h-2.5 w-32 rounded-sm bg-slate-200/80" />
                        </div>

                        <div className="space-y-3">
                            <div className="rounded-[10px] bg-white/80 p-3">
                                <div className="h-10 w-10 rounded-md bg-white" />
                                <div className="mt-3 h-2.5 w-16 rounded-sm bg-slate-200" />
                                <div className="mt-2 h-2.5 w-12 rounded-sm bg-slate-200/80" />
                            </div>
                            <div className="rounded-[10px] bg-white/80 p-3">
                                <div className="h-14 rounded-[8px] bg-white" />
                                <div className="mt-3 h-2.5 w-[4.5rem] rounded-sm bg-slate-200" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="h-9 w-28 rounded-md bg-[#f2356d]/85" />
                        <div className="flex gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CarouselSlideFrame({ slide, isActive }) {
    return (
        <article
            className={`absolute inset-0 transition-all duration-700 ${
                isActive
                    ? 'translate-x-0 opacity-100'
                    : 'pointer-events-none translate-x-6 opacity-0'
            }`}
            aria-hidden={!isActive}
        >
            <div className={`${authUi.slideSurface} h-full p-4 sm:p-5`}>
                {slide.imageSrc ? (
                    <div className="relative h-full min-h-[340px]">
                        <img
                            src={slide.imageSrc}
                            alt={slide.alt ?? slide.title}
                            className="h-full min-h-[340px] w-full rounded-[10px] object-cover"
                        />
                        <div className="absolute left-3 top-3 rounded-md bg-white/85 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                            {slide.badge}
                        </div>
                    </div>
                ) : (
                    <PlaceholderImage accent={slide.accent} badge={slide.badge} />
                )}
            </div>
        </article>
    );
}
