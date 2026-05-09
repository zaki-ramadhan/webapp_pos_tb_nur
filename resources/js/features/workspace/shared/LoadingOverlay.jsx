import ModalBase from '@/components/ui/ModalBase';

export default function LoadingOverlay({ open, loading }) {
    return (
        <ModalBase
            open={open}
            className="bg-[rgba(71,88,123,0.36)] backdrop-blur-[1px]"
            panelClassName="max-w-[340px] rounded-[10px] px-8 py-7 text-center shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
        >
            <div className="flex flex-col items-center">
                <span className="inline-flex h-12 w-12 animate-spin rounded-full border-[3px] border-[#f7c5d4] border-t-[#f2356d]" />
                <h2 className="mt-5 text-[22px] font-semibold text-[#4f5678]">{loading.title}</h2>
                <p className="mt-2 text-[15px] leading-6 text-[#6a7390]">{loading.description}</p>
            </div>
        </ModalBase>
    );
}
