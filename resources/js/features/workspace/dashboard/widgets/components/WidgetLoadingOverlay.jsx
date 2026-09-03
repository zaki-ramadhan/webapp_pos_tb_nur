import { RefreshCw } from 'lucide-react';

export default function WidgetLoadingOverlay({ isVisible = false, text = 'Memuat data...' }) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[1px] transition-all duration-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>{text}</span>
            </div>
        </div>
    );
}
