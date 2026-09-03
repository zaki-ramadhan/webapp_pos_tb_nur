import { ThreeDot } from 'react-loading-indicators';

export default function WidgetLoadingOverlay({ isVisible = false, text = 'Memuat' }) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px] transition-all duration-200">
            <ThreeDot color="#ffffff" size="medium" text={text} textColor="#ffffff" />
        </div>
    );
}
