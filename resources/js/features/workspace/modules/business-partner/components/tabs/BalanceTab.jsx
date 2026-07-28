import { showErrorToast } from '@/components/feedback/toast';
import { PartnerInlineTableSection } from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';

export default function BalanceTab({ config, values, onChange }) {
    const rows = values?.openingBalanceRows ?? values?.receivableRows ?? [];

    return (
        <PartnerInlineTableSection
            title={config.balanceTable.title}
            addButtonTitle="Tambah Saldo Awal"
            modalTitle="Tambah Saldo Awal Baru"
            columns={[
                { id: 'date', label: 'Tanggal' },
                { id: 'amount', label: 'Jumlah', align: 'right', format: (val) => val ? Number(val).toLocaleString('id-ID') : '0' },
                { id: 'currency', label: 'Mata Uang' },
                { id: 'number', label: 'Nomor #' },
                { id: 'notes', label: 'Keterangan' },
            ]}
            items={rows}
            emptyLabel={config.balanceTable.emptyLabel}
            fields={[
                { id: 'date', label: 'Tanggal', type: 'date' },
                { id: 'amount', label: 'Jumlah (Rp)', required: true, sanitize: (val) => val.replace(/[^0-9.]/g, '') },
                { id: 'number', label: 'Nomor #' },
                { id: 'notes', label: 'Keterangan' },
            ]}
            onValidateBeforeOpen={() => {
                if (!values?.name?.trim()) {
                    showErrorToast({
                        title: 'Perhatian',
                        message: 'Nama wajib diisi terlebih dahulu di Tab Umum.',
                    });
                    return false;
                }
                return true;
            }}
            onAdd={(newItem) => onChange('openingBalanceRows', [...rows, { ...newItem, currency: 'Indonesian Rupiah' }])}
            onRemove={(index) => onChange('openingBalanceRows', rows.filter((_, i) => i !== index))}
        />
    );
}
