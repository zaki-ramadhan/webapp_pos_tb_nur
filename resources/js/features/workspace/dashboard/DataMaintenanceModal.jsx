import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Database, Trash2, RotateCcw, AlertTriangle, Layers, Users, Package, ShoppingCart } from 'lucide-react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import Spinner from '@/components/ui/Spinner';

export default function DataMaintenanceModal({ open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusData, setStatusData] = useState(null);
    const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'confirm_purge' | 'confirm_reset_tx' | 'confirm_reseed'
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/backend/system/data-maintenance/status', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const json = await res.json();
            if (json.success && json.data) {
                setStatusData(json.data);
            }
        } catch {
            // Abaikan kegagalan jaringan sementara
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            setViewMode('overview');
            setPassword('');
            setPasswordError('');
            fetchStatus();
        }
    }, [open]);

    const handlePurge = async () => {
        if (!password.trim()) {
            setPasswordError('Harap masukkan kata sandi akun login Anda.');
            return;
        }

        setActionLoading(true);
        setPasswordError('');

        try {
            const res = await fetch('/api/backend/system/data-maintenance/purge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ password }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                setPasswordError(json.message || 'Gagal membersihkan data.');
                setActionLoading(false);
                return;
            }

            toast.success(json.message || 'Data demo berhasil dibersihkan.');
            onClose();
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (err) {
            setPasswordError('Terjadi kesalahan jaringan atau server: ' + err.message);
            setActionLoading(false);
        }
    };

    const handleResetTransactions = async () => {
        if (!password.trim()) {
            setPasswordError('Harap masukkan kata sandi akun login Anda.');
            return;
        }

        setActionLoading(true);
        setPasswordError('');

        try {
            const res = await fetch('/api/backend/system/data-maintenance/reset-transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ password }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                setPasswordError(json.message || 'Gagal mereset transaksi.');
                setActionLoading(false);
                return;
            }

            toast.success(json.message || 'Transaksi berhasil direset.');
            onClose();
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (err) {
            setPasswordError('Terjadi kesalahan jaringan atau server: ' + err.message);
            setActionLoading(false);
        }
    };

    const handleReseed = async () => {
        setActionLoading(true);

        try {
            const res = await fetch('/api/backend/system/data-maintenance/reseed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                toast.error(json.message || 'Gagal memuat ulang data seeder.');
                setActionLoading(false);
                return;
            }

            toast.success(json.message || 'Data seeder berhasil dimuat ulang.');
            onClose();
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (err) {
            toast.error('Terjadi kesalahan koneksi server: ' + err.message);
            setActionLoading(false);
        }
    };

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            disableClose={actionLoading}
            title="Pemeliharaan Data & Status Toko"
            headerIcon={Database}
            maxWidthClassName="max-w-[580px]"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <Spinner className="h-6 w-6 text-brand-blue" />
                    <p className="mt-2 text-xs font-medium">Memeriksa status database...</p>
                </div>
            ) : viewMode === 'overview' ? (
                <div className="space-y-4">
                    {/* Ringkasan Status Database */}
                    <div className="rounded-[6px] border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">Status Data Saat Ini</span>
                            {statusData?.is_demo_active ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                    Data Sampel / Demo Aktif
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                    Mode Bersih (Siap Operasional)
                                </span>
                            )}
                        </div>

                        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <div className="rounded-[4px] border border-slate-200 bg-white p-2 text-center">
                                <div className="flex items-center justify-center text-slate-400">
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                </div>
                                <div className="mt-1 text-base font-semibold text-slate-800">{statusData?.transactions_count ?? 0}</div>
                                <div className="text-[10px] text-slate-500">Transaksi</div>
                            </div>

                            <div className="rounded-[4px] border border-slate-200 bg-white p-2 text-center">
                                <div className="flex items-center justify-center text-slate-400">
                                    <Package className="h-3.5 w-3.5" />
                                </div>
                                <div className="mt-1 text-base font-semibold text-slate-800">{statusData?.products_count ?? 0}</div>
                                <div className="text-[10px] text-slate-500">Barang</div>
                            </div>

                            <div className="rounded-[4px] border border-slate-200 bg-white p-2 text-center">
                                <div className="flex items-center justify-center text-slate-400">
                                    <Users className="h-3.5 w-3.5" />
                                </div>
                                <div className="mt-1 text-base font-semibold text-slate-800">{statusData?.customers_count ?? 0}</div>
                                <div className="text-[10px] text-slate-500">Pelanggan</div>
                            </div>

                            <div className="rounded-[4px] border border-slate-200 bg-white p-2 text-center">
                                <div className="flex items-center justify-center text-slate-400">
                                    <Layers className="h-3.5 w-3.5" />
                                </div>
                                <div className="mt-1 text-base font-semibold text-slate-800">{statusData?.suppliers_count ?? 0}</div>
                                <div className="text-[10px] text-slate-500">Pemasok</div>
                            </div>
                        </div>
                    </div>

                    {/* Tindakan Pemeliharaan */}
                    <div className="space-y-2.5">
                        {/* Aksi 1: Bersihkan Data Demo */}
                        <div className="rounded-[6px] border border-red-200 bg-red-50/40 p-3 transition hover:border-red-300">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-800">
                                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                        <span>Bersihkan Seluruh Data Demo (Go-Live)</span>
                                    </div>
                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                                        Mengosongkan semua transaksi, stok, produk sampel, dan kontak fiktif. Akun Admin, Owner, dan Akun Perkiraan (COA) tetap aman.
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => {
                                        setPassword('');
                                        setPasswordError('');
                                        setViewMode('confirm_purge');
                                    }}
                                    className="shrink-0 h-8 px-3 text-xs"
                                >
                                    Bersihkan
                                </Button>
                            </div>
                        </div>

                        {/* Aksi 2: Reset Transaksi Saja */}
                        <div className="rounded-[6px] border border-slate-200 bg-white p-3 transition hover:border-slate-300">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                        <span>Reset Transaksi Saja</span>
                                    </div>
                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                                        Hanya menghapus riwayat faktur dan jurnal. Master produk dan kontak asli yang sudah diinput tetap tersimpan.
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                        setPassword('');
                                        setPasswordError('');
                                        setViewMode('confirm_reset_tx');
                                    }}
                                    className="shrink-0 h-8 px-3 text-xs"
                                >
                                    Reset Transaksi
                                </Button>
                            </div>
                        </div>

                        {/* Aksi 3: Muat Ulang Data Sampel */}
                        <div className="rounded-[6px] border border-blue-200 bg-blue-50/40 p-3 transition hover:border-blue-300">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue">
                                        <RotateCcw className="h-3.5 w-3.5 text-brand-blue" />
                                        <span>Muat Ulang Data Sampel (Seeder)</span>
                                    </div>
                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                                        Memasukkan kembali seluruh data simulasi seeder lengkap untuk keperluan pengujian dan demo fitur.
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="brand-blue"
                                    onClick={() => setViewMode('confirm_reseed')}
                                    className="shrink-0 h-8 px-3 text-xs"
                                >
                                    Muat Sampel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : viewMode === 'confirm_purge' ? (
                <div className="space-y-3.5">
                    <div className="flex items-start gap-3 rounded-[6px] border border-red-200 bg-red-50 p-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                        <div className="text-xs leading-relaxed text-red-900">
                            <p className="font-semibold">Konfirmasi Pembersihan Data Demo</p>
                            <p className="mt-0.5">
                                Seluruh transaksi, jurnal, barang contoh, dan kontak dummy akan dihapus permanen. Akun login Admin, Owner, dan Akun Perkiraan (COA) tidak akan terhapus.
                            </p>
                        </div>
                    </div>

                    <div>
                        <TextInput
                            type="password"
                            prefix="Kata Sandi"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan kata sandi akun Anda"
                            disabled={actionLoading}
                            className="h-[40px] rounded-[4px] border-slate-400"
                            prefixClassName="min-w-[100px] bg-input-prefix-bg px-3 text-xs sm:text-sm text-slate-600"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                        {passwordError ? (
                            <p className="mt-1 text-xs text-red-600 font-medium">{passwordError}</p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={actionLoading}
                            onClick={() => setViewMode('overview')}
                            className="h-9 px-4 text-xs"
                        >
                            Batal
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            loading={actionLoading}
                            loadingLabel="Membersihkan..."
                            onClick={handlePurge}
                            className="h-9 px-4 text-xs"
                        >
                            Konfirmasi Bersihkan
                        </Button>
                    </div>
                </div>
            ) : viewMode === 'confirm_reset_tx' ? (
                <div className="space-y-3.5">
                    <div className="flex items-start gap-3 rounded-[6px] border border-amber-200 bg-amber-50 p-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                        <div className="text-xs leading-relaxed text-amber-900">
                            <p className="font-semibold">Konfirmasi Reset Transaksi Saja</p>
                            <p className="mt-0.5">
                                Riwayat transaksi penjualan, pembelian, dan jurnal akan dikosongkan. Nomor urut nota akan kembali ke #0001. Master produk dan kontak Anda tidak akan dihapus.
                            </p>
                        </div>
                    </div>

                    <div>
                        <TextInput
                            type="password"
                            prefix="Kata Sandi"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan kata sandi akun Anda"
                            disabled={actionLoading}
                            className="h-[40px] rounded-[4px] border-slate-400"
                            prefixClassName="min-w-[100px] bg-input-prefix-bg px-3 text-xs sm:text-sm text-slate-600"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                        {passwordError ? (
                            <p className="mt-1 text-xs text-red-600 font-medium">{passwordError}</p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={actionLoading}
                            onClick={() => setViewMode('overview')}
                            className="h-9 px-4 text-xs"
                        >
                            Batal
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            loading={actionLoading}
                            loadingLabel="Mereset..."
                            onClick={handleResetTransactions}
                            className="h-9 px-4 text-xs"
                        >
                            Konfirmasi Reset Transaksi
                        </Button>
                    </div>
                </div>
            ) : viewMode === 'confirm_reseed' ? (
                <div className="space-y-3.5">
                    <div className="flex items-start gap-3 rounded-[6px] border border-blue-200 bg-blue-50 p-3">
                        <RotateCcw className="h-5 w-5 shrink-0 text-brand-blue mt-0.5" />
                        <div className="text-xs leading-relaxed text-blue-900">
                            <p className="font-semibold">Muat Ulang Seluruh Data Sampel Seeder</p>
                            <p className="mt-0.5">
                                Sistem akan menjalankan seeder database di latar belakang server untuk mengisi kembali barang contoh, transaksi kasir simulasi, dan grafik dashboard lengkap.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={actionLoading}
                            onClick={() => setViewMode('overview')}
                            className="h-9 px-4 text-xs"
                        >
                            Batal
                        </Button>
                        <Button
                            size="sm"
                            variant="brand-blue"
                            loading={actionLoading}
                            loadingLabel="Memuat seeder..."
                            onClick={handleReseed}
                            className="h-9 px-4 text-xs"
                        >
                            Muat Ulang Sekarang
                        </Button>
                    </div>
                </div>
            ) : null}
        </WorkspaceDialog>
    );
}
