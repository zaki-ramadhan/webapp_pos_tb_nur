import { ThreeDot } from 'react-loading-indicators';

export default function WidgetLoadingOverlay({ isVisible = false }) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-[2px] transition-all duration-200">
            <ThreeDot color="#ffffff" size="medium" text="" textColor="" />
        </div>
    );
}
