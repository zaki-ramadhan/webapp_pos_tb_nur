function HeaderColumn({ title, iconPath, borderColor = 'border-[#0c6b96]', children }) {
    return (
        <div className="flex flex-col">
            <div className={`border-t-[7.5px] ${borderColor} bg-white px-3 py-2.5 flex items-center justify-between`}>
                <div className="flex items-center gap-2.5 font-bold text-black text-base uppercase tracking-wider">
                    <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
                    </svg>
                    <span>{title}</span>
                </div>
            </div>
            <div className="bg-[#f1f5f9] border border-slate-200 px-3 py-2 flex items-center justify-between text-sm min-h-[36px] rounded-[3px]">
                {children}
            </div>
        </div>
    );
}

export default function BankReconciliationHeader({ lastKnownBalance = '0', rawBalanceNum = 0, unreconciledCount = 0, hasData = false }) {
    const isNegative = rawBalanceNum < 0 || String(lastKnownBalance).includes('-');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Left Section: REKENING BANK */}
            <HeaderColumn
                title="REKENING BANK"
                iconPath="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                borderColor="border-[#0c6b96]"
            />

            {/* Right Section: JURNAL SISTEM */}
            <HeaderColumn
                title="JURNAL SISTEM"
                iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                borderColor="border-[#f2356d]"
            >
                {hasData ? (
                    <>
                        <span className="font-normal text-slate-900">
                            Saldo &nbsp;
                            <span className={`font-semibold ${isNegative ? 'text-red-600' : 'text-slate-900'}`}>
                                Rp {lastKnownBalance}
                            </span>
                        </span>
                        {unreconciledCount > 0 && (
                            <span className="text-red-700 font-medium flex items-center gap-1.5 text-sm">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                </svg>
                                {unreconciledCount} data belum cocok
                            </span>
                        )}
                    </>
                ) : null}
            </HeaderColumn>
        </div>
    );
}
