export default function BankReconcileActionCard({ isReconciled, isReconciling, onReconcile, onUnreconcile }) {
    return (
        <div className="border border-[#a8d4e7] rounded-[4px] bg-white overflow-hidden flex items-center justify-center min-h-[110px] h-full shadow-xs p-3">
            {isReconciled ? (
                <div className="flex flex-col items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] text-sm font-semibold bg-[#2a6d8c] text-white shadow-sm">
                        <svg width="12" height="10" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Ada di Rekening Koran</span>
                    </span>
                    <button
                        type="button"
                        disabled={isReconciling}
                        onClick={onUnreconcile}
                        className="text-sm text-slate-900 hover:text-rose-600 hover:underline mt-2.5 font-normal disabled:opacity-50 cursor-pointer"
                    >
                        {isReconciling ? 'Membatalkan...' : 'Batalkan kecocokan'}
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={isReconciling}
                    onClick={onReconcile}
                    className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-[#3a7593] hover:bg-[#2e607a] text-white px-5 py-2.5 text-sm font-normal transition shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                    <svg width="12" height="10" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Ada di Rekening Koran</span>
                </button>
            )}
        </div>
    );
}
