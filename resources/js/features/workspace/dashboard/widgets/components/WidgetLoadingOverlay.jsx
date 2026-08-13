import { RefreshCw } from 'lucide-react';

export default function WidgetLoadingOverlay({ isVisible = false, text = 'Memuat data...' }) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[2px] transition-all duration-200">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 shadow-sm text-xs font-medium text-slate-700">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-blue" />
                <span>{text}</span>
            </div>
        </div>
    );
}
