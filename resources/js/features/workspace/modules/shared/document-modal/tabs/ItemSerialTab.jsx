import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { CloseIcon, DownloadIcon } from '@/features/workspace/shared/Icons';

function SerialRow({ value }) {
    return (
        <div className="grid grid-cols-[42px_minmax(0,1fr)] border-b border-table-row-border last:border-b-0">
            <div className="flex items-center justify-center bg-btn-danger-bg text-white">
                <CloseIcon className="h-4 w-4 text-white" strokeWidth={2.4} />
            </div>
            <div className="px-4 py-2 text-xs sm:text-sm text-brand-dark">{value}</div>
        </div>
    );
}

export default function ItemSerialTab({ detail }) {
    const serialNumbers = detail.serialNumbers ?? [];

    return (
        <div className="space-y-3">
            <div className="grid gap-y-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={detail.serialFieldLabel ?? 'Nomor #'} />
                <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-3">
                    <TextInput
                        value={detail.serialInput ?? ''}
                        readOnly
                        placeholder={detail.serialPlaceholder ?? 'Scan Barcode / Ketik lalu [Enter]'}
                        className="h-[36px] rounded-[4px] border-ui-border"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                    <button
                        type="button"
                        className="inline-flex h-[36px] items-center justify-center rounded-[4px] border border-import-action-blue bg-import-action-blue text-white"
                        aria-label={detail.downloadLabel ?? 'Unduh nomor seri'}
                    >
                        <DownloadIcon className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-[4px] border border-table-wrapper-border">
                <div className="grid grid-cols-[42px_minmax(0,1fr)] bg-table-header-bg text-white">
                    <div className="border-r border-white/20" />
                    <div className="px-4 py-2 text-center text-base font-medium">
                        {detail.serialColumnLabel ?? 'Nomor #'}
                    </div>
                </div>
                <div className="max-h-[280px] overflow-y-auto bg-white">
                    {serialNumbers.length ? (
                        serialNumbers.map((serialNumber) => <SerialRow key={serialNumber} value={serialNumber} />)
                    ) : (
                        <div className="px-4 py-6 text-center text-base text-text-placeholder">Tidak ada data</div>
                    )}
                </div>
            </div>

            <div className="text-xs sm:text-sm text-brand-dark">
                {detail.serialCountLabel ?? `${serialNumbers.length} No Seri/Produksi`}
            </div>
        </div>
    );
}
