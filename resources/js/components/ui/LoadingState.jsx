import Spinner from '@/components/ui/Spinner';

export default function LoadingState({
    title = 'Memuat data',
    description = 'Mohon tunggu sebentar.',
    className = '',
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white px-6 py-8 text-center shadow-sm ${className}`.trim()}
        >
            <Spinner className="h-8 w-8 text-[#ED3969] animate-spin" />
            <h3 className="mt-3 text-[15px] font-semibold text-slate-900 tracking-tight">{title}</h3>
            <p className="mt-1.5 max-w-xs text-[13px] text-slate-600 leading-relaxed">{description}</p>
        </div>
    );
}
