import { ThreeDot } from 'react-loading-indicators';

export default function WidgetLoadingOverlay({ isVisible = false, text = 'Memuat' }) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] transition-all duration-200">
            <ThreeDot color="#ffffff" size="medium" text="" textColor="" />
            {text ? (
                <span className="mt-2.5 text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] select-none">
                    {text}
                </span>
            ) : null}
        </div>
    );
}
