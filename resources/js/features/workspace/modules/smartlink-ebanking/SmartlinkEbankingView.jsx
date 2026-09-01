import { useState } from 'react';
import { toast } from 'sonner';
import RefreshButton from '@/features/workspace/shared/RefreshButton';

export default function SmartlinkEbankingView({ page }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(() => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');

    const handleSync = () => {
        setIsSyncing(true);
        toast.info('Menghubungi server internet banking BRI Mobile (BRIMO)...');
        setTimeout(() => {
            setIsSyncing(false);
            const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
            setLastSync(nowTime);
            toast.success('Mutasi rekening koran BRI Mobile berhasil diperbarui.');
        }, 1000);
    };

    return (
        <div className="flex h-full flex-col min-h-0 bg-tab-active-bg p-3 sm:p-4">
            <div className="flex flex-col flex-1 min-h-0 rounded-[6px] border border-ui-border-medium bg-white p-4 shadow-card-light">
                {/* Toolbar Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border pb-3">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            SmartLink e-Banking
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Konfigurasi akun internet banking BRI Mobile (BRIMO) Toko TB Nur
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <RefreshButton
                            label={isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Mutasi'}
                            onClick={handleSync}
                            loading={isSyncing}
                        />
                    </div>
                </div>

                {/* Account Table */}
                <div className="mt-4 flex flex-col flex-1 min-h-0">
                    <div className="overflow-x-auto border border-ui-border rounded-[4px]">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-table-header-bg border-b border-ui-border text-text-sidebar-muted font-medium">
                                    <th className="px-3 py-2.5">Bank / Layanan</th>
                                    <th className="px-3 py-2.5">No. Rekening</th>
                                    <th className="px-3 py-2.5">Atas Nama Rekening</th>
                                    <th className="px-3 py-2.5">User ID BRIMO</th>
                                    <th className="px-3 py-2.5">Akun Buku Besar</th>
                                    <th className="px-3 py-2.5 text-right">Saldo Mutasi</th>
                                    <th className="px-3 py-2.5 text-center">Status</th>
                                    <th className="px-3 py-2.5 text-right">Terakhir Sinkronisasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ui-border text-slate-800">
                                <tr className="hover:bg-slate-50">
                                    <td className="px-3 py-3 font-medium text-slate-900">
                                        BRI Mobile (BRIMO)
                                    </td>
                                    <td className="px-3 py-3 font-mono">
                                        0129-01-002847-50-8
                                    </td>
                                    <td className="px-3 py-3">
                                        TB NUR - OPERASIONAL
                                    </td>
                                    <td className="px-3 py-3 font-mono text-slate-600">
                                        brimo_tbnur_ops
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="font-mono text-slate-700">110102</span> - Bank BRI
                                    </td>
                                    <td className="px-3 py-3 text-right font-medium text-slate-900">
                                        Rp 181.112.000
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                                            Terhubung
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right text-slate-500">
                                        {lastSync}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Detail Configuration Section */}
                    <div className="mt-5 rounded-[4px] border border-ui-border bg-slate-50/50 p-4">
                        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                            Parameter Integrasi Rekening
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                                <span className="block text-slate-500">Bank Penyelenggara:</span>
                                <span className="font-medium text-slate-800 mt-0.5 block">Bank Rakyat Indonesia (Persero) Tbk</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Kanal Internet Banking:</span>
                                <span className="font-medium text-slate-800 mt-0.5 block">BRI Mobile (BRIMO Web/API)</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Pemanfaatan Data:</span>
                                <span className="font-medium text-slate-800 mt-0.5 block">Rekening Koran & Rekonsiliasi Bank</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Mode Sinkronisasi:</span>
                                <span className="font-medium text-slate-800 mt-0.5 block">Otomatis Terjadwal & Manual</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
