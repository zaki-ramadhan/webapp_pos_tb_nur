import Spinner from '@/components/ui/Spinner';

export default function LoadingState({
    title = 'Memuat data',
    description = 'Mohon tunggu sebentar.',
    className = '',
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-[10px] border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_8px_20px_rgba(15,23,42,0.08)] ${className}`.trim()}
        >
            <Spinner />
            <h3 className="mt-4 text-[18px] font-medium text-[#4f5678]">{title}</h3>
            <p className="mt-2 max-w-md text-[14px] leading-6 text-[#6a7390]">{description}</p>
        </div>
    );
}
