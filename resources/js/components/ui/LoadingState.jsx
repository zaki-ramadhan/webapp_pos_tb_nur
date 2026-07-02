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
            <Spinner className="h-8 w-8 text-tab-active-border-t animate-spin" />
            <h3 className="mt-3 text-base font-normal text-slate-900 tracking-tight">{title}</h3>
            <p className="mt-1.5 max-w-xs text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
    );
}
