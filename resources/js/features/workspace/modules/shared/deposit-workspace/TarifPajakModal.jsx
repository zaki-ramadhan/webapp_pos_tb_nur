import { useState, useEffect, useMemo } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import { formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';

const PREDEFINED_RATES = [
    { value: 0, label: '0%' },
    { value: 10, label: '10%' },
    { value: 11, label: '11%' },
    { value: 12, label: '12%' },
];

export default function TarifPajakModal({
    open,
    onClose,
    baseAmount = 0,
    taxIncluded = false,
    currentDppPercent = 100,
    currentTaxRate = 11,
    onApply,
}) {
    const [dppType, setDppType] = useState(() => {
        if (Math.abs(currentDppPercent - (11 / 12) * 100) < 0.1) return '11/12';
        if (currentDppPercent === 100) return '100';
        return 'custom';
    });
    const [customDpp, setCustomDpp] = useState(() => String(currentDppPercent || 100));
    const [taxRate, setTaxRate] = useState(() => currentTaxRate ?? 11);

    useEffect(() => {
        if (open) {
            if (Math.abs(currentDppPercent - (11 / 12) * 100) < 0.1) {
                setDppType('11/12');
            } else if (currentDppPercent === 100) {
                setDppType('100');
            } else {
                setDppType('custom');
                setCustomDpp(String(currentDppPercent));
            }
            setTaxRate(currentTaxRate ?? 11);
        }
    }, [open, currentDppPercent, currentTaxRate]);

    const resolvedDppFactor = useMemo(() => {
        if (dppType === '100') return 1.0;
        if (dppType === '11/12') return 11 / 12;
        const parsed = parseFloat(customDpp);
        return Number.isFinite(parsed) && parsed > 0 ? parsed / 100 : 1.0;
    }, [dppType, customDpp]);

    const preview = useMemo(() => {
        const rateDecimal = (taxRate || 0) / 100;
        let dpp = baseAmount * resolvedDppFactor;
        let tax = 0;

        if (rateDecimal > 0) {
            if (taxIncluded) {
                dpp = baseAmount / (1 + rateDecimal * resolvedDppFactor);
                tax = Math.round((dpp * resolvedDppFactor) * rateDecimal);
            } else {
                tax = Math.round(dpp * rateDecimal);
            }
        }

        return {
            dpp: Math.round(dpp),
            tax,
            total: taxIncluded ? baseAmount : baseAmount + tax,
        };
    }, [baseAmount, resolvedDppFactor, taxRate, taxIncluded]);

    const handleApply = () => {
        const dppPercent = dppType === '100' ? 100 : (dppType === '11/12' ? (11 / 12) * 100 : (parseFloat(customDpp) || 100));
        onApply?.({
            dppPercent,
            dppFactor: resolvedDppFactor,
            taxRate,
        });
        onClose();
    };

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Pengaturan Nilai & Tarif Pajak (PPN)"
            closeLabel="Tutup modal pengaturan pajak"
            maxWidthClassName="max-w-[480px]"
            footer={
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose} className="rounded-[4px] px-4 py-1.5 text-xs sm:text-sm">
                        Batal
                    </Button>
                    <Button type="button" variant="brand-blue" onClick={handleApply} className="rounded-[4px] px-5 py-1.5 text-xs sm:text-sm">
                        Terapkan
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-5 text-brand-dark">
                {/* Bagian 1: Dasar Pengenaan Pajak (DPP) */}
                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">
                        Dasar Pengenaan Pajak (DPP)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            aria-label="Pilih DPP 100 persen"
                            onClick={() => setDppType('100')}
                            className={`h-9 px-3 text-xs font-medium rounded-[4px] border transition cursor-pointer ${
                                dppType === '100'
                                    ? 'border-brand-blue-accent bg-brand-blue-lightest text-brand-blue-accent font-semibold shadow-sm'
                                    : 'border-ui-border bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            100% (Normal)
                        </button>
                        <button
                            type="button"
                            aria-label="Pilih DPP 11 per 12"
                            onClick={() => setDppType('11/12')}
                            className={`h-9 px-3 text-xs font-medium rounded-[4px] border transition cursor-pointer ${
                                dppType === '11/12'
                                    ? 'border-brand-blue-accent bg-brand-blue-lightest text-brand-blue-accent font-semibold shadow-sm'
                                    : 'border-ui-border bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            11/12 (Nilai Lain)
                        </button>
                        <button
                            type="button"
                            aria-label="Pilih DPP Kustom"
                            onClick={() => setDppType('custom')}
                            className={`h-9 px-3 text-xs font-medium rounded-[4px] border transition cursor-pointer ${
                                dppType === 'custom'
                                    ? 'border-brand-blue-accent bg-brand-blue-lightest text-brand-blue-accent font-semibold shadow-sm'
                                    : 'border-ui-border bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            Kustom %
                        </button>
                    </div>

                    {dppType === 'custom' && (
                        <div className="mt-2.5 flex items-center gap-2">
                            <span className="text-xs text-slate-600">Persentase DPP:</span>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                step="0.01"
                                value={customDpp}
                                onChange={(e) => setCustomDpp(e.target.value)}
                                className="h-8 w-24 rounded-[4px] border border-ui-border px-2 text-right text-xs font-medium text-brand-dark outline-none focus:border-brand-blue-accent"
                            />
                            <span className="text-xs text-slate-600">%</span>
                        </div>
                    )}
                </div>

                {/* Bagian 2: Tarif Pajak (PPN) */}
                <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">
                        Tarif Pajak (PPN)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {PREDEFINED_RATES.map((rateItem) => (
                            <button
                                key={rateItem.value}
                                type="button"
                                aria-label={`Pilih tarif ${rateItem.label}`}
                                onClick={() => setTaxRate(rateItem.value)}
                                className={`h-9 px-3 text-xs font-medium rounded-[4px] border transition cursor-pointer ${
                                    taxRate === rateItem.value
                                        ? 'border-brand-blue-accent bg-brand-blue-lightest text-brand-blue-accent font-semibold shadow-sm'
                                        : 'border-ui-border bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {rateItem.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bagian 3: Ringkasan Kalkulasi Real-time */}
                <div className="rounded-[4px] border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                        <span>Dasar Pengenaan Pajak (DPP):</span>
                        <span className="font-medium text-slate-800 tabular-nums">Rp {formatCurrencyValue(preview.dpp)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>Pajak (PPN {taxRate}%):</span>
                        <span className="font-semibold text-brand-blue-accent tabular-nums">Rp {formatCurrencyValue(preview.tax)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-semibold text-slate-900">
                        <span>Total Transaksi:</span>
                        <span className="tabular-nums">Rp {formatCurrencyValue(preview.total)}</span>
                    </div>
                </div>
            </div>
        </WorkspaceDialog>
    );
}
