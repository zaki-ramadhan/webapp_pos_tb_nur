import ModalBase from '@/components/ui/ModalBase';
import Spinner from '@/components/ui/Spinner';

export default function LoadingOverlay({ open, loading }) {
    return (
        <ModalBase
            open={open}
            className="bg-slate-950/10 backdrop-blur-[1.5px]"
            panelClassName="max-w-[280px] rounded-lg border border-slate-200 bg-white p-6 shadow-sm text-center"
        >
            <div className="flex flex-col items-center py-1">
                <Spinner className="h-12 w-12 text-tab-active-border-t animate-spin" />
                <h2 className="mt-4 text-base font-semibold text-slate-900 tracking-tight">
                    {loading.title}
                </h2>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                    {loading.description}
                </p>
            </div>
        </ModalBase>
    );
}
