import { useState, useMemo } from 'react';
import SelectField from '@/components/ui/SelectField';
import { RefreshIcon } from '@/features/workspace/shared/Icons';
import { formatAmountInput, parseAmountInput } from '@/features/workspace/shared/amountFormatting';

export default function ItemSellingPriceTab({ values = {}, detailRow = null }) {
    const [loading, setLoading] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('all');

    const baseUnit = values.primaryUnit?.[0] ?? detailRow?.base_unit ?? null;
    const baseUnitName = baseUnit?.name ?? (typeof baseUnit === 'string' ? baseUnit : (values.unitName ?? 'PCS'));
    const basePrice = parseAmountInput(values.sellPriceLevel1 ?? detailRow?.default_sale_price ?? 0);
    const conversions = Array.isArray(values.unitConversions)
        ? values.unitConversions
        : (Array.isArray(detailRow?.conversions) ? detailRow.conversions : []);

    const priceRows = useMemo(() => {
        if (basePrice <= 0 && conversions.length === 0) {
            return [];
        }

        const rows = [];
        if (basePrice > 0) {
            rows.push({
                id: 'base',
                unitName: baseUnitName,
                price: basePrice,
            });
        }

        conversions.forEach((conv, idx) => {
            const unitName = conv.unitName ?? conv.unit?.[0]?.name ?? conv.name ?? `Satuan ${idx + 2}`;
            const ratio = Number(conv.quantity || 1);
            const price = basePrice > 0 ? basePrice * ratio : parseAmountInput(conv.price ?? 0);
            if (price > 0) {
                rows.push({
                    id: conv.id ?? `conv-${idx}`,
                    unitName,
                    price,
                });
            }
        });

        return rows;
    }, [baseUnitName, basePrice, conversions]);

    const hasPrices = priceRows.length > 0;

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 300);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar: Branch dropdown + refresh button */}
            <div className="flex items-center gap-2">
                <div className="w-[180px] sm:w-[220px]">
                    <SelectField
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e?.target?.value ?? e)}
                        className="h-[34px] rounded-[4px] border-ui-border"
                        selectClassName="text-xs sm:text-sm text-brand-dark"
                        options={[{ value: 'all', label: 'Semua Cabang' }]}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    aria-label="Muat ulang harga jual"
                    className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer disabled:opacity-60 shrink-0"
                >
                    <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Content: Two sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Kolom Kiri: Harga Berlaku Saat Ini */}
                <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-normal text-[#0089d0]">
                        Harga Berlaku Saat Ini
                    </h3>
                    {hasPrices ? (
                        <div className="rounded-[4px] border border-ui-border bg-white">
                            <div className="py-1">
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-ui-border-lightest px-4 py-2.5">
                                    <span className="text-xs sm:text-sm text-brand-dark font-normal">
                                        Kategori Penjualan
                                    </span>
                                    <span className="text-right text-xs sm:text-sm font-semibold text-text-darkest">
                                        [Semua]
                                    </span>
                                </div>
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-ui-border-lightest px-4 py-2.5">
                                    <span className="text-xs sm:text-sm text-brand-dark font-normal">
                                        Harga
                                    </span>
                                    <div className="text-right text-xs sm:text-sm font-semibold text-text-darkest space-y-1">
                                        {priceRows.map((row) => (
                                            <div key={row.id}>
                                                Rp. {formatAmountInput(row.price)} /{row.unitName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5">
                                    <span className="text-xs sm:text-sm text-brand-dark font-normal">
                                        Berlaku di Cabang
                                    </span>
                                    <span className="text-right text-xs sm:text-sm font-semibold text-text-darkest">
                                        Semua Cabang
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[4px] border border-ui-border bg-white py-4 px-3 flex items-center justify-center">
                            <span className="text-xs sm:text-sm font-normal text-brand-dark">
                                Belum ada harga berlaku
                            </span>
                        </div>
                    )}
                </div>

                {/* Kolom Kanan: Harga Jual Mendatang */}
                <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-normal text-[#0089d0]">
                        Harga Jual Mendatang
                    </h3>
                    <div className="rounded-[4px] border border-ui-border bg-white py-4 px-3 flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-normal text-brand-dark">
                            Belum ada harga mendatang
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
