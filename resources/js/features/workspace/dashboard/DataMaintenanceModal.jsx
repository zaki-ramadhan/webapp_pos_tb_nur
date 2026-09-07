import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
            // Abaikan kesalahan koneksi sementara
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
            setPasswordError('Masukkan kata sandi akun login Anda.');
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
            }, 1000);
        } catch (err) {
            setPasswordError('Terjadi kesalahan jaringan atau server: ' + err.message);
            setActionLoading(false);
        }
    };

    const handleResetTransactions = async () => {
        if (!password.trim()) {
            setPasswordError('Masukkan kata sandi akun login Anda.');
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
            }, 1000);
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
            }, 1000);
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
            title="Pemeliharaan Data Sistem"
            headerIcon={null}
            maxWidthClassName="max-w-[560px]"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-800">
                    <Spinner className="h-6 w-6 text-brand-blue" />
                    <p className="mt-2 text-sm font-medium">Memeriksa status database...</p>
                </div>
            ) : viewMode === 'overview' ? (
                <div className="space-y-4">
                    {/* Ringkasan Data Database */}
                    <div className="border border-slate-300 rounded-[4px] bg-white overflow-hidden">
                        <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-300 flex justify-between items-center text-sm font-medium text-slate-800">
                            <span>Status Data Saat Ini:</span>
                            <span className="font-semibold text-slate-900">
                                {statusData?.is_demo_active ? 'Data Sampel / Demo' : 'Mode Bersih (Siap Operasional)'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 text-sm">
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-800">Transaksi:</span>
                                <span className="font-semibold text-slate-900">{statusData?.transactions_count ?? 0}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-800">Barang & Jasa:</span>
                                <span className="font-semibold text-slate-900">{statusData?.products_count ?? 0}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-800">Pelanggan:</span>
                                <span className="font-semibold text-slate-900">{statusData?.customers_count ?? 0}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-800">Pemasok:</span>
                                <span className="font-semibold text-slate-900">{statusData?.suppliers_count ?? 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tindakan Pemeliharaan */}
                    <div className="space-y-3">
                        {/* Aksi 1: Bersihkan Seluruh Data Demo */}
                        <div className="border border-slate-300 rounded-[4px] p-3.5 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-slate-900">Bersihkan Data Demo (Go-Live)</h3>
                                    <p className="text-sm text-slate-800 leading-normal">
                                        Menghapus seluruh transaksi, stok, produk sampel, dan kontak fiktif. Akun Admin, Owner, dan Akun Perkiraan (COA) tetap aman.
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
                                    className="shrink-0 h-9 px-4 text-sm rounded-[4px] shadow-none"
                                >
                                    Bersihkan Data
                                </Button>
                            </div>
                        </div>

                        {/* Aksi 2: Reset Transaksi Saja */}
                        <div className="border border-slate-300 rounded-[4px] p-3.5 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-slate-900">Reset Transaksi Saja</h3>
                                    <p className="text-sm text-slate-800 leading-normal">
                                        Hanya menghapus riwayat transaksi dan faktur. Master barang dan kontak yang sudah diinput tetap tersimpan utuh.
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
                                    className="shrink-0 h-9 px-4 text-sm rounded-[4px] shadow-none border-slate-400 text-slate-800 hover:bg-slate-50"
                                >
                                    Reset Transaksi
                                </Button>
                            </div>
                        </div>

                        {/* Aksi 3: Muat Ulang Data Sampel */}
                        <div className="border border-slate-300 rounded-[4px] p-3.5 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-slate-900">Muat Ulang Data Sampel (Seeder)</h3>
                                    <p className="text-sm text-slate-800 leading-normal">
                                        Memasukkan kembali seluruh data simulasi seeder (barang contoh dan transaksi) untuk keperluan demo atau uji coba.
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="brand-blue"
                                    onClick={() => setViewMode('confirm_reseed')}
                                    className="shrink-0 h-9 px-4 text-sm rounded-[4px] shadow-none"
                                >
                                    Muat Sampel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : viewMode === 'confirm_purge' ? (
                <div className="space-y-4">
                    <div className="border border-slate-300 rounded-[4px] p-3.5 bg-slate-50 text-sm text-slate-800 leading-relaxed">
                        <p className="font-semibold text-slate-900">Konfirmasi Pembersihan Data Demo</p>
                        <p className="mt-1 text-slate-800">
                            Seluruh transaksi, jurnal, barang contoh, dan kontak dummy akan dihapus permanen. Akun login Admin, Owner, dan Akun Perkiraan (COA) tidak akan terhapus.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-800">
                            Kata Sandi Akun Login
                        </label>
                        <TextInput
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan kata sandi Anda"
                            disabled={actionLoading}
                            className="h-[40px] rounded-[4px] border-slate-400"
                            inputClassName="text-sm text-slate-900"
                        />
                        {passwordError ? (
                            <p className="text-sm text-red-600 font-medium">{passwordError}</p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                        <Button
                            size="md"
                            variant="secondary"
                            disabled={actionLoading}
                            onClick={() => setViewMode('overview')}
                            className="h-9 px-4 text-sm rounded-[4px] border-slate-400 text-slate-800 shadow-none"
                        >
                            Batal
                        </Button>
                        <Button
                            size="md"
                            variant="danger"
                            loading={actionLoading}
                            loadingLabel="Membersihkan..."
                            onClick={handlePurge}
                            className="h-9 px-4 text-sm rounded-[4px] shadow-none"
                        >
                            Konfirmasi Bersihkan
                        </Button>
                    </div>
                </div>
            ) : viewMode === 'confirm_reset_tx' ? (
                <div className="space-y-4">
                    <div className="border border-slate-300 rounded-[4px] p-3.5 bg-slate-50 text-sm text-slate-800 leading-relaxed">
                        <p className="font-semibold text-slate-900">Konfirmasi Reset Transaksi Saja</p>
                        <p className="mt-1 text-slate-800">
                            Riwayat transaksi penjualan, pembelian, dan jurnal akan dikosongkan. Nomor urut nota akan kembali ke #0001. Master produk dan kontak Anda tidak akan dihapus.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-800">
                            Kata Sandi Akun Login
                        </label>
                        <TextInput
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan kata sandi Anda"
                            disabled={actionLoading}
                            className="h-[40px] rounded-[4px] border-slate-400"
                            inputClassName="text-sm text-slate-900"
                        />
                        {passwordError ? (
                            <p className="text-sm text-red-600 font-medium">{passwordError}</p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                        <Button
                            size="md"
                            variant="secondary"
                            disabled={actionLoading}
                            onClick={() => setViewMode('overview')}
                            className="h-9 px-4 text-sm rounded-[4px] border-slate-400 text-slate-800 shadow-none"
                        >
                            Batal
                        </Button>
                        <Button
                            size="md"
                            variant="danger"
                            loading={actionLoading}
                            loadingLabel="Mereset..."
                            onClick={handleResetTransactions}
                            className="h-9 px-4 text-sm rounded-[4px] shadow-none"
                        >
                            Konfirmasi Reset Transaksi
                        </Button>
                    </div>
                </div>
            ) : viewMode === 'confirm_reseed' ? (
                <div className="space-y-4">
                    <div className="border border-slate-300 rounded-[4px] p-3.5 bg-slate-50 text-sm text-slate-800 leading-relaxed">
                        <p className="font-semibold text-slate-900">Konfirmasi Muat Ulang Data Sampel</p>
                        <p className="mt-1 text-slate-800">
                            Sistem akan menjalankan seeder database di latar belakang server untuk mengisi kembali barang contoh, transaksi kasir simulasi, dan grafik dashboard lengkap.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                        <Button
                            size="md"
                            variant="secondary"
                            disabled={actionLoading}
                            onClick={() => setViewMode('overview')}
                            className="h-9 px-4 text-sm rounded-[4px] border-slate-400 text-slate-800 shadow-none"
                        >
                            Batal
                        </Button>
                        <Button
                            size="md"
                            variant="brand-blue"
                            loading={actionLoading}
                            loadingLabel="Memuat seeder..."
                            onClick={handleReseed}
                            className="h-9 px-4 text-sm rounded-[4px] shadow-none"
                        >
                            Muat Ulang Sekarang
                        </Button>
                    </div>
                </div>
            ) : null}
        </WorkspaceDialog>
    );
}
