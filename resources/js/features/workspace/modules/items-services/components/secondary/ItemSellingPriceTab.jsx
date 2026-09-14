import { useMemo } from 'react';
import { SectionHeading } from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import { formatAmountInput, parseAmountInput } from '@/features/workspace/shared/amountFormatting';

export default function ItemSellingPriceTab({ values = {}, detailRow = null }) {
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
            const customPrice = conv.price !== undefined && conv.price !== null && conv.price !== ''
                ? parseAmountInput(conv.price)
                : 0;
            const price = customPrice > 0 ? customPrice : (basePrice > 0 ? basePrice * ratio : 0);
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Kolom Kiri: Harga Berlaku Saat Ini */}
            <div className="space-y-3">
                <SectionHeading title="Harga Berlaku Saat Ini" />
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
                <SectionHeading title="Harga Jual Mendatang" />
                <div className="rounded-[4px] border border-ui-border bg-white py-4 px-3 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-normal text-brand-dark">
                        Belum ada harga mendatang
                    </span>
                </div>
            </div>
        </div>
    );
}
