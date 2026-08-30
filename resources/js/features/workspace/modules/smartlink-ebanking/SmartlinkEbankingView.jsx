import { useState } from 'react';
import { toast } from 'sonner';

export default function SmartlinkEbankingView({ page, onOpenContent }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(() => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');

    const smartlinkData = page?.smartlink || {
        provider: 'BRI Mobile (BRIMO)',
        providerCode: 'BRIMO',
        account: {
            bankName: 'Bank Rakyat Indonesia (BRI)',
            appType: 'BRI Mobile (BRIMO)',
            accountNumber: '0129-01-002847-50-8',
            accountName: 'TB NUR - OPERASIONAL',
            loginUserId: 'brimo_tbnur_ops',
            balance: 'Rp 181.112.000',
        },
    };

    const handleSyncMutasi = () => {
        setIsSyncing(true);
        toast.info('Menghubungi server internet banking BRI Mobile (BRIMO)...');
        setTimeout(() => {
            setIsSyncing(false);
            const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
            setLastSync(nowTime);
            toast.success('Mutasi rekening koran BRI Mobile berhasil diperbarui!');
        }, 1200);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-tab-active-bg p-3 sm:p-5 lg:p-6">
            <div className="mx-auto max-w-5xl space-y-5">
                {/* Header Banner */}
                <div className="rounded-xl border border-ui-border bg-white p-5 shadow-xs sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold text-lg">
                                BRI
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                        SmartLink e-Banking BRI Mobile (BRIMO)
                                    </h2>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Tersambung
                                    </span>
                                </div>
                                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
                                    Integrasi mutasi rekening otomatis untuk membaca rekening koran dan rekonsiliasi kas/bank Toko TB Nur.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                            <button
                                type="button"
                                onClick={handleSyncMutasi}
                                disabled={isSyncing}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-brand-blue-hover transition disabled:opacity-50 cursor-pointer"
                            >
                                <svg
                                    className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Mutasi'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account Details & Status Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-ui-border bg-white p-5 shadow-xs">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rekening Terhubung</span>
                        <div className="mt-2 text-base font-bold text-slate-800">
                            {smartlinkData.account.accountNumber}
                        </div>
                        <div className="text-xs text-slate-600 font-medium mt-0.5">
                            {smartlinkData.account.accountName}
                        </div>
                    </div>

                    <div className="rounded-xl border border-ui-border bg-white p-5 shadow-xs">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estimasi Saldo Mutasi</span>
                        <div className="mt-2 text-base font-bold text-emerald-600">
                            {smartlinkData.account.balance}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                            Sinkronisasi terakhir: {lastSync}
                        </div>
                    </div>

                    <div className="rounded-xl border border-ui-border bg-white p-5 shadow-xs sm:col-span-2 lg:col-span-1">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Layanan Terdaftar</span>
                        <div className="mt-2 text-base font-bold text-slate-800">
                            {smartlinkData.account.appType}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                            User ID: <span className="font-mono text-slate-700">{smartlinkData.account.loginUserId}</span>
                        </div>
                    </div>
                </div>

                {/* Integration Flow Cards (Rekening Koran & Rekonsiliasi) */}
                <div className="rounded-xl border border-ui-border bg-white p-5 shadow-xs sm:p-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">
                        Alur Integrasi Kas & Bank TB Nur
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Step 1: Rekening Koran */}
                        <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
                                    <h4 className="text-sm font-semibold text-slate-800">Rekening Koran (Bank Statement)</h4>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Membaca dan menampilkan seluruh baris mutasi debet & kredit dari rekening BRI Toko TB Nur secara terperinci.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">Membaca data SmartLink</span>
                                <button
                                    type="button"
                                    onClick={() => onOpenContent?.('bank-statement')}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                                >
                                    Buka Rekening Koran &rarr;
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Rekonsiliasi Bank */}
                        <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">2</span>
                                    <h4 className="text-sm font-semibold text-slate-800">Rekonsiliasi Bank (CSV vs Jurnal)</h4>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Mencocokkan file mutasi/CSV dari bank dengan catatan transaksi internal (Jurnal Accurate / Faktur Penjualan & Pembelian) untuk memastikan saldo klop.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">Pencocokan Transaksi</span>
                                <button
                                    type="button"
                                    onClick={() => onOpenContent?.('bank-reconciliation')}
                                    className="text-xs font-semibold text-purple-600 hover:text-purple-800 inline-flex items-center gap-1 cursor-pointer"
                                >
                                    Buka Rekonsiliasi Bank &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
